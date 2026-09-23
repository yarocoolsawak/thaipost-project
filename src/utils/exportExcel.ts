import type { CaseItem } from '../types/case';
import { ISSUE_CATEGORY_META } from '../components/common/IssueBadge';

export function exportCasesToExcel(cases: CaseItem[], filenamePrefix = 'ThaiPost_Cases'): void {
  // Column Headers in Thai
  const headers = [
    'Case ID',
    'หมายเลขพัสดุ (Tracking No)',
    'บริษัทคู่ค้า',
    'ผู้แจ้งเรื่อง',
    'ช่องทางรับเรื่อง',
    'ที่ทำการปลายทาง',
    'กลุ่ม CEC',
    'หมวดปัญหา',
    'รายละเอียดปัญหา/คำร้อง',
    'ระดับความเร่งด่วน',
    'สถานะเคส',
    'จำนวนอีเมลคำร้องที่ส่ง',
    'วันเวลาที่สร้าง',
    'กำหนด SLA 3 วัน',
    'เกิน SLA หรือไม่',
    'คำตอบล่าสุด (Approved Answer)',
    'ผลการโทรติดต่อสาขา (Branch Outcome)'
  ];

  const rows = cases.map(c => {
    const branchOutcome = c.branchContactLogs[0]?.outcome || '-';
    const approvedAnswer = c.centralReview?.approvedAnswer || c.cecReply?.answer || '-';
    const isExceeded = c.isSlaExceeded ? 'เกินกำหนด' : 'อยู่ในเกณฑ์';
    const categoryTh = ISSUE_CATEGORY_META[c.category]?.label || c.category;
    const emailCount = c.emails ? `${c.emails.length} ฉบับ` : '0 ฉบับ';

    return [
      c.id,
      c.trackingNumber,
      c.companyName,
      c.contactPerson,
      c.contactChannel,
      c.assignedBranchName || c.parcelInfo.destPostOffice,
      c.assignedCecName || '-',
      categoryTh,
      (c.customerInquiry || '-').replace(/"/g, '""'),
      c.urgency,
      c.status,
      emailCount,
      new Date(c.createdAt).toLocaleString('th-TH'),
      new Date(c.slaDeadline).toLocaleString('th-TH'),
      isExceeded,
      approvedAnswer.replace(/"/g, '""'),
      branchOutcome.replace(/"/g, '""')
    ];
  });

  // Construct CSV content with quotes escaping
  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(val => `"${val}"`).join(','))
  ].join('\r\n');

  // Add UTF-8 BOM so Excel opens Thai characters without encoding issues
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

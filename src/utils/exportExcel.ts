import type { CaseItem } from '../types/case';
import { ISSUE_CATEGORY_META } from '../components/common/IssueBadge';
import { notify } from './dialog';

// When the demo runs inside the Claude artifact viewer, pages cannot start downloads themselves;
// the viewer's `downloads` capability asks the viewer to save the file instead.
type DownloadsApi = { save: (req: { filename: string; data: Blob }) => Promise<unknown> };
type ClaudeRuntime = { use?: (name: string) => Promise<unknown> };

const getViewerDownloads = async (): Promise<DownloadsApi | null> => {
  const runtime = (window as unknown as { claude?: ClaudeRuntime }).claude;
  if (!runtime?.use) return null;
  return ((await runtime.use('downloads')) as DownloadsApi | null) ?? null;
};

export async function exportCasesToExcel(cases: CaseItem[], filenamePrefix = 'ThaiPost_Cases'): Promise<void> {
  // Column Headers in Thai
  const headers = [
    'Case ID',
    'หมายเลขพัสดุ (Tracking No)',
    'ร้านค้า (MyOrder)',
    'ผู้แจ้งเรื่อง',
    'เลขคำสั่งซื้อ MyOrder',
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
    const emailCount = `${c.emails?.length || 0} ฉบับ`;

    return [
      c.id,
      c.trackingNumber,
      c.companyName,
      c.contactPerson,
      c.myOrderRef.orderId,
      c.assignedBranchName || c.parcelInfo.destPostOffice,
      c.assignedCecName || 'รอระบุ CEC',
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
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}_${dateStr}.csv`;

  const viewerDownloads = await getViewerDownloads();
  if (viewerDownloads) {
    try {
      await viewerDownloads.save({ filename, data: blob });
    } catch (err) {
      const code = (err as { code?: string })?.code;
      // The viewer choosing "no" is not an error worth reporting
      if (code !== 'declined') {
        notify('ดาวน์โหลดไฟล์ Excel ไม่ได้ในหน้านี้ ลองเปิดเดโมในเบราว์เซอร์โดยตรง', { title: 'Export ไม่สำเร็จ', tone: 'danger' });
      }
    }
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

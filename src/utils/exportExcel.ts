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
    'รหัสสถานะ THP (Code)',
    'สถานะพัสดุ THP/QMS',
    'ร้านค้า (MyOrder)',
    'ผู้แจ้งเรื่อง',
    'เลขคำสั่งซื้อ MyOrder',
    'ที่ทำการปลายทาง',
    'กลุ่ม CEC',
    'หมวดปัญหา',
    'รายละเอียดปัญหา/คำร้อง',
    'ระดับความเร่งด่วน',
    'สถานะเคส',
    'วันเวลาที่สร้าง',
    'วันเปิดถุง (นับ SLA)',
    'เส้นทาง & เกณฑ์ SLA',
    'กำหนดส่งตาม SLA',
    'เกิน SLA หรือไม่',
    'SLA เก็บพัสดุ 7 วัน',
    'การโทรติดต่อผู้รับ (จนท. 3 + แอดมิน 1)',
    'หลักฐานภาพถ่าย POD',
    'คอนเฟิร์มผู้รับปลายทาง',
    'คำตอบล่าสุด (Approved Answer)',
    'ผลการโทรติดต่อสาขา (Branch Outcome)'
  ];

  const rows = cases.map(c => {
    const branchOutcome = c.branchContactLogs[0]?.outcome || '-';
    const approvedAnswer = c.centralReview?.approvedAnswer || c.cecReply?.answer || '-';
    const isExceeded = c.isSlaExceeded ? 'เกินกำหนด' : 'อยู่ในเกณฑ์';
    const categoryTh = ISSUE_CATEGORY_META[c.category]?.label || c.category;
    const bagOpenedDate = c.bagOpenedAt ? new Date(c.bagOpenedAt).toLocaleString('th-TH') : '-';
    const routeRule = c.slaTargetDays === 5 ? 'ข้ามจังหวัด (3-5 วัน)' : 'กทม./ภาคเดียวกัน (3 วัน)';
    const retentionDate = c.retentionDeadline ? new Date(c.retentionDeadline).toLocaleString('th-TH') : '-';
    const callsSummary = c.callAttempts && c.callAttempts.length > 0
      ? `โทรแล้ว ${c.callAttempts.length}/4 ครั้ง (ล่าสุด: ${c.callAttempts[c.callAttempts.length - 1].outcomeLabel})`
      : 'ยังไม่มีบันทึกโทร';
    const podStatus = (c.deliveryProofPhotoUrl || c.parcelInfo?.deliveryProofPhotoUrl) ? 'มีภาพหลักฐาน (POD)' : 'ไม่มีภาพ';
    const recipientConfirmed = c.recipientConfirmedReceived ? 'ยืนยันได้รับจริง' : 'ยังไม่ได้คอนเฟิร์ม';
    const thpStatusCode = c.parcelInfo?.currentStatusCode || '-';
    const thpPostalStatus = c.parcelInfo?.currentPostalStatus || '-';

    return [
      c.id,
      c.trackingNumber,
      thpStatusCode,
      thpPostalStatus.replace(/"/g, '""'),
      c.companyName,
      c.contactPerson,
      c.myOrderRef.orderId,
      c.assignedBranchName || c.parcelInfo.destPostOffice,
      c.assignedCecName || 'รอระบุ CEC',
      categoryTh,
      (c.customerInquiry || '-').replace(/"/g, '""'),
      c.urgency,
      c.status,
      new Date(c.createdAt).toLocaleString('th-TH'),
      bagOpenedDate,
      routeRule,
      new Date(c.slaDeadline).toLocaleString('th-TH'),
      isExceeded,
      retentionDate,
      callsSummary,
      podStatus,
      recipientConfirmed,
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

import React, { createContext, useContext, useState } from 'react';
import type { CaseItem, EmailPayload, IssueCategory, UrgencyLevel } from '../types/case';
import { INITIAL_MYORDER_ORDERS, MYORDER_SHOPS, isShippedOrder } from '../data/myOrders';
import type { MyOrder, MyOrderShop } from '../data/myOrders';
import { useCases } from './CaseContext';
import type { MyOrderCaseFilter } from '../components/myorder/caseFilters';

export interface ReportIssueParams {
  category: IssueCategory;
  urgency: UrgencyLevel;
  description: string;
  reporterName: string;
  attachments: string[];
  emailDispatch?: Omit<EmailPayload, 'senderName'>;
  forceNewCase?: boolean; // open a new case even if the parcel already has an open one
}

// One line of an admin bulk report (e.g. paste 10 tracking numbers to request "เร่งนำส่ง")
export type BulkLineStatus = 'NEW_CASE' | 'EXISTING_CASE' | 'NOT_FOUND' | 'NOT_SHIPPED';

export interface BulkLinePreview {
  trackingNumber: string;
  status: BulkLineStatus;
  order?: MyOrder;
  shop?: MyOrderShop;
  existingCase?: CaseItem;
}

export interface BulkReportParams {
  category: IssueCategory;
  urgency: UrgencyLevel;
  description: string;
  adminName: string;
  // One official email per parcel; {เลขพัสดุ} {ร้านค้า} {ผู้รับ} are filled in for each line
  emailTemplate?: Omit<EmailPayload, 'senderName'>;
}

export const BULK_EMAIL_TOKENS = { tracking: '{เลขพัสดุ}', shop: '{ร้านค้า}', receiver: '{ผู้รับ}' };

export interface BulkLineResult {
  trackingNumber: string;
  outcome: 'CREATED' | 'LINKED' | 'SKIPPED';
  reason?: string;
  caseItem?: CaseItem;
  shop?: MyOrderShop;
  emailSent?: boolean;
}

export interface ReportIssueResult {
  caseItem: CaseItem;
  linkedToExisting: boolean;
  emailSent: boolean;
}

interface MyOrderContextType {
  shops: MyOrderShop[];
  selectedShopId: string;
  setSelectedShopId: (id: string) => void;
  currentShop: MyOrderShop;
  orders: MyOrder[];
  // Cases visible on the MyOrder side: the current shop's cases for a merchant, every shop (or the picked shop) for MyOrder admin
  myOrderCases: CaseItem[];
  caseFilter: MyOrderCaseFilter;
  setCaseFilter: (f: MyOrderCaseFilter) => void;
  adminShopFilter: string; // 'ALL' or shop id
  setAdminShopFilter: (id: string) => void;
  reportOrderIssue: (orderId: string, params: ReportIssueParams) => Promise<ReportIssueResult>;
  previewBulkReport: (trackingNumbers: string[]) => BulkLinePreview[];
  // newCaseFor: tracking numbers with an open case where the admin chose "create new" instead of following the old one
  submitBulkReport: (lines: BulkLinePreview[], params: BulkReportParams, newCaseFor?: Set<string>) => Promise<BulkLineResult[]>;
}

const MyOrderContext = createContext<MyOrderContextType | undefined>(undefined);

export const MyOrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, dateScopedCases: cases, createCase, checkDuplicate, linkToExistingCase, sendOfficialEmail } = useCases();
  const [orders, setOrders] = useState<MyOrder[]>(INITIAL_MYORDER_ORDERS);
  const [selectedShopId, setSelectedShopId] = useState<string>(MYORDER_SHOPS[0].id);

  const [caseFilter, setCaseFilter] = useState<MyOrderCaseFilter>('ALL');
  const [adminShopFilter, setAdminShopFilter] = useState('ALL');

  const currentShop = MYORDER_SHOPS.find(s => s.id === selectedShopId) || MYORDER_SHOPS[0];

  // Merchant: cases linked to the shop's orders (covers reports merged into another open case) or raised by the shop
  const shopCaseIds = new Set(orders.filter(o => o.shopId === currentShop.id && o.caseId).map(o => o.caseId));
  const myOrderCases = (
    role === 'MERCHANT'
      ? cases.filter(c => shopCaseIds.has(c.id) || c.myOrderRef.shopId === currentShop.id)
      : cases.filter(c => adminShopFilter === 'ALL' || c.myOrderRef.shopId === adminShopFilter)
  ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // Merchant reports a problem on a shipped order -> goes straight into the ThaiPost case system
  const reportOrderIssue = async (orderId: string, params: ReportIssueParams): Promise<ReportIssueResult> => {
    const order = orders.find(o => o.orderId === orderId);
    if (!order || !order.trackingNumber || !isShippedOrder(order)) {
      throw new Error('คำสั่งซื้อนี้ยังไม่ได้จัดส่ง ไม่สามารถแจ้งปัญหาได้');
    }
    const shop = MYORDER_SHOPS.find(s => s.id === order.shopId) || currentShop;

    // Same parcel already has an open case -> attach to it instead of opening a duplicate
    const existing = checkDuplicate(order.trackingNumber);
    let caseItem: CaseItem;
    if (existing && !params.forceNewCase) {
      linkToExistingCase(existing.id, params.description, `${params.reporterName} (${shop.name} via MyOrder)`);
      if (params.emailDispatch) {
        sendOfficialEmail(existing.id, { ...params.emailDispatch, senderName: params.reporterName });
      }
      caseItem = existing;
    } else {
      caseItem = await createCase({
        trackingNumber: order.trackingNumber,
        contactPerson: params.reporterName,
        myOrderRef: { orderId: order.orderId, shopId: shop.id, shopName: shop.name },
        attachments: params.attachments,
        category: params.category,
        urgency: params.urgency,
        customerInquiry: params.description,
        emailDispatch: params.emailDispatch,
        duplicateOfCaseId: existing?.id
      });
    }

    setOrders(prev => prev.map(o => (o.orderId === orderId ? { ...o, caseId: caseItem.id } : o)));
    return { caseItem, linkedToExisting: !!existing && !params.forceNewCase, emailSent: !!params.emailDispatch };
  };

  // Match pasted tracking numbers against MyOrder orders and open cases
  const previewBulkReport = (trackingNumbers: string[]): BulkLinePreview[] =>
    trackingNumbers.map(trackingNumber => {
      const order = orders.find(o => o.trackingNumber === trackingNumber);
      if (!order) return { trackingNumber, status: 'NOT_FOUND' };
      const shop = MYORDER_SHOPS.find(s => s.id === order.shopId);
      if (!isShippedOrder(order)) return { trackingNumber, status: 'NOT_SHIPPED', order, shop };
      const existingCase = checkDuplicate(trackingNumber);
      return existingCase
        ? { trackingNumber, status: 'EXISTING_CASE', order, shop, existingCase }
        : { trackingNumber, status: 'NEW_CASE', order, shop };
    });

  // MyOrder admin reports many parcels at once; each parcel gets its own case (routed to its own CEC)
  const submitBulkReport = async (
    lines: BulkLinePreview[],
    params: BulkReportParams,
    newCaseFor: Set<string> = new Set()
  ): Promise<BulkLineResult[]> => {
    const results = await Promise.all(
      lines.map(async (line): Promise<BulkLineResult> => {
        if (!line.order || !line.shop || line.status === 'NOT_FOUND' || line.status === 'NOT_SHIPPED') {
          return {
            trackingNumber: line.trackingNumber,
            outcome: 'SKIPPED',
            reason: line.status === 'NOT_SHIPPED' ? 'คำสั่งซื้อยังไม่จัดส่ง' : 'ไม่พบในคำสั่งซื้อ MyOrder'
          };
        }
        const fill = (text: string) =>
          text
            .split(BULK_EMAIL_TOKENS.tracking).join(line.trackingNumber)
            .split(BULK_EMAIL_TOKENS.shop).join(line.shop!.name)
            .split(BULK_EMAIL_TOKENS.receiver).join(line.order!.customerName);
        const email = params.emailTemplate
          ? { ...params.emailTemplate, subject: fill(params.emailTemplate.subject), body: fill(params.emailTemplate.body) }
          : undefined;
        if (line.status === 'EXISTING_CASE' && line.existingCase && !newCaseFor.has(line.trackingNumber)) {
          linkToExistingCase(line.existingCase.id, params.description, `${params.adminName} (Bulk)`, 'MYORDER_ADMIN');
          if (email) sendOfficialEmail(line.existingCase.id, { ...email, senderName: params.adminName, sentByRole: 'MYORDER_ADMIN' });
          return { trackingNumber: line.trackingNumber, outcome: 'LINKED', caseItem: line.existingCase, shop: line.shop, emailSent: !!email };
        }
        const caseItem = await createCase({
          trackingNumber: line.trackingNumber,
          contactPerson: line.shop.ownerName,
          myOrderRef: { orderId: line.order.orderId, shopId: line.shop.id, shopName: line.shop.name },
          category: params.category,
          urgency: params.urgency,
          customerInquiry: params.description,
          reportedBy: { role: 'MYORDER_ADMIN', name: params.adminName },
          emailDispatch: email,
          duplicateOfCaseId: line.existingCase?.id
        });
        return { trackingNumber: line.trackingNumber, outcome: 'CREATED', caseItem, shop: line.shop, emailSent: !!email };
      })
    );

    const linkedByOrder = new Map(
      results.filter(r => r.caseItem).map(r => [lines.find(l => l.trackingNumber === r.trackingNumber)!.order!.orderId, r.caseItem!.id])
    );
    setOrders(prev => prev.map(o => (linkedByOrder.has(o.orderId) ? { ...o, caseId: linkedByOrder.get(o.orderId) } : o)));
    return results;
  };

  return (
    <MyOrderContext.Provider
      value={{
        shops: MYORDER_SHOPS,
        selectedShopId,
        setSelectedShopId,
        currentShop,
        orders,
        myOrderCases,
        caseFilter,
        setCaseFilter,
        adminShopFilter,
        setAdminShopFilter,
        reportOrderIssue,
        previewBulkReport,
        submitBulkReport
      }}
    >
      {children}
    </MyOrderContext.Provider>
  );
};

export const useMyOrder = () => {
  const context = useContext(MyOrderContext);
  if (!context) {
    throw new Error('useMyOrder must be used within a MyOrderProvider');
  }
  return context;
};

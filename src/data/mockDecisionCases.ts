import decisionCasesJson from './mockDecisionCases.json';

export interface DecisionCase {
  case_id: string;
  tracking_no: string;
  reported_at: string;
  case_type:
    | 'EXPEDITE_DELIVERY'
    | 'CLOSE_WORK_REQUEST'
    | 'REDELIVER_REQUEST'
    | 'URGENT_REDELIVERY_REQUEST'
    | 'RETURN_REQUEST'
    | 'REVERSE_RETURN_REQUEST'
    | 'STATUS_CHECK_REQUEST';
  issue_message: string;
  origin_province: string;
  destination_province: string;
  destination_area_type: 'BANGKOK' | 'SAME_REGION' | 'CROSS_PROVINCE';
  bag_opened_at: string;
  latest_status: string;
  latest_status_at: string;
  shipment_timeline: Array<{
    event_at: string;
    status_code: string;
    status_description: string;
    location: string;
    recipient_sign: string | null;
  }>;
  delivery_attempt_count: number;
  last_delivery_attempt_result: string;
  proof_of_delivery: 'YES' | 'NO' | 'UNCLEAR';
  recipient_name: string;
  signed_by: string;
  customer_claim: string;
  contact_attempt_count: number;
  contact_history: Array<{
    attempt_no: number;
    called_by: 'BRANCH_STAFF' | 'ADMIN_MYORDER';
    called_at: string;
    phone_number: string;
    result: 'CONNECTED' | 'NO_ANSWER' | 'BUSY' | 'CALL_BACK_LATER' | 'NUMBER_UNAVAILABLE';
    note: string;
  }>;
  sla_type: 'STANDARD_3DAYS' | 'STANDARD_5DAYS' | 'RETENTION_7DAYS';
  sla_due_at: string;
  sla_status: 'WITHIN' | 'NEAR' | 'EXCEEDED';
  cec_group: string;
  cec_status: 'NOT_SENT' | 'PENDING_REPLY' | 'REPLIED_COMPLETE' | 'REPLIED_INCOMPLETE' | 'OVERDUE';
  branch_contact_status: 'NOT_CONTACTED' | 'LINE_BUSY' | 'BRANCH_CONFIRMED' | 'BRANCH_INVESTIGATING';
  customer_contact_required: 'YES' | 'NO';
  recommended_next_action: string;
  possible_actions: string[];
  hidden_actions: string[];
  verification_required: string;
  final_reply: string;
  close_case: 'YES' | 'NO';
  close_reason: string;
  risk_or_exception_note: string;
}

export const MOCK_DECISION_CASES: DecisionCase[] = decisionCasesJson as DecisionCase[];

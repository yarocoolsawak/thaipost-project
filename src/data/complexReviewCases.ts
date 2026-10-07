import complexReviewJson from './complexReviewCases.json';

export interface InvestigationChecklistItem {
  item: string;
  status: 'VERIFIED' | 'FAILED' | 'WARNING' | 'SUSPICIOUS' | 'IDENTIFIED' | 'FOUND' | 'CRITICAL' | 'EXECUTED' | 'AGREED' | 'RESTRICTED' | 'LOCKED' | 'FORGERY_SUSPECTED' | 'ANOMALY' | 'HIGH_VALUE' | 'CONFIRMED' | 'CORRECTED';
  finding: string;
}

export interface ComplexReviewCase {
  case_id: string;
  tracking_no: string;
  case_name: string;
  case_type: string;
  review_complexity: 'VERY_HIGH' | 'EXTREME';
  urgency_level: 'HIGH' | 'CRITICAL';
  origin_province: string;
  destination_province: string;
  destination_area_type: 'BANGKOK' | 'SAME_REGION' | 'CROSS_PROVINCE';
  bag_opened_at: string;
  latest_status: string;
  latest_status_at: string;
  issue_message: string;
  conflicting_parties: string;
  investigation_checklist: InvestigationChecklistItem[];
  delivery_attempt_count: number;
  proof_of_delivery: 'YES' | 'NO' | 'UNCLEAR';
  recipient_name: string;
  signed_by: string;
  contact_attempt_count: number;
  contact_history: Array<{
    attempt_no: number;
    called_by: string;
    called_at: string;
    phone_number: string;
    result: string;
    note: string;
  }>;
  sla_type: string;
  sla_due_at: string;
  sla_status: 'WITHIN' | 'NEAR' | 'EXCEEDED';
  cec_group: string;
  cec_status: string;
  branch_contact_status: string;
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

export const COMPLEX_REVIEW_CASES: ComplexReviewCase[] = complexReviewJson as ComplexReviewCase[];

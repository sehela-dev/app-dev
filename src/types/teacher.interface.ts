export interface ITeacherSession {
  id: string;
  session_id: string;
  session_name: string;
  class_name: string | null;
  start_datetime: string;
  end_datetime: string;
  type: string;
  level: string;
  place: string;
  location: string | null;
  status: string;
  capacity: number;
  booked_count: number;
  attended_count: number;
  no_show_count: number;
}

export interface ITeacherRosterRow {
  id: string;
  full_name: string | null;
  instagram_username: string | null;
  medical_notes: string | null;
  notes: string | null;
  attendance_status: "attended" | "no_show" | null;
}

export interface ITeacherSessionDetail extends ITeacherSession {
  roster: ITeacherRosterRow[];
}

export interface ITeacherEarningsSession {
  session_id: string;
  session_name: string;
  class_name: string | null;
  session_date: string;
  session_type: string;
  session_place: string;
  fee: number;
}

export interface ITeacherEarnings {
  period: string;
  period_label: string;
  period_start: string;
  period_end: string;
  source: "invoice" | "cache";
  provisional: boolean;
  total_payment: number;
  lifetime_total: number;
  sessions: ITeacherEarningsSession[];
}

export interface ITeacherInvoice {
  id: string;
  report_year: number;
  report_month: number;
  period_start: string;
  period_end: string;
  total_payment: number;
  generated_at: string;
  status: "invoiced" | "paid";
  paid_at?: string;
  paid_reference?: string;
}

export interface ITeacherInvoiceDownload {
  report_id: string;
  file_name: string | null;
  expires_in: number;
  download_url: string;
}

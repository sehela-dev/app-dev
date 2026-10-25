// ----------------------------------------------------------------------
// Waitlist — POST/GET /profile/sessions/:id/waitlist
// ----------------------------------------------------------------------

export interface IWaitlistStatus {
  is_waitlisted: boolean;
  joined_at: string | null;
  notified_at: string | null;
  waitlist_count: number;
  is_booked?: boolean;
  booking_status?: string | null;
}

export interface IWaitlistResponse {
  success: boolean;
  data: IWaitlistStatus;
}

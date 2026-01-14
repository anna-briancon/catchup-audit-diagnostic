export interface RSVP {
  id: number;
  event_id: number;
  user_id: number;
  status: "pending" | "accepted" | "declined";
  created_at: Date;
}

export interface RSVPCreateDto {
  event_id: number;
  user_id: number;
  status?: "pending" | "accepted" | "declined";
}

export type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export interface Event {
  id: number;
  organizer_id: number;
  title: string;
  description: string;
  location: string;
  event_date: Date;
  max_attendees: number;
  status: EventStatus;
  created_at: Date;
  updated_at: Date;
}

export interface EventCreateDto {
  organizer_id: number;
  title: string;
  description?: string;
  location: string;
  event_date: Date;
  max_attendees?: number;
  status?: EventStatus;
}

export interface EventFilters {
  status?: EventStatus;
  search?: string;
}

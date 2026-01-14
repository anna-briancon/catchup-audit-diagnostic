import pool from "../config/database";
import { Event, EventCreateDto, EventFilters } from "../models/Event";

export class EventRepository {
  async findAll(filters?: EventFilters): Promise<Event[]> {
    let query = "SELECT * FROM events WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.search) {
      query += ` AND title ILIKE $${paramIndex}`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    query += " ORDER BY event_date ASC";

    const result = await pool.query(query, params);
    return result.rows;
  }

  async findById(id: number): Promise<Event | null> {
    const result = await pool.query("SELECT * FROM events WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  async create(event: EventCreateDto): Promise<Event> {
    const result = await pool.query(
      `INSERT INTO events (organizer_id, title, description, location, event_date, max_attendees, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        event.organizer_id,
        event.title,
        event.description || "",
        event.location,
        event.event_date,
        event.max_attendees || 100,
        event.status || "upcoming",
      ]
    );
    return result.rows[0];
  }

  async countByStatus(status: string): Promise<number> {
    const result = await pool.query(
      "SELECT COUNT(*) as count FROM events WHERE status = $1",
      [status]
    );
    return parseInt(result.rows[0].count);
  }

  async getTotalAttendees(): Promise<number> {
    const result = await pool.query(
      "SELECT COUNT(*) as total FROM rsvps WHERE status = 'accepted'"
    );
    return parseInt(result.rows[0].total || "0");
  }
}

export default new EventRepository();

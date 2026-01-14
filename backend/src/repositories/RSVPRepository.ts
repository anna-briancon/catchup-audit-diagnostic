import pool from "../config/database";
import { RSVP, RSVPCreateDto } from "../models/RSVP";

export class RSVPRepository {
  async findByEventAndUser(
    eventId: number,
    userId: number
  ): Promise<RSVP | null> {
    const result = await pool.query(
      "SELECT * FROM rsvps WHERE event_id = $1 AND user_id = $2",
      [eventId, userId]
    );
    return result.rows[0] || null;
  }

  async create(rsvp: RSVPCreateDto): Promise<RSVP> {
    const result = await pool.query(
      "INSERT INTO rsvps (event_id, user_id, status) VALUES ($1, $2, $3) RETURNING *",
      [rsvp.event_id, rsvp.user_id, rsvp.status || "pending"]
    );
    return result.rows[0];
  }

  async updateStatus(
    id: number,
    status: "pending" | "accepted" | "declined"
  ): Promise<RSVP | null> {
    const result = await pool.query(
      "UPDATE rsvps SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    return result.rows[0] || null;
  }

  async countByEvent(eventId: number): Promise<number> {
    const result = await pool.query(
      "SELECT COUNT(*) as count FROM rsvps WHERE event_id = $1 AND status = 'accepted'",
      [eventId]
    );
    return parseInt(result.rows[0].count);
  }
}

export default new RSVPRepository();

import eventRepository from "../repositories/EventRepository";
import pool from "../config/database";

export class DashboardService {
  async getSummary() {
    const upcomingCount = await eventRepository.countByStatus("upcoming");
    const ongoingCount = await eventRepository.countByStatus("ongoing");
    const completedCount = await eventRepository.countByStatus("completed");
    const totalAttendees = await eventRepository.getTotalAttendees();

    const recentEventsResult = await pool.query(
      "SELECT * FROM events ORDER BY created_at DESC LIMIT 5"
    );

    return {
      eventsByStatus: {
        upcoming: upcomingCount,
        ongoing: ongoingCount,
        completed: completedCount,
      },
      totalEvents: upcomingCount + ongoingCount + completedCount,
      totalAttendees: totalAttendees,
      recentEvents: recentEventsResult.rows,
    };
  }
}

export default new DashboardService();

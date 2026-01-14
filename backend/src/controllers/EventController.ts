import { Request, Response } from "express";
import eventService from "../services/EventService";

export class EventController {
  async getEvents(req: Request, res: Response) {
    try {
      const { status, search } = req.query;

      const events = await eventService.getEvents({
        status: status as any,
        search: search as string,
      });

      res.json(events);
    } catch (error) {
      console.error("Get events error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createEvent(req: Request, res: Response) {
    try {
      const { title, description, location, event_date, max_attendees } = req.body;
      const userId = (req as any).userId;

      if (!title || title.trim().length === 0) {
        return res.status(400).json({ error: "Event title is required" });
      }

      if (!location || location.trim().length === 0) {
        return res.status(400).json({ error: "Event location is required" });
      }

      if (!event_date) {
        return res.status(400).json({ error: "Event date is required" });
      }

      const event = await eventService.createEvent({
        organizer_id: userId,
        title,
        description,
        location,
        event_date: new Date(event_date),
        max_attendees: max_attendees ? parseInt(max_attendees) : 100,
      });

      res.status(201).json(event);
    } catch (error) {
      console.error("Create event error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async rsvpToEvent(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.id);
      const userId = (req as any).userId;

      const rsvp = await eventService.rsvpToEvent(eventId, userId);

      res.status(201).json(rsvp);
    } catch (error: any) {
      console.error("RSVP error:", error);
      
      if (error.message === "Event not found") {
        return res.status(404).json({ error: error.message });
      }
      
      if (error.message === "Already RSVP'd to this event" || error.message === "Event is full") {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default new EventController();

import eventRepository from "../repositories/EventRepository";
import rsvpRepository from "../repositories/RSVPRepository";
import { EventCreateDto, EventFilters } from "../models/Event";

export class EventService {
  async getEvents(filters?: EventFilters) {
    const events = await eventRepository.findAll(filters);
    
    const eventsWithAttendees = [];
    for (const event of events) {
      const attendeeCount = await rsvpRepository.countByEvent(event.id);
      eventsWithAttendees.push({
        ...event,
        attendee_count: attendeeCount
      });
    }
    
    return eventsWithAttendees;
  }

  async getEventById(id: number) {
    return await eventRepository.findById(id);
  }

  async createEvent(event: EventCreateDto) {
    if (!event.title || event.title.trim().length === 0) {
      throw new Error("Event title is required");
    }

    if (!event.location || event.location.trim().length === 0) {
      throw new Error("Event location is required");
    }

    if (!event.event_date) {
      throw new Error("Event date is required");
    }

    return await eventRepository.create(event);
  }

  async rsvpToEvent(eventId: number, userId: number) {
    const event = await eventRepository.findById(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    const existingRSVP = await rsvpRepository.findByEventAndUser(eventId, userId);

    if (existingRSVP) {
      throw new Error("Already RSVP'd to this event");
    }

    const attendeeCount = await rsvpRepository.countByEvent(eventId);

    if (attendeeCount >= event.max_attendees) {
      throw new Error("Event is full");
    }

    return await rsvpRepository.create({
      event_id: eventId,
      user_id: userId,
      status: "accepted"
    });
  }
}

export default new EventService();

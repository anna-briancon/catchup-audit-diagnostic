import { Router } from "express";
import eventController from "../controllers/EventController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", eventController.getEvents.bind(eventController));
router.post("/", eventController.createEvent.bind(eventController));
router.post("/:id/rsvp", eventController.rsvpToEvent.bind(eventController));

export default router;

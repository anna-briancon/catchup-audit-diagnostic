import { Router } from "express";
import dashboardController from "../controllers/DashboardController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/summary", dashboardController.getSummary.bind(dashboardController));

export default router;

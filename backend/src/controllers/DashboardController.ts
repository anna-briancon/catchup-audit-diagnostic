import { Request, Response } from "express";
import dashboardService from "../services/DashboardService";

export class DashboardController {
  async getSummary(req: Request, res: Response) {
    try {
      const summary = await dashboardService.getSummary();
      res.json(summary);
    } catch (error) {
      console.error("Get dashboard summary error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default new DashboardController();

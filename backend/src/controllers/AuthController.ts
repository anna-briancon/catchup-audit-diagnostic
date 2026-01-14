import { Request, Response } from "express";
import authService from "../services/AuthService";

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      const result = await authService.login(email, password);

      if (!result) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json(result);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default new AuthController();

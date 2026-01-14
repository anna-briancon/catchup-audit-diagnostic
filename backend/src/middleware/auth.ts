import { Request, Response, NextFunction } from "express";
import authService from "../services/AuthService";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);
    const userId = await authService.verifyToken(token);

    if (!userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    (req as any).userId = userId;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
}

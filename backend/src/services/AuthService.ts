import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userRepository from "../repositories/UserRepository";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export class AuthService {
  async login(email: string, password: string): Promise<{ user: any; token: string } | null> {
    console.log(`Login attempt for ${email}`);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const user = await userRepository.findByEmail(email);

    if (!user) {
      console.log("User not found");
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      console.log("Invalid password");
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    return { user: userWithoutPassword, token };
  }

  async verifyToken(token: string): Promise<number | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const user = await userRepository.findById(decoded.userId);
      return user ? user.id : null;
    } catch (error) {
      console.error("Token verification error:", error);
      return null;
    }
  }
}

export default new AuthService();

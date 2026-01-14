import pool from "../config/database";
import { User, UserCreateDto } from "../models/User";

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0] || null;
  }

  async findById(id: number): Promise<User | null> {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  async create(user: UserCreateDto): Promise<User> {
    const result = await pool.query(
      "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *",
      [user.email, user.password, user.name]
    );
    return result.rows[0];
  }
}

export default new UserRepository();

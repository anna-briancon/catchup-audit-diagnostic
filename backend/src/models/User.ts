export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  created_at: Date;
}

export interface UserCreateDto {
  email: string;
  password: string;
  name: string;
}

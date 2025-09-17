export interface User {
  id: string;
  email: string;
  role: "admin" | "user";
  kycStatus: "pending" | "verified" | "rejected";
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role?: "admin" | "user";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  expiresIn: number;
}
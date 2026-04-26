export interface UserPayload {
  id: string;
  email: string;
}

export interface UserRecord {
  id: string;
  nombre: string;
  email: string;
  password: string;
  created_at: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

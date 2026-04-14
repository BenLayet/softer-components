export type ErrorType =
  | "invalid credentials"
  | "network error"
  | "unknown error";

export type AppError = { type: ErrorType; message?: string };

// Mirrors the backend's AllExceptionsFilter response shape (backend/src/common/filters).
export interface ApiErrorBody {
  statusCode: number;
  message: string;
  errors?: string[];
  timestamp: string;
  path: string;
}

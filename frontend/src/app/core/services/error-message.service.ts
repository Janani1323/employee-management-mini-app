import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiErrorBody } from '../models/api-error.model';

const NETWORK_ERROR_MESSAGE =
  "We couldn't reach the server. Check your connection and try again.";
const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

@Injectable({ providedIn: 'root' })
export class ErrorMessageService {
  /**
   * Turns any HttpErrorResponse into a single, non-technical message safe to
   * show directly in the UI — never the raw error, status text, or stack.
   */
  toUserMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return NETWORK_ERROR_MESSAGE;
    }

    const body = error.error as Partial<ApiErrorBody> | null;
    if (body?.errors?.length) {
      return body.errors.join(' ');
    }
    if (body?.message && error.status < 500) {
      return body.message;
    }
    return GENERIC_ERROR_MESSAGE;
  }
}

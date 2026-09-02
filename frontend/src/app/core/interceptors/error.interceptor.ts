import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Logs every failed request for local diagnostics, then rethrows the original
 * HttpErrorResponse unchanged — components decide how to react (ErrorMessageService
 * turns it into a user-facing message; this interceptor never touches the UI).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!environment.production) {
        console.error(`[HTTP ${error.status}] ${req.method} ${req.url}`, error.error);
      }
      return throwError(() => error);
    }),
  );

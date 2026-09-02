import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import { AppLoggerService } from '../logger/app-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request & { correlationId?: string }>();
    const response = context.switchToHttp().getResponse<Response>();

    request.correlationId = randomUUID();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        // Only method/path/status/timing — never request body or response payload (no PII).
        this.logger.info({
          event: 'request_completed',
          correlationId: request.correlationId,
          method: request.method,
          path: request.url,
          statusCode: response.statusCode,
          durationMs: Date.now() - start,
        });
      }),
    );
  }
}

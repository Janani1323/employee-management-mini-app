import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLoggerService } from '../logger/app-logger.service';

interface ErrorResponseBody {
  statusCode: number;
  message: string;
  errors?: string[];
  timestamp: string;
  path: string;
}

const GENERIC_SERVER_ERROR_MESSAGE = 'Something went wrong. Please try again.';
// Widened to `number` so it compares cleanly against plain-number status codes
// (HttpStatus members have a distinct literal type that trips no-unsafe-enum-comparison).
const INTERNAL_SERVER_ERROR_STATUS: number = HttpStatus.INTERNAL_SERVER_ERROR;

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = (request as Request & { correlationId?: string })
      .correlationId;

    const body = this.buildResponseBody(exception, request.url);

    if (body.statusCode >= INTERNAL_SERVER_ERROR_STATUS) {
      // Full detail goes to the server-side log only — never to the client response.
      const error =
        exception instanceof Error ? exception : new Error(String(exception));
      this.logger.error({
        event: 'unhandled_exception',
        correlationId,
        path: request.url,
        method: request.method,
        statusCode: body.statusCode,
        errorName: error.name,
        errorMessage: error.message,
      });
    }

    response.status(body.statusCode).json(body);
  }

  private buildResponseBody(
    exception: unknown,
    path: string,
  ): ErrorResponseBody {
    const timestamp = new Date().toISOString();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      // Regardless of what message the exception carries, every 500-level response
      // is collapsed to one fixed generic message — no stack trace, no DB error text,
      // and no risk of an internal detail leaking through a hand-thrown 500 either.
      if (status >= INTERNAL_SERVER_ERROR_STATUS) {
        return {
          statusCode: status,
          message: GENERIC_SERVER_ERROR_MESSAGE,
          timestamp,
          path,
        };
      }

      const responseBody = exception.getResponse();
      if (typeof responseBody === 'string') {
        return { statusCode: status, message: responseBody, timestamp, path };
      }

      const { message } = responseBody as { message?: string | string[] };
      if (Array.isArray(message)) {
        return {
          statusCode: status,
          message: 'Validation failed',
          errors: message,
          timestamp,
          path,
        };
      }

      return {
        statusCode: status,
        message: message ?? exception.message,
        timestamp,
        path,
      };
    }

    // Anything else (raw DB/driver errors, unexpected runtime errors) is never
    // exposed to the client — no stack trace, no driver error text.
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: GENERIC_SERVER_ERROR_MESSAGE,
      timestamp,
      path,
    };
  }
}

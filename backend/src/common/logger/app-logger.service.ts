import { Injectable, Logger } from '@nestjs/common';

export interface LogFields {
  event: string;
  correlationId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  errorName?: string;
  errorMessage?: string;
  [key: string]: unknown;
}

/**
 * Structured logger wrapper. Callers must only pass diagnostic metadata here
 * (ids, timings, error names/messages) — never request bodies or entity field
 * values (name/email/salary etc.), so logs stay safe even at debug/error level.
 */
@Injectable()
export class AppLoggerService {
  private readonly logger = new Logger('App');

  info(fields: LogFields): void {
    this.logger.log(this.format('info', fields));
  }

  error(fields: LogFields): void {
    this.logger.error(this.format('error', fields));
  }

  private format(level: string, fields: LogFields): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      ...fields,
    });
  }
}

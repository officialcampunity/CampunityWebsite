import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const raw = exception.getResponse();
      if (typeof raw === 'string') {
        message = raw;
      } else if (typeof raw === 'object') {
        const resp = raw as any;
        message = resp.message || exception.message;
        errors = Array.isArray(resp.message) ? resp.message : undefined;
      }
    } else if (exception instanceof Error) {
      const isProd = process.env.NODE_ENV === 'production';
      message = isProd ? 'Internal server error' : exception.message;
      this.logger.error(
        `Unhandled: ${exception.message}`,
        exception.stack,
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

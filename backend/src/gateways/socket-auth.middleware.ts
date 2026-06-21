import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Socket } from 'socket.io';

@Injectable()
export class SocketAuthMiddleware {
  private readonly logger = new Logger(SocketAuthMiddleware.name);

  constructor(private jwtService: JwtService) {}

  verify(client: Socket): { sub: string; email: string } | null {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '') ||
      null;

    if (!token) {
      this.logger.warn(`No token provided from ${client.id}`);
      return null;
    }

    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch {
      this.logger.warn(`Invalid token from ${client.id}`);
      return null;
    }
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class OnlineStatusService {
  private onlineUsers = new Map<string, Set<string>>();

  setOnline(userId: string, socketId: string) {
    const sockets = this.onlineUsers.get(userId) || new Set();
    sockets.add(socketId);
    this.onlineUsers.set(userId, sockets);
  }

  setOffline(userId: string, socketId: string) {
    const sockets = this.onlineUsers.get(userId);
    if (!sockets) return;
    sockets.delete(socketId);
    if (sockets.size === 0) {
      this.onlineUsers.delete(userId);
    }
  }

  isOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers.keys());
  }
}

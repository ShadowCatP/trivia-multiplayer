import { inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { TokenService } from '../../auth/services/token.service';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private readonly tokenService = inject(TokenService);
  public socket: Socket;

  constructor() {
    const token = this.tokenService.accessToken();

    this.socket = io('http://localhost:5001', {
      query: { token },
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  }
}

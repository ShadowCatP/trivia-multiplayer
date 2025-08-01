import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { TokenService } from '../../auth/services/token.service';
import { RoomState } from '../types/Room';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private readonly socket = inject(SocketService).socket;
  private readonly tokenService = inject(TokenService);
  private readonly token = this.tokenService.accessToken();

  private readonly roomStateSubject = new BehaviorSubject<RoomState>({
    users: [],
    host: null,
  });
  public readonly roomState$ = this.roomStateSubject.asObservable();

  constructor() {
    this.socket.on(
      'users_update',
      (data: { users: string[]; host: string }) => {
        this.roomStateSubject.next(data);
      },
    );
  }

  joinRoom(roomId: string) {
    this.socket.emit('join_room', {
      room_id: roomId,
      token: this.token,
    });
  }

  leaveRoom(roomId: string) {
    this.socket.emit('leave_room', {
      room_id: roomId,
      token: this.token,
    });
  }
}

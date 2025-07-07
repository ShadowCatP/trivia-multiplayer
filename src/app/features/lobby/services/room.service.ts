import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { TokenService } from '../../auth/services/token.service';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private readonly socket = io('ws://localhost:5001');
  private readonly tokenService = inject(TokenService);
  private readonly token = this.tokenService.accessToken();

  private readonly usersSubject = new BehaviorSubject<string[]>([]);
  public readonly users$ = this.usersSubject.asObservable();

  constructor() {
    this.socket.on('users_update', (data: string[]) => {
      console.log('users update', data);
      this.usersSubject.next(data);
    });
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

  getUsers(): Observable<string[]> {
    return this.users$;
  }
}

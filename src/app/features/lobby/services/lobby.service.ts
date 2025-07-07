import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { TokenService } from '../../auth/services/token.service';
import { ValidQuestion } from '../types/Question';
import { RoomSettings } from '../types/RoomSettings';
import { Room } from '../types/Room';

type CreatedRoomResponse = {
  id: string;
  roomName: string;
  host: string;
  isPublic: boolean;
  inviteCode: string;
  players: number;
};

@Injectable({
  providedIn: 'root',
})
export class LobbyService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly token = this.tokenService.accessToken();
  private readonly socket = io('ws://localhost:5001');

  createLobby(roomSettings: RoomSettings, questions: ValidQuestion[]) {
    return this.http.post<CreatedRoomResponse>(
      'http://localhost:5001/api/rooms',
      {
        roomSettings,
        questions,
      },
      {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      },
    );
  }

  getInitialRooms() {
    return this.http.get('http://localhost:5001/api/rooms', {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  getRooms() {
    return new Observable((observer) => {
      this.socket.on('public_rooms_update', (room) => {
        observer.next(room);
      });

      return () => {
        this.socket.disconnect();
      };
    });
  }

  getRoomByInviteCode(inviteCode: string) {
    return this.http.get<{ roomId: string }>(
      `http://localhost:5001/api/rooms/invite/${inviteCode}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      },
    );
  }

  getInviteCodeById(roomId: string) {
    return this.http.get<Room>(`http://localhost:5001/api/rooms/${roomId}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  joinRoom(roomId: string) {
    this.socket.emit('join_room', {
      room_id: roomId,
      token: this.token,
    });
  }

  onPlayerJoined(): Observable<string[]> {
    return new Observable((observer) => {
      this.socket.on('user_joined', (data: string[]) => {
        observer.next(data);
      });

      return () => {
        this.socket.disconnect();
      };
    });
  }

  constructor() {}
}

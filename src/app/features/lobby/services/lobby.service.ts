import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TokenService } from '../../auth/services/token.service';

@Injectable({
  providedIn: 'root',
})
export class LobbyService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly token = this.tokenService.accessToken();

  createLobby() {
    return this.http.post(
      'http://localhost:5001/api/rooms',
      {
        room_name: 'test',
        public: true,
      },
      {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      },
    );
  }

  getRooms() {
    return this.http.get('http://localhost:5001/api/rooms', {
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  constructor() {}
}

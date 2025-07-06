import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  Crown,
  Globe,
  LucideAngularModule,
  UserPlus,
  Users,
} from 'lucide-angular';
import { LobbyService } from '../../services/lobby.service';
import { Room } from '../../types/Room';

@Component({
  selector: 'app-rooms-list',
  imports: [LucideAngularModule],
  templateUrl: './rooms-list.component.html',
  styleUrl: './rooms-list.component.css',
})
export class RoomsListComponent implements OnInit {
  readonly Globe = Globe;
  readonly Crown = Crown;
  readonly Users = Users;
  readonly UserPlus = UserPlus;

  private readonly lobbyService = inject(LobbyService);
  private readonly router = inject(Router);

  rooms: Room[] = [];

  ngOnInit(): void {
    // load initial server state
    this.lobbyService.getInitialRooms().subscribe({
      next: (initialRooms: any) => {
        this.rooms = initialRooms;
      },
      error: (err) => {
        console.error('Error loading initial rooms: ', err);
      },
    });

    // subscribe to further updates from the server
    this.lobbyService.getRooms().subscribe({
      next: (res: any) => {
        this.rooms = res;
      },
      error: (err) => {
        console.error('Error loading rooms: ', err);
      },
    });
  }

  quickJoin(roomId: string) {
    this.router.navigate(['/room', roomId]);
  }
}

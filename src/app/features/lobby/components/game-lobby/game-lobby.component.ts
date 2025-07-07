import { Component, inject, OnInit, signal } from '@angular/core';
import { Check, Copy, LucideAngularModule, Share2 } from 'lucide-angular';
import { LobbyService } from '../../services/lobby.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-game-lobby',
  imports: [LucideAngularModule],
  templateUrl: './game-lobby.component.html',
  styleUrl: './game-lobby.component.css',
})
export class GameLobbyComponent implements OnInit {
  readonly Copy = Copy;
  readonly Check = Check;
  readonly Share2 = Share2;

  private readonly lobbyService = inject(LobbyService);
  private readonly route = inject(ActivatedRoute);

  isCopied = signal(false);
  isLoading = signal(true);

  private readonly roomId = this.route.snapshot.paramMap.get('id') || '';

  inviteCode = '';
  users: string[] = [];

  constructor() {}

  ngOnInit(): void {
    this.lobbyService.getInviteCodeById(this.roomId).subscribe({
      next: (room) => {
        this.inviteCode = room.inviteCode;
        this.isLoading.set(false);
      },
    });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.isCopied.set(true);
      setTimeout(() => {
        this.isCopied.set(false);
      }, 2000);
    });
  }
}

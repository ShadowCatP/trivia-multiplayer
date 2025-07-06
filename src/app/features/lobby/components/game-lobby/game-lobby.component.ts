import { Component, signal } from '@angular/core';
import { Check, Copy, LucideAngularModule, Share2 } from 'lucide-angular';

@Component({
  selector: 'app-game-lobby',
  imports: [LucideAngularModule],
  templateUrl: './game-lobby.component.html',
  styleUrl: './game-lobby.component.css',
})
export class GameLobbyComponent {
  readonly Copy = Copy;
  readonly Check = Check;
  readonly Share2 = Share2;

  isCopied = signal(false);

  inviteCode = '';
  users: string[] = [];

  constructor() {}

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.isCopied.set(true);
      setTimeout(() => {
        this.isCopied.set(false);
      }, 2000);
    });
  }
}

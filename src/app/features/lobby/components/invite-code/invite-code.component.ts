import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Check, Copy, LucideAngularModule, Share2 } from 'lucide-angular';
import { LobbyService } from '../../services/lobby.service';

@Component({
  selector: 'app-invite-code',
  imports: [LucideAngularModule],
  templateUrl: './invite-code.component.html',
  styleUrl: './invite-code.component.css',
})
export class InviteCodeComponent implements OnInit {
  readonly Copy = Copy;
  readonly Check = Check;
  readonly Share2 = Share2;

  private readonly lobbyService = inject(LobbyService);
  private readonly route = inject(ActivatedRoute);

  isCopied = signal(false);
  isLoading = signal(true);

  private readonly roomId = this.route.snapshot.paramMap.get('id') || '';

  inviteCode = '';

  ngOnInit(): void {
    this.lobbyService.getInviteCodeById(this.roomId).subscribe({
      next: (room) => {
        setTimeout(() => {
          this.inviteCode = room.inviteCode;
          this.isLoading.set(false);
        }, 300);
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

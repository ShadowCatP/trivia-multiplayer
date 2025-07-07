import { Component, inject, OnInit, signal } from '@angular/core';
import { Check, Copy, LucideAngularModule, Share2 } from 'lucide-angular';
import { LobbyService } from '../../services/lobby.service';
import { ActivatedRoute, Router } from '@angular/router';
import { InviteCodeComponent } from '../invite-code/invite-code.component';

@Component({
  selector: 'app-game-lobby',
  imports: [LucideAngularModule, InviteCodeComponent],
  templateUrl: './game-lobby.component.html',
  styleUrl: './game-lobby.component.css',
})
export class GameLobbyComponent {
  users: string[] = [];

  constructor() {}
}

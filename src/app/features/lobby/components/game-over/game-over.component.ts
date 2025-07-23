import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayerScore } from '../../types/Question';

@Component({
  selector: 'app-game-over',
  imports: [],
  templateUrl: './game-over.component.html',
  styleUrl: './game-over.component.css',
})
export class GameOverComponent {
  @Input() scores: PlayerScore[] | null = null;
  @Output() returnToLobby = new EventEmitter<void>();
  @Output() leaveLobby = new EventEmitter<void>();
}

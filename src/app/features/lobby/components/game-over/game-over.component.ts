import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-game-over',
  imports: [],
  templateUrl: './game-over.component.html',
  styleUrl: './game-over.component.css',
})
export class GameOverComponent {
  @Output() returnToLobby = new EventEmitter<void>();
  @Output() leaveLobby = new EventEmitter<void>();
}

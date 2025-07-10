import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, Play } from 'lucide-angular';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { RoomService } from '../../services/room.service';
import { RoomState } from '../../types/Room';
import { InviteCodeComponent } from '../invite-code/invite-code.component';
import { UsersListComponent } from '../users-list/users-list.component';
import { GameService } from '../../services/game.service';
import { ValidQuestion } from '../../types/Question';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-lobby',
  imports: [
    LucideAngularModule,
    InviteCodeComponent,
    UsersListComponent,
    CommonModule,
  ],
  templateUrl: './game-lobby.component.html',
  styleUrl: './game-lobby.component.css',
})
export class GameLobbyComponent implements OnInit, OnDestroy {
  isHost = false;
  countdown = 0;
  showCountdown = false;
  private countdownInterval: ReturnType<typeof setInterval> | undefined;
  currentQuestion: ValidQuestion | null = null;
  selectedAnswerIndex: number | null = null;
  answerSubmitted = false;
  lastAnswerResult: { correct: boolean } | null = null;
  isGameOver = false;

  private readonly roomService = inject(RoomService);
  private readonly authService = inject(AuthService);
  private readonly gameService = inject(GameService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sub = new Subscription();

  readonly Play = Play;

  roomState: RoomState = { users: [], host: null };

  private roomId = this.route.snapshot.paramMap.get('id');

  constructor() {}

  ngOnInit(): void {
    this.roomService.joinRoom(this.roomId!);

    const roomSub = this.roomService.roomState$.subscribe((state) => {
      this.roomState = state;

      const currentUser = this.authService.getCurrentUser();
      this.isHost = currentUser === state.host;
    });

    const gameSub = this.gameService.currentQuestion$.subscribe(
      (question: ValidQuestion | null) => {
        if (question) {
          this.isGameOver = false;
          this.currentQuestion = question;
          this.selectedAnswerIndex = null;
          this.answerSubmitted = false;
          this.lastAnswerResult = null;
        }
      },
    );

    const resultSub = this.gameService.answerResult$.subscribe((result) => {
      this.lastAnswerResult = result;
    });

    const gameOverSub = this.gameService.gameOver$.subscribe((data) => {
      console.log('Game Over: ', data);
      this.isGameOver = true;
      this.currentQuestion = null;
    });

    this.sub.add(roomSub);
    this.sub.add(gameSub);
    this.sub.add(resultSub);
    this.sub.add(gameOverSub);
  }

  ngOnDestroy(): void {
    this.roomService.leaveRoom(this.roomId!);
    this.sub.unsubscribe();
    clearInterval(this.countdownInterval);
  }

  startGame() {
    if (this.isHost) {
      this.countdown = 5;
      this.showCountdown = true;

      this.countdownInterval = setInterval(() => {
        this.countdown--;

        if (this.countdown === 0) {
          clearInterval(this.countdownInterval);
          this.showCountdown = false;
          this.gameService.startGame(this.roomId!);
        }
      }, 1000);
    }
  }

  selectAnswer(index: number) {
    if (this.answerSubmitted) return;

    this.selectedAnswerIndex = index;
    this.answerSubmitted = true;
    this.gameService.submitAnswer(this.roomId!, index);
  }

  returnToLobby() {
    this.isGameOver = false;
  }

  leaveLobby() {
    this.router.navigate(['/']);
  }
}

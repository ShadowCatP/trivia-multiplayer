import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Clock, LucideAngularModule, Play } from 'lucide-angular';
import { Subscription, timer } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { GameService } from '../../services/game.service';
import { RoomService } from '../../services/room.service';
import {
  AnswerResultPayload,
  QuestionPayload,
  ValidQuestion,
} from '../../types/Question';
import { RoomState } from '../../types/Room';
import { GameOverComponent } from '../game-over/game-over.component';
import { InviteCodeComponent } from '../invite-code/invite-code.component';
import { UsersListComponent } from '../users-list/users-list.component';

@Component({
  selector: 'app-game-lobby',
  imports: [
    LucideAngularModule,
    InviteCodeComponent,
    UsersListComponent,
    CommonModule,
    GameOverComponent,
    LucideAngularModule,
  ],
  templateUrl: './game-lobby.component.html',
  styleUrl: './game-lobby.component.css',
})
export class GameLobbyComponent implements OnInit, OnDestroy {
  roomState: RoomState = { users: [], host: null };
  isHost = false;
  isGameOver = false;
  currentQuestion: ValidQuestion | null = null;
  selectedAnswerIndex: number | null = null;
  answerSubmitted = false;
  lastAnswerResult: AnswerResultPayload | null = null;
  timeRemaining = 0;

  // pre-game state
  showStartCountdown = false;
  startCountdown = 0;

  private readonly roomService = inject(RoomService);
  private readonly authService = inject(AuthService);
  private readonly gameService = inject(GameService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sub = new Subscription();
  private timerSub: Subscription | null = null;
  private readonly roomId = this.route.snapshot.paramMap.get('id');

  // Icons
  readonly Play = Play;
  readonly Clock = Clock;

  constructor() {}

  ngOnInit(): void {
    this.roomService.joinRoom(this.roomId!);

    this.sub.add(
      this.roomService.roomState$.subscribe((state) => {
        this.roomState = state;
        this.isHost = this.authService.getCurrentUser() === state.host;
      }),
    );

    this.sub.add(
      this.gameService.currentQuestion$.subscribe((payload) =>
        this.handleNewQuestion(payload),
      ),
    );

    this.sub.add(
      this.gameService.answerResult$.subscribe((result) => {
        this.lastAnswerResult = result;
        this.stopTimer();
      }),
    );

    this.sub.add(
      this.gameService.gameOver$.subscribe(() => this.handleGameOver()),
    );

    this.sub.add(
      this.gameService.countdownStarted$.subscribe(() => {
        this.runCountdown();
      }),
    );
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.roomService.leaveRoom(this.roomId!);
    this.sub.unsubscribe();
  }

  handleStartGame() {
    if (!this.isHost) return;
    this.gameService.triggerCountdown(this.roomId!);
  }

  private runCountdown() {
    this.startCountdown = 3;
    this.showStartCountdown = true;

    const interval = setInterval(() => {
      this.startCountdown--;

      if (this.startCountdown === 0) {
        clearInterval(interval);
        this.showStartCountdown = false;

        if (this.isHost) {
          this.gameService.startGame(this.roomId!);
        }
      }
    }, 1000);
  }

  handleAnswerSelected(index: number | null) {
    if (this.answerSubmitted) return;
    this.selectedAnswerIndex = index;
    this.gameService.submitAnswer(this.roomId!, this.selectedAnswerIndex);
    this.answerSubmitted = true;
  }

  handleReturnToLobby() {
    this.isGameOver = false;
  }

  handleLeaveLobby() {
    this.router.navigate(['/']);
  }

  private handleNewQuestion(payload: QuestionPayload | null) {
    this.stopTimer();
    if (payload) {
      const clientTimestamp = Date.now();
      const latency = clientTimestamp - payload.serverTimestamp;
      const timeElapsed = Math.floor(latency / 1000);

      this.isGameOver = false;
      this.currentQuestion = payload.question;
      this.selectedAnswerIndex = null;
      this.answerSubmitted = false;
      this.lastAnswerResult = null;
      this.startTimer(payload.questionTimeLimit, timeElapsed);
    }
  }

  private handleGameOver() {
    this.isGameOver = true;
    this.currentQuestion = null;
    this.stopTimer();
  }

  private startTimer(timeLimit: number, timeElapsed: number = 0) {
    this.timeRemaining = Math.max(0, timeLimit - timeElapsed);

    if (this.timeRemaining === 0) {
      this.answerSubmitted = true;
      this.gameService.submitAnswer(this.roomId!, this.selectedAnswerIndex);
      return;
    }

    this.timerSub = timer(1000, 1000).subscribe(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      }

      if (this.timeRemaining === 0) {
        this.stopTimer();
        this.answerSubmitted = true;
        this.gameService.submitAnswer(this.roomId!, this.selectedAnswerIndex);
      }
    });
  }

  private stopTimer() {
    this.timerSub?.unsubscribe();
    this.timerSub = null;
  }
}

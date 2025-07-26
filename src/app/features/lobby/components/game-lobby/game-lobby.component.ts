import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Clock, LucideAngularModule, Play } from 'lucide-angular';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { GameService } from '../../services/game.service';
import { RoomService } from '../../services/room.service';
import {
  AnswerResultPayload,
  GameOverPaylod,
  PlayerScore,
  QuestionPayload,
  ValidQuestion,
} from '../../types/Question';
import { RoomState } from '../../types/Room';
import { GameOverComponent } from '../game-over/game-over.component';
import { InviteCodeComponent } from '../invite-code/invite-code.component';
import { UsersListComponent } from '../users-list/users-list.component';
import { User } from '../../types/User';

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
  showScoreboard = false;
  playerScores: PlayerScore[] = [];
  timeRemaining = 0;
  waitingForOthers = false;
  players: User[] = [];
  private spinnerTimeout: any = null;
  private questionStartTime = 0;
  private questionTimeLimitMs = 0;
  private timerIntervalId: any = null;

  // pre-game state
  showStartCountdown = false;
  startCountdown = 0;

  private readonly roomService = inject(RoomService);
  private readonly authService = inject(AuthService);
  private readonly gameService = inject(GameService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sub = new Subscription();
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
        const currentUser = this.authService.getCurrentUser();
        this.isHost = currentUser === state.host;
        if (state.users && currentUser) {
          const otherUsers = state.users
            .filter((user) => user !== currentUser)
            .sort((a, b) => a.localeCompare(b));
          this.players = [
            { username: currentUser, isCurrentUser: true },
            ...otherUsers.map((user) => ({
              username: user,
              isCurrentUser: false,
            })),
          ];
        } else {
          this.players = state.users.map((u) => ({
            username: u,
            isCurrentUser: false,
          }));
        }
      }),
    );

    this.sub.add(
      this.gameService.currentQuestion$.subscribe((payload) =>
        this.handleNewQuestion(payload),
      ),
    );

    this.sub.add(
      this.gameService.answerResult$.subscribe((result) => {
        clearTimeout(this.spinnerTimeout);
        this.waitingForOthers = false;
        this.lastAnswerResult = result;
        this.playerScores = result.scores;
        this.showScoreboard = true;
        this.stopTimer();
      }),
    );

    this.sub.add(
      this.gameService.gameOver$.subscribe((payload) =>
        this.handleGameOver(payload),
      ),
    );

    this.sub.add(
      this.gameService.countdownStarted$.subscribe(() => {
        this.runCountdown();
      }),
    );

    this.sub.add(
      this.gameService.roundOver$.subscribe(() => {
        clearTimeout(this.spinnerTimeout);
        this.waitingForOthers = false;
        this.stopTimer();
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
    const elapsedMs = Date.now() - this.questionStartTime;
    const timeLeftMs = Math.max(0, this.questionTimeLimitMs - elapsedMs);
    this.selectedAnswerIndex = index;
    this.gameService.submitAnswer(
      this.roomId!,
      this.selectedAnswerIndex,
      timeLeftMs,
    );
    this.answerSubmitted = true;
    this.spinnerTimeout = setTimeout(() => (this.waitingForOthers = true), 200);
  }

  handleReturnToLobby() {
    this.isGameOver = false;
    this.showScoreboard = false;
    this.playerScores = [];
  }

  handleLeaveLobby() {
    this.router.navigate(['/']);
  }

  private handleNewQuestion(payload: QuestionPayload | null) {
    this.stopTimer();
    clearTimeout(this.spinnerTimeout);
    this.waitingForOthers = false;
    if (payload) {
      const clientTimestamp = Date.now();
      const latency = clientTimestamp - payload.serverTimestamp;

      this.questionStartTime = clientTimestamp - latency;
      this.questionTimeLimitMs = payload.questionTimeLimit * 1000;

      this.isGameOver = false;
      this.showScoreboard = false;
      this.currentQuestion = payload.question;
      this.selectedAnswerIndex = null;
      this.answerSubmitted = false;
      this.lastAnswerResult = null;
      this.startTimer();
    }
  }

  private handleGameOver(payload: GameOverPaylod) {
    this.isGameOver = true;
    this.currentQuestion = null;
    this.playerScores = payload.scores;
    this.stopTimer();
  }

  private startTimer() {
    const updateTimer = () => {
      const elapsedMs = Date.now() - this.questionStartTime;
      const remainingMs = Math.max(0, this.questionTimeLimitMs - elapsedMs);

      this.timeRemaining = remainingMs / 1000;

      if (remainingMs === 0) {
        this.stopTimer();
        if (!this.answerSubmitted) {
          this.answerSubmitted = true;
          this.gameService.submitAnswer(
            this.roomId!,
            this.selectedAnswerIndex,
            0,
          );
        }
      }
    };

    clearInterval(this.timerIntervalId);
    this.timerIntervalId = setInterval(updateTimer, 50);
    updateTimer();
  }

  private stopTimer() {
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }
}

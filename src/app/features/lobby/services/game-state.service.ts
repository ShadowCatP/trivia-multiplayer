import { inject, Injectable, OnDestroy } from '@angular/core';
import { RoomState } from '../types/Room';
import {
  ValidQuestion,
  AnswerResultPayload,
  PlayerScore,
} from '../types/Question';
import { User } from '../types/User';
import { AuthService } from '../../auth/services/auth.service';
import { GameService } from './game.service';
import { RoomService } from './room.service';
import { TimerService } from './timer.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';

export interface LobbyViewState {
  view: 'lobby' | 'countdown' | 'question' | 'scoreboard' | 'gameOver';
  roomState: RoomState;
  isHost: boolean;
  players: User[];
  currentQuestion: ValidQuestion | null;
  lastAnswerResult: AnswerResultPayload | null;
  playerScores: PlayerScore[];
  timeRemaining: number;
  waitingForOthers: boolean;
  answerSubmitted: boolean;
  selectedAnswerIndex: number | null;
  startCountdown: number;
}

const initialState: LobbyViewState = {
  view: 'lobby',
  roomState: { users: [], host: null },
  isHost: false,
  players: [],
  currentQuestion: null,
  lastAnswerResult: null,
  playerScores: [],
  timeRemaining: 0,
  waitingForOthers: false,
  answerSubmitted: false,
  selectedAnswerIndex: null,
  startCountdown: 0,
};

@Injectable({
  providedIn: 'root',
})
export class GameStateService implements OnDestroy {
  private readonly roomService = inject(RoomService);
  private readonly authService = inject(AuthService);
  private readonly gameService = inject(GameService);
  private readonly timerService = inject(TimerService);
  private readonly router = inject(Router);

  private readonly state = new BehaviorSubject<LobbyViewState>(initialState);
  private readonly sub = new Subscription();
  private roomId: string | null = null;
  private spinnerTimeout: any = null;

  public readonly state$ = this.state.asObservable();

  constructor() {
    this.sub.add(
      this.timerService.timeRemaining$.subscribe((time) => {
        this.updateState({ timeRemaining: time });
        if (time === 0 && !this.state.value.answerSubmitted) {
          this.submitAnswer(this.state.value.selectedAnswerIndex);
        }
      }),
    );
  }

  initialize(roomId: string) {
    this.roomId = roomId;
    this.roomService.joinRoom(this.roomId);
    this.registerListeners();
  }

  private registerListeners() {
    this.sub.add(
      this.roomService.roomState$.subscribe((rs) => this.onRoomStateChange(rs)),
    );
    this.sub.add(
      this.gameService.currentQuestion$.subscribe((q) =>
        this.onNewQuestion(q?.question, q?.questionTimeLimit),
      ),
    );
    this.sub.add(
      this.gameService.answerResult$.subscribe((res) =>
        this.onAnswerResult(res),
      ),
    );
    this.sub.add(
      this.gameService.countdownStarted$.subscribe(() =>
        this.runStartCountdown(),
      ),
    );
    this.sub.add(
      this.gameService.roundOver$.subscribe(() => this.onRoundOver()),
    );
    this.sub.add(
      this.gameService.socketError$.subscribe((err) => this.handleError(err)),
    );
  }

  startGame() {
    this.gameService.startGame(this.roomId!);
  }

  triggerCountdown() {
    this.gameService.triggerCountdown(this.roomId!);
  }

  submitAnswer(index: number | null) {
    if (this.state.value.answerSubmitted) return;
    this.timerService.stop();
    this.updateState({
      selectedAnswerIndex: index,
      answerSubmitted: true,
    });
    this.gameService.submitAnswer(
      this.roomId!,
      index,
      this.state.value.timeRemaining * 1000,
    );
    this.spinnerTimeout = setTimeout(
      () => this.updateState({ waitingForOthers: true }),
      200,
    );
  }

  returnToLobby() {
    this.updateState({
      view: 'lobby',
      currentQuestion: null,
      lastAnswerResult: null,
      playerScores: [],
      timeRemaining: 0,
      waitingForOthers: false,
      answerSubmitted: false,
      selectedAnswerIndex: null,
    });
  }

  leaveLobby() {
    this.router.navigate(['/']);
  }

  private onRoomStateChange(roomState: RoomState) {
    const currentUser = this.authService.getCurrentUser();
    const isHost = currentUser === roomState.host;
    const players = roomState.users
      .map((user) => ({ username: user, isCurrentUser: user === currentUser }))
      .sort((a, b) =>
        a.isCurrentUser
          ? -1
          : b.isCurrentUser
            ? 1
            : a.username.localeCompare(b.username),
      );

    this.updateState({ roomState, isHost, players });
  }

  private onNewQuestion(
    question: ValidQuestion | undefined,
    timeLimit: number | undefined,
  ) {
    this.timerService.stop();
    clearTimeout(this.spinnerTimeout);

    if (question && timeLimit) {
      this.updateState({
        view: 'question',
        currentQuestion: question,
        selectedAnswerIndex: null,
        answerSubmitted: false,
        lastAnswerResult: null,
        waitingForOthers: false,
      });
      this.timerService.start(timeLimit);
    }
  }

  private onAnswerResult(result: AnswerResultPayload) {
    clearTimeout(this.spinnerTimeout);
    this.updateState({
      lastAnswerResult: result,
      playerScores: result.scores,
      waitingForOthers: false,
    });
    this.timerService.stop();

    if (result.isLast) {
      setTimeout(() => this.updateState({ view: 'gameOver' }), 3000);
    } else {
      setTimeout(() => this.updateState({ view: 'scoreboard' }), 3000);
    }
  }

  private onRoundOver() {
    clearTimeout(this.spinnerTimeout);
    this.updateState({ waitingForOthers: false });
    this.timerService.stop();
  }

  private runStartCountdown() {
    this.updateState({ view: 'countdown', startCountdown: 3 });
    const intervalId = setInterval(() => {
      const newTime = this.state.value.startCountdown - 1;
      this.updateState({ startCountdown: newTime });
      if (newTime === 0) {
        clearInterval(intervalId);
        if (this.state.value.isHost) {
          this.startGame();
        }
      }
    }, 1000);
  }

  private handleError(error: { status: number; msg: string }) {
    if (error.status === 404) {
      this.router.navigate(['/not-found']);
    } else {
      console.error(error.msg);
    }
  }

  private updateState(newState: Partial<LobbyViewState>) {
    this.state.next({ ...this.state.value, ...newState });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.timerService.stop();
    if (this.roomId) {
      this.roomService.leaveRoom(this.roomId);
    }
  }
}

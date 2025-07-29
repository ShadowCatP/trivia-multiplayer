import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { TokenService } from '../../auth/services/token.service';
import {
  AnswerResultPayload,
  GameOverPaylod,
  QuestionPayload,
} from '../types/Question';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly socket = inject(SocketService).socket;
  private readonly tokenService = inject(TokenService);

  private currentQuestionSubject = new BehaviorSubject<QuestionPayload | null>(
    null,
  );
  currentQuestion$ = this.currentQuestionSubject.asObservable();

  private answerResultSubject = new Subject<AnswerResultPayload>();
  answerResult$ = this.answerResultSubject.asObservable();

  private countdownStartedSubject = new Subject<void>();
  countdownStarted$ = this.countdownStartedSubject.asObservable();

  private roundOverSubject = new Subject<void>();
  roundOver$ = this.roundOverSubject.asObservable();

  private socketErrorSubject = new Subject<{ msg: string; status: number }>();
  socketError$ = this.socketErrorSubject.asObservable();

  constructor() {
    this.socket.on('new_question', (data: QuestionPayload) => {
      this.currentQuestionSubject.next(data);
    });

    this.socket.on('answer_result', (data: AnswerResultPayload) => {
      this.answerResultSubject.next(data);
    });

    this.socket.on('countdown_started', () => {
      this.countdownStartedSubject.next();
    });

    this.socket.on('round_over', () => {
      this.roundOverSubject.next();
    });

    this.socket.on('error', (data: { msg: string; status: number }) => {
      this.socketErrorSubject.next(data);
    });
  }

  startGame(roomId: string) {
    const token = this.tokenService.accessToken();
    this.socket.emit('start_game', {
      room_id: roomId,
      token,
    });
  }

  submitAnswer(roomId: string, answerIndex: number | null, timeLeftMs: number) {
    const token = this.tokenService.accessToken();
    this.socket.emit('submit_answer', {
      room_id: roomId,
      answer_index: answerIndex,
      time_left_ms: timeLeftMs,
      token,
    });
  }

  triggerCountdown(roomId: string) {
    this.socket.emit('trigger_countdown', { room_id: roomId });
  }
}

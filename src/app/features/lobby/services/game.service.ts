import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { TokenService } from '../../auth/services/token.service';
import { AnswerResultPayload, QuestionPayload } from '../types/Question';
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

  private gameOverSubject = new Subject<any>();
  gameOver$ = this.gameOverSubject.asObservable();

  private countdownStartedSubject = new Subject<void>();
  countdownStarted$ = this.countdownStartedSubject.asObservable();

  constructor() {
    this.socket.on('new_question', (data: QuestionPayload) => {
      this.currentQuestionSubject.next(data);
    });

    this.socket.on('answer_result', (data: AnswerResultPayload) => {
      this.answerResultSubject.next(data);
    });

    this.socket.on('game_over', (data) => {
      this.gameOverSubject.next(data);
      this.currentQuestionSubject.next(null);
    });

    this.socket.on('countdown_started', () => {
      this.countdownStartedSubject.next();
    });

    this.socket.on('error', (data) => {
      // TODO deal with the errors properly
      console.error(data.msg);
    });
  }

  startGame(roomId: string) {
    const token = this.tokenService.accessToken();
    this.socket.emit('start_game', {
      room_id: roomId,
      token,
    });
  }

  submitAnswer(roomId: string, answerIndex: number | null) {
    const token = this.tokenService.accessToken();
    this.socket.emit('submit_answer', {
      room_id: roomId,
      answer_index: answerIndex,
      token,
    });
  }

  triggerCountdown(roomId: string) {
    this.socket.emit('trigger_countdown', { room_id: roomId });
  }
}

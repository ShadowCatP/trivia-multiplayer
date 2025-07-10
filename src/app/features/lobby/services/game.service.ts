import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { TokenService } from '../../auth/services/token.service';
import { SocketService } from './socket.service';
import { ValidQuestion } from '../types/Question';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly socket = inject(SocketService).socket;
  private readonly tokenService = inject(TokenService);

  private currentQuestionSubject = new BehaviorSubject<ValidQuestion | null>(
    null,
  );
  currentQuestion$ = this.currentQuestionSubject.asObservable();

  private answerResultSubject = new Subject<{ correct: boolean }>();
  answerResult$ = this.answerResultSubject.asObservable();

  private gameOverSubject = new Subject<any>();
  gameOver$ = this.gameOverSubject.asObservable();

  constructor() {
    this.socket.on('new_question', (data: { question: ValidQuestion }) => {
      console.log(data.question);
      this.currentQuestionSubject.next(data.question);
    });

    this.socket.on('answer_result', (data: { correct: boolean }) => {
      this.answerResultSubject.next(data);
    });

    this.socket.on('game_over', (data) => {
      this.gameOverSubject.next(data);
      this.currentQuestionSubject.next(null);
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

  submitAnswer(roomId: string, answerIndex: number) {
    const token = this.tokenService.accessToken();
    this.socket.emit('submit_answer', {
      room_id: roomId,
      answer_index: answerIndex,
      token,
    });
  }
}

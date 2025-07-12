import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ValidQuestion } from '../../types/Question';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-question-display',
  imports: [CommonModule],
  templateUrl: './question-display.component.html',
  styleUrl: './question-display.component.css',
})
export class QuestionDisplayComponent {
  @Input({ required: true }) question!: ValidQuestion;
  @Input() timeRemaining = 0;
  @Input() selectedAnswerIndex: number | null = null;
  @Input() answerSubmitted = false;
  @Input() lastAnswerResult: { correct: boolean } | null = null;

  @Output() answerSelected = new EventEmitter<number>();

  onSelectAnswer(index: number) {
    this.answerSelected.emit(index);
  }
}

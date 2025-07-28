import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule, Clock } from 'lucide-angular';
import { AnswerResultPayload, ValidQuestion } from '../../types/Question';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-question-display',
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './question-display.component.html',
  styleUrl: './question-display.component.css',
})
export class QuestionDisplayComponent {
  @Input({ required: true }) question!: ValidQuestion;
  @Input({ required: true }) timeRemaining = 0;
  @Input({ required: true }) waitingForOthers: boolean = false;
  @Input({ required: true }) selectedAnswerIndex: number | null = null;
  @Input({ required: true }) lastAnswerResult: AnswerResultPayload | null =
    null;
  @Input({ required: true }) isAnswerSubmitted: boolean = false;

  @Output() answerSelected = new EventEmitter<number>();

  readonly Clock = Clock;

  onAnswerSelected(index: number) {
    if (!this.isAnswerSubmitted) {
      this.answerSelected.emit(index);
    }
  }
}

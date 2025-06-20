import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  Eye,
  Globe,
  HelpCircle,
  Lock,
  LucideAngularModule,
  Play,
  Settings,
  Trophy,
} from 'lucide-angular';
import { ValidQuestion } from '../../types/Question';
import { RoomSettings } from '../../types/RoomSettings';

@Component({
  selector: 'app-review',
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './review.component.html',
  styleUrl: './review.component.css',
})
export class ReviewComponent {
  @Input() roomSettings: Partial<RoomSettings> = {};
  @Input() validQuestions: ValidQuestion[] = [];
  @Input() isCreating = false;

  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  readonly Globe = Globe;
  readonly Lock = Lock;
  readonly Eye = Eye;
  readonly HelpCircle = HelpCircle;
  readonly Settings = Settings;
  readonly Trophy = Trophy;
  readonly Play = Play;

  getTrimmedAnswers(answers: string[]) {
    return answers.filter((a) => a.trim());
  }
}

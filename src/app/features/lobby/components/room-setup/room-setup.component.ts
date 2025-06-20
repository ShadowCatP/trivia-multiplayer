import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Eye, Globe, Lock, LucideAngularModule, Shuffle } from 'lucide-angular';
import { RoomSettings } from '../../types/RoomSettings';

@Component({
  selector: 'app-room-setup',
  imports: [ReactiveFormsModule, CommonModule, LucideAngularModule],
  templateUrl: './room-setup.component.html',
  styleUrl: './room-setup.component.css',
})
export class RoomSetupComponent implements OnInit {
  readonly Globe = Globe;
  readonly Lock = Lock;
  readonly Shuffle = Shuffle;
  readonly Eye = Eye;

  fb = inject(FormBuilder);
  @Output() next = new EventEmitter<RoomSettings>();

  @Input() initialValues?: RoomSettings;

  maxPlayersOptions = [2, 4, 6, 8, 10, 12];
  questionsTimeOptions = [15, 30, 45, 60, 90];

  roomForm = this.fb.group({
    roomName: ['', Validators.required],
    isPublic: [true],
    maxPlayers: [8],
    questionTimeLimit: [30],
    shuffleQuestions: [true],
    showAnswersAfterQuestion: [true],
  });

  ngOnInit(): void {
    if (this.initialValues) {
      this.roomForm.patchValue(this.initialValues);
    }
  }

  onSubmit() {
    if (this.roomForm.valid) {
      this.next.emit(this.roomForm.value as RoomSettings);
    }
  }

  toggleBoolean(field: string) {
    const control = this.roomForm.get(field);
    if (control) {
      control.setValue(!control.value);
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Eye, HelpCircle, LucideAngularModule, Settings } from 'lucide-angular';
import { LobbyService } from '../../services/lobby.service';
import { ValidQuestion } from '../../types/Question';
import { RoomSettings } from '../../types/RoomSettings';
import { QuestionsEditorComponent } from '../questions-editor/questions-editor.component';
import { ReviewComponent } from '../review/review.component';
import { RoomSetupComponent } from '../room-setup/room-setup.component';
import { Router } from '@angular/router';

type FormStep = 'setup' | 'questions' | 'review';

type Step = {
  key: FormStep;
  label: string;
  icon: any;
};
@Component({
  selector: 'app-host-room',
  imports: [
    RoomSetupComponent,
    QuestionsEditorComponent,
    ReviewComponent,
    LucideAngularModule,
    CommonModule,
  ],
  templateUrl: './host-room.component.html',
  styleUrl: './host-room.component.css',
})
export class HostRoomComponent {
  private readonly lobbyService = inject(LobbyService);
  private readonly router = inject(Router);

  readonly HelpCircle = HelpCircle;

  currentStep: FormStep = 'setup';
  roomSettings!: RoomSettings;
  questions: ValidQuestion[] = [];
  isCreating = false;
  error: string | null = null;

  readonly steps: Step[] = [
    { key: 'setup', label: 'Room Setup', icon: Settings },
    { key: 'questions', label: 'Questions', icon: HelpCircle },
    { key: 'review', label: 'Review', icon: Eye },
  ];

  goToStep(step: FormStep) {
    this.currentStep = step;
  }

  isStepActive(step: FormStep) {
    return this.currentStep === step;
  }

  isStepCompleted(step: FormStep) {
    const order: FormStep[] = ['setup', 'questions', 'review'];
    return order.indexOf(this.currentStep) > order.indexOf(step);
  }

  handleRoomSetupNext(settings: RoomSettings) {
    this.roomSettings = settings;
    this.goToStep('questions');
  }

  handleQuestionsPrev(questions: ValidQuestion[]) {
    this.questions = questions;
    console.log(questions);
    this.goToStep('setup');
  }

  handleQuestionsNext(questions: ValidQuestion[]) {
    this.questions = questions;
    this.goToStep('review');
  }

  createRoom() {
    this.isCreating = true;

    this.lobbyService.createLobby(this.roomSettings, this.questions).subscribe({
      next: (res) => {
        this.isCreating = false;

        const roomId = res?.id;
        if (roomId) {
          this.router.navigate(['room', roomId]);
        } else {
          this.error = 'Server is down. Please try again later.';
        }
      },
      error: (err) => {
        this.error = 'Something went wrong. Please try again later.';
        this.isCreating = false;
      },
    });
  }
}

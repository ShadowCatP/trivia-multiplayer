import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Play } from 'lucide-angular';
import { Observable } from 'rxjs';
import { HomeButtonComponent } from '../../../../shared/components/home-button/home-button.component';
import {
  GameStateService,
  LobbyViewState,
} from '../../services/game-state.service';
import { GameOverComponent } from '../game-over/game-over.component';
import { InviteCodeComponent } from '../invite-code/invite-code.component';
import { QuestionDisplayComponent } from '../question-display/question-display.component';
import { ScoreboardComponent } from '../scoreboard/scoreboard.component';
import { UsersListComponent } from '../users-list/users-list.component';

@Component({
  selector: 'app-game-lobby',
  imports: [
    LucideAngularModule,
    InviteCodeComponent,
    UsersListComponent,
    CommonModule,
    GameOverComponent,
    LucideAngularModule,
    HomeButtonComponent,
    ScoreboardComponent,
    QuestionDisplayComponent,
  ],
  templateUrl: './game-lobby.component.html',
  styleUrl: './game-lobby.component.css',
})
export class GameLobbyComponent {
  private readonly route = inject(ActivatedRoute);
  public readonly gameStateService = inject(GameStateService);

  public readonly state$: Observable<LobbyViewState> =
    this.gameStateService.state$;

  public currentView: LobbyViewState['view'] = 'lobby';
  public previousView: LobbyViewState['view'] = 'lobby';

  readonly Play = Play;

  ngOnInit(): void {
    const roomId = this.route.snapshot.paramMap.get('id');
    if (roomId) {
      this.gameStateService.initialize(roomId);
    }

    this.state$.subscribe((state) => {
      if (state.view !== this.currentView) {
        this.previousView = this.currentView;
        this.currentView = state.view;
      }
    });
  }
}

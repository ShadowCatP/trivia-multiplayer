import { Component, Input } from '@angular/core';
import { PlayerScore } from '../../types/Question';

@Component({
  selector: 'app-scoreboard',
  imports: [],
  templateUrl: './scoreboard.component.html',
  styleUrl: './scoreboard.component.css',
})
export class ScoreboardComponent {
  @Input() scores: PlayerScore[] | null = null;
}

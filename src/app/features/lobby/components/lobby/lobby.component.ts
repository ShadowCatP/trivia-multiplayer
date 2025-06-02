import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Gamepad2, Users, Zap } from 'lucide-angular';
import { LobbiesListComponent } from '../lobbies-list/lobbies-list.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lobby',
  imports: [LucideAngularModule, ReactiveFormsModule, LobbiesListComponent],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.css',
})
export class LobbyComponent {
  readonly Gamepad2 = Gamepad2;
  readonly Users = Users;
  readonly Zap = Zap;
  private router = inject(Router);

  roomCodeForm = new FormGroup({
    roomId: new FormControl(''),
  });

  onJoin() {}

  hostGame() {
    this.router.navigate(['lobby', 'host']);
  }
}

import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Gamepad2, LucideAngularModule, Users, Zap } from 'lucide-angular';
import { RoomsListComponent } from '../rooms-list/rooms-list.component';

@Component({
  selector: 'app-lobby',
  imports: [LucideAngularModule, ReactiveFormsModule, RoomsListComponent],
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
    this.router.navigate(['room', 'host']);
  }
}

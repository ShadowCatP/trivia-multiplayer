import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Undo2 } from 'lucide-angular';

@Component({
  selector: 'app-home-button',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './home-button.component.html',
  styleUrl: './home-button.component.css',
})
export class HomeButtonComponent {
  readonly Back = Undo2;
}

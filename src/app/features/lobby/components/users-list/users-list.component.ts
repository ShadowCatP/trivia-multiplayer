import { Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Crown } from 'lucide-angular';

@Component({
  selector: 'app-users-list',
  imports: [LucideAngularModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css',
})
export class UsersListComponent {
  readonly Crown = Crown;

  @Input() users: string[] = [];
  @Input() host: string = '';
}

import { Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Crown } from 'lucide-angular';
import { User } from '../../types/User';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-list',
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css',
})
export class UsersListComponent {
  readonly Crown = Crown;

  @Input() users: User[] = [];
  @Input() host: string | null = null;
}

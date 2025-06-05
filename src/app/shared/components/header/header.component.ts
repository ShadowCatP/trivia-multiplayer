import { Component, inject } from '@angular/core';
import { AuthService } from '../../../features/auth/services/auth.service';
import { LogoutComponent } from '../logout/logout.component';

@Component({
  selector: 'app-header',
  imports: [LogoutComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  auth = inject(AuthService);
}

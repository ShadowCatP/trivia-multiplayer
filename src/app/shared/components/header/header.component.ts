import { Component, inject } from '@angular/core';
import { AuthService } from '../../../features/auth/services/auth.service';
import { LogoutComponent } from '../logout/logout.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [LogoutComponent, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  auth = inject(AuthService);
}

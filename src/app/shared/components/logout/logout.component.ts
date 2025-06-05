import { Component, inject } from '@angular/core';
import { AuthService } from '../../../features/auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.css',
})
export class LogoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  handleLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

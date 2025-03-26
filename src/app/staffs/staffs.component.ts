import { Component } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-staffs',
  templateUrl: './staffs.component.html',
  styleUrl: './staffs.component.css'
})
export class StaffsComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}

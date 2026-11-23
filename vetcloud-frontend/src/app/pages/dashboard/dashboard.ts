
import { Component } from '@angular/core';
import { Auth } from '../../core/auth/auth';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {

  constructor(private auth: Auth) {}

  get userName(): string {
    return this.auth.getUserName();
  }

  async logout(): Promise<void> {
    await this.auth.logout();
  }
}

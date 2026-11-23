
import { Component, inject } from '@angular/core';
import { Auth } from '../../core/auth/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  private auth = inject(Auth);

  async iniciarSesion(): Promise<void> {
    try {
      await this.auth.login();
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  }
}


import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Auth } from './core/auth/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {

  private auth = inject(Auth);
  private router = inject(Router);

  async ngOnInit(): Promise<void> {
    try {
      await this.auth.initialize();

      console.log('MSAL inicializado correctamente');

      // Redirigir al dashboard únicamente si el usuario
      // está autenticado y se encuentra en login o raíz.
      if (this.auth.isAuthenticated()) {

        const rutaActual = this.router.url.split('?')[0];

        if (
          rutaActual === '/login' ||
          rutaActual === '/'
        ) {
          await this.router.navigate(['/dashboard']);
        }
      }

    } catch (error) {
      console.error('Error inicializando MSAL:', error);
    }
  }
}


import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult } from '@azure/msal-browser';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  constructor(private msalService: MsalService) {}

  async initialize(): Promise<void> {
    await this.msalService.instance.initialize();

    const result: AuthenticationResult | null =
      await this.msalService.instance.handleRedirectPromise();

    if (result?.account) {
      this.msalService.instance.setActiveAccount(result.account);
    } else {
      const accounts = this.msalService.instance.getAllAccounts();

      if (accounts.length > 0) {
        this.msalService.instance.setActiveAccount(accounts[0]);
      }
    }

    // Validar identidad y acceso a VetCloud API
    this.obtenerIdentidad();
    await this.verificarTokenApi();
  }

  async login(): Promise<void> {
    await this.msalService.instance.loginRedirect({
      scopes: ['openid', 'profile']
    });
  }

  async logout(): Promise<void> {
    await this.msalService.instance.logoutRedirect();
  }

  isAuthenticated(): boolean {
    return this.msalService.instance.getAllAccounts().length > 0;
  }

  getUserName(): string {
    const account =
      this.msalService.instance.getActiveAccount() ??
      this.msalService.instance.getAllAccounts()[0];

    if (!account) {
      return 'Usuario';
    }

    const claims = account.idTokenClaims as
      Record<string, unknown> | undefined;

    const name = claims?.['name'];
    const givenName = claims?.['given_name'];
    const familyName = claims?.['family_name'];
    const emails = claims?.['emails'];

    if (typeof name === 'string' && name.trim()) {
      return name;
    }

    const fullName = [givenName, familyName]
      .filter(
        (value): value is string =>
          typeof value === 'string' && !!value.trim()
      )
      .join(' ');

    if (fullName) {
      return fullName;
    }

    if (account.name?.trim()) {
      return account.name;
    }

    if (
      Array.isArray(emails) &&
      typeof emails[0] === 'string'
    ) {
      return emails[0];
    }

    return account.username || 'Usuario';
  }

  obtenerIdentidad(): void {
    const account =
      this.msalService.instance.getActiveAccount() ??
      this.msalService.instance.getAllAccounts()[0];

    if (!account) {
      console.log('No hay usuario autenticado');
      return;
    }

    const claims = account.idTokenClaims;

    console.log('Identidad B2C disponible:', !!claims?.sub);
    console.log('SUB:', claims?.sub);
  }

  async verificarTokenApi(): Promise<void> {

    const account =
      this.msalService.instance.getActiveAccount() ??
      this.msalService.instance.getAllAccounts()[0];

    if (!account) {
      console.log('No hay usuario autenticado');
      return;
    }

    const scope =
      'https://medialert2026b2c.onmicrosoft.com/' +
      '80a3895a-81e8-4daa-a8ef-6ad5034c4e9c/' +
      'vetcloud.access';

    try {

      // 1. Obtener access token de Microsoft Entra B2C
      const result =
        await this.msalService.instance.acquireTokenSilent({
          scopes: [scope],
          account
        });

      console.log('Token API obtenido:', !!result.accessToken);

      // 2. Revisar claims del token
      const payload = result.accessToken.split('.')[1];

      if (!payload) {
        console.error('El token no contiene un payload JWT');
        return;
      }

      const base64 = payload
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const claims = JSON.parse(
        atob(
          base64.padEnd(
            Math.ceil(base64.length / 4) * 4,
            '='
          )
        )
      );

      console.table({
        audiencia: claims.aud,
        emisor: claims.iss,
        scope: claims.scp,
        politica: claims.tfp ?? claims.acr ?? 'No informado',
        subCoincideConIdToken:
          claims.sub === account.idTokenClaims?.sub
      });

      console.log('Scope solicitado:', scope);

      // 3. Consumir API protegida de VetCloud
      const respuesta = await fetch(
        'http://localhost:8080/api/veterinarias',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${result.accessToken}`
          }
        }
      );

      console.log('HTTP VetCloud API:', respuesta.status);

      if (respuesta.ok) {

        const veterinarias = await respuesta.json();

        console.log(
          'Veterinarias obtenidas:',
          veterinarias
        );

      } else {

        console.warn(
          'Acceso rechazado por VetCloud API:',
          respuesta.status
        );

      }

    } catch (error) {

      console.error(
        'Error al obtener token o consultar VetCloud API:',
        error
      );

    }
  }

async obtenerTokenApi(): Promise<string> {
  const account =
    this.msalService.instance.getActiveAccount() ??
    this.msalService.instance.getAllAccounts()[0];

  if (!account) {
    throw new Error('No existe un usuario autenticado');
  }

  const scope =
    'https://medialert2026b2c.onmicrosoft.com/' +
    '80a3895a-81e8-4daa-a8ef-6ad5034c4e9c/' +
    'vetcloud.access';

  const result =
    await this.msalService.instance.acquireTokenSilent({
      scopes: [scope],
      account
    });

  return result.accessToken;
}

}

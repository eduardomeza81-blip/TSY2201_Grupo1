
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners
} from '@angular/core';

import { provideRouter } from '@angular/router';

import {
  MSAL_INSTANCE,
  MsalService,
  MsalBroadcastService
} from '@azure/msal-angular';

import {
  IPublicClientApplication,
  PublicClientApplication
} from '@azure/msal-browser';

import { routes } from './app.routes';
import { msalConfig } from './core/auth/auth.config';

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalConfig);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },

    MsalService,
    MsalBroadcastService
  ]
};

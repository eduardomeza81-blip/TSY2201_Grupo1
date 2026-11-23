
import {
  BrowserCacheLocation,
  Configuration,
  LogLevel
} from '@azure/msal-browser';

export const b2cConfig = {
  tenantName: 'medialert2026b2c',
  tenantDomain: 'medialert2026b2c.onmicrosoft.com',
  //clientId: 'c77ca3a8-876a-4981-b040-4eab7562da96',
  clientId: '92787764-a0d4-48ac-84a8-57bc5520d2b7',
  signUpSignInPolicy: 'B2C_1_VetCloud_SignUpSignIn'
};

export const msalConfig: Configuration = {
  auth: {
    clientId: b2cConfig.clientId,

    authority:
      `https://${b2cConfig.tenantName}.b2clogin.com/` +
      `${b2cConfig.tenantDomain}/` +
      `${b2cConfig.signUpSignInPolicy}`,

    knownAuthorities: [
      `${b2cConfig.tenantName}.b2clogin.com`
    ],

    redirectUri: 'http://localhost:4200',

    postLogoutRedirectUri: 'http://localhost:4200/login'
  },

  cache: {
    cacheLocation: BrowserCacheLocation.SessionStorage
  },

  system: {
    loggerOptions: {
      loggerCallback: () => {},
      logLevel: LogLevel.Error,
      piiLoggingEnabled: false
    }
  }
};

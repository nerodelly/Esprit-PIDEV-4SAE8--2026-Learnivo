import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { KeycloakBearerInterceptor, KeycloakService } from 'keycloak-angular';

export function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'http://localhost:8180',
        realm: 'learnivo',
        clientId: 'frontend-client'
      },
      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false
      },
      enableBearerInterceptor: true,
      bearerPrefix: 'Bearer',
      bearerExcludedUrls: ['/assets']
    }).then((authenticated) => {
      if (authenticated) {
        const roles = keycloak.getKeycloakInstance().realmAccess?.roles || [];
        const realmRoles = roles.map(r => r.toUpperCase());
        const isAdmin = realmRoles.includes('ADMIN');
        
        // Check for custom role attribute if not admin
        const profile = keycloak.getKeycloakInstance().idTokenParsed;
        const customRole = (profile?.['role'] || (profile?.['attributes']?.['role'] ? profile?.['attributes']?.['role'][0] : null))?.toString().toUpperCase();

        if (window.location.pathname === '/' || window.location.pathname === '') {
          if (isAdmin) {
            window.location.href = '/admin';
          } else if (customRole === 'PROFESSOR') {
             // Future: Redirect to /professor if a dashboard is created
             // Currently redirecting to HOME with professor nav links
          }
        }
      }
    });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    },
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloakBearerInterceptor,
      multi: true
    }
  ]
};

import { Injectable, inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private keycloak = inject(KeycloakService);

  login(): void {
    this.keycloak.login();
  }

  logout(): void {
    this.keycloak.logout(window.location.origin);
  }

  register(): void {
    this.keycloak.register();
  }

  getToken(): string | null {
    return this.keycloak.getKeycloakInstance().token || null;
  }

  isAuthenticated(): boolean {
    return this.keycloak.isLoggedIn();
  }

  getCurrentUser(): any {
    if (!this.isAuthenticated()) return null;
    const profile = this.keycloak.getKeycloakInstance().idTokenParsed;
    
    // Check custom attribute 'role' (from register) OR default from realm roles
    const customRole = profile?.['role'] || (profile?.['attributes']?.['role'] ? profile?.['attributes']?.['role'][0] : null);
    const realmRoles = profile?.['realm_access']?.['roles'] || [];
    const isAdmin = realmRoles.map(r => r.toUpperCase()).includes('ADMIN');
    
    let finalRole = 'STUDENT';
    if (isAdmin) finalRole = 'ADMIN';
    else if (customRole) finalRole = customRole.toUpperCase();

    return {
      id: profile?.sub,
      email: profile?.['email'],
      role: finalRole,
      name: profile?.['name'] || profile?.['preferred_username']
    };
  }
}

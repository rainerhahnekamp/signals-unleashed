import { Injectable, NgZone } from '@angular/core';
import Keycloak from 'keycloak-js';

export interface UserProfile {
  sub: string;
  email: string;
  given_name: string;
  family_name: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class KeycloakService {
  _keycloak: Keycloak | undefined;
  profile: UserProfile | undefined;

  constructor(private ngZone: NgZone) { }

  get keycloak() {
    if (!this._keycloak) {
      this._keycloak = new Keycloak({
        url: 'https://auth.eternal-holidays.net:8443/',
        realm: 'eternal',
        clientId: 'account',
      });
    }
    return this._keycloak;
  }

  async init() {
    return this.ngZone.runOutsideAngular(async () => {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
          window.location.origin + '/assets/silent-check-sso.html',
      });

      if (!authenticated) {
        return authenticated;
      }

      const userInfo = await this.keycloak.loadUserInfo();
      this.ngZone.run(() => {
        this.profile = userInfo as unknown as UserProfile;
        this.profile.token = this.keycloak.token || '';
      });

      return true;
    });
  }

  login() {
    return this.keycloak.login();
  }

  logout() {
    return this.keycloak.logout({ redirectUri: window.location.origin });
  }
}

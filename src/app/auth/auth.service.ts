import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApiService } from './auth-api.service';
import { Token } from './auth.interfaces';
import { throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  redirectUrl: string|undefined;
  private IsAdmin: boolean|undefined;

  constructor(
    private router: Router,
    private api: AuthApiService,
  ) { }

  getAccessToken() {
    return sessionStorage.getItem('accessToken');
  }

  getRefreshToken() {
    return sessionStorage.getItem('refreshToken');
  }

  getUserName() {
    return sessionStorage.getItem('username');
  }

  getUid() {
    return sessionStorage.getItem('uid');
  }

  getAllClaims() {
    const accessToken = this.getAccessToken();
    if (accessToken == null) return null;
    console.log(this.parseJwt(accessToken));
    return this.parseJwt(accessToken);
  }

  setToken(token: Token) {
    sessionStorage.accessToken = token.accessToken;
    sessionStorage.refreshToken = token.refreshToken;
    const claims = this.parseJwt(token.accessToken);
    sessionStorage.username = claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    sessionStorage.uid = claims.uid;
  }

  logout() {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('uid');
    this.IsAdmin = undefined;
    this.router.navigate(['login']);
  }

  isLoggedIn(): boolean {
    const token: string = sessionStorage.accessToken;
    if (token) { return true; }
    return false;
  }

  isAdmin(): boolean {
    if (this.IsAdmin != null) {return this.IsAdmin; }
    const token = this.getAccessToken();
    if (token == null) {return false; }
    const tokenParsed = this.parseJwt(token);
    if (tokenParsed == null) {return false; }
    if (!tokenParsed.hasOwnProperty('isAdmin')) {return false; }
    const result = tokenParsed.isAdmin === 'true';
    this.IsAdmin = result;
    return result;
  }

  refreshAccessToken(accessToken: string, refreshToken: string) {
    return this.api.refreshAccessToken(accessToken, refreshToken).pipe(
      tap(x => {
        // store token
        this.setToken(x);
      }),
      catchError(err => {
        // unable to refresh the accesstoken
        this.logout();
        return throwError(err);
      })
    );
  }

  parseJwt(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
    );
    try {
      return JSON.parse(jsonPayload);
    } catch (e) {
      return undefined;
    }
  }
}

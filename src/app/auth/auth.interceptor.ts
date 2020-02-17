import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';

import { AuthService } from './auth.service';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { Token } from './auth.interfaces';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private mostRecentTokenSource = new BehaviorSubject<any>(null);

  constructor(private auth: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getAccessToken();
    const newReq = (token != null) ? this.addTokenToRequest(req, token) : req;
    return next.handle(newReq).pipe(
      catchError(err => {
        const t = err.headers.get('WWW-Authenticate');
        if (t != null && t.includes('token expired')) {
          return this.handleExpiredToken(req, next);
        }
        return throwError(err);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handleExpiredToken(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = this.auth.getAccessToken();
    const refreshToken = this.auth.getRefreshToken();
    if (accessToken == null || refreshToken == null) { return of(); }
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.mostRecentTokenSource.next(null);
      return this.auth.refreshAccessToken(accessToken, refreshToken).pipe(
        switchMap(token => {
          this.isRefreshing = false;
          this.mostRecentTokenSource.next(token);
          return next.handle(this.addTokenToRequest(request, token.accessToken));
        }));
    } else {
      return this.mostRecentTokenSource.pipe(
        filter(token => token != null),
        take(1),
        switchMap((token: Token) => {
          return next.handle(this.addTokenToRequest(request, token.accessToken));
        }),
      );
    }
  }

}

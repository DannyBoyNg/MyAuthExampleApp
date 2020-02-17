import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { AuthApiService } from '../auth-api.service';

@Injectable({
  providedIn: 'root'
})
export class ExportGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private api: AuthApiService
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const url: string = state.url;
    const trialId = next.queryParamMap.get('tid');
    if (trialId == null) {return false; }
    if (this.auth.isAdmin()) {
      return true;
    }
    return this.api.hasRole(trialId, 'export');
  }
}

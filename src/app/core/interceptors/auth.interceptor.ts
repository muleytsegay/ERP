import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip interceptor for auth-related requests to avoid infinite loops
    if (this.isAuthRequest(req.url)) {
      return next.handle(req);
    }

    console.log('Auth interceptor: Processing request to', req.url);

    // Use getValidToken to ensure we have a fresh token
    return this.authService.getValidToken().pipe(
      switchMap(token => {
        console.log('Auth interceptor: Got valid token, adding to request');
        const tokenizedRequest = this.addTokenToRequest(req, token);
        return next.handle(tokenizedRequest);
      }),
      catchError(tokenError => {
        console.error('Auth interceptor: Failed to get valid token:', tokenError);
        
        // If we can't get a valid token, try the request without auth
        // (let the server return 401 if needed)
        return next.handle(req).pipe(
          catchError(error => {
            if (error instanceof HttpErrorResponse && 
                (error.status === 401 || error.status === 403) && 
                !this.isAuthRequest(req.url)) {
              console.log('Auth interceptor: Got 401/403, attempting token refresh');
              return this.handle401Error(req, next);
            }
            return throwError(() => error);
          })
        );
      })
    );
  }

  private isAuthRequest(url: string): boolean {
    return url.includes('/protocol/openid-connect/') || 
           url.includes('/auth/') || 
           url.includes('/login') || 
           url.includes('/token') ||
           url.includes('/userinfo');
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    console.log('Auth interceptor: Adding token to request:', {
      url: request.url,
      method: request.method,
      tokenLength: token?.length || 0,
      tokenPrefix: token?.substring(0, 20) + '...'
    });
    
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((tokenResponse: any) => {
          this.isRefreshing = false;
          const newToken = this.authService.getToken();
          this.refreshTokenSubject.next(newToken);
          
          if (newToken) {
            return next.handle(this.addTokenToRequest(request, newToken));
          }
          
          // If refresh failed, redirect to login
          this.authService.logoutLocal(); // Use local logout to avoid more API errors
          return throwError(() => new Error('Token refresh failed'));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.authService.logoutLocal(); // Use local logout to avoid more API errors
          return throwError(() => err);
        })
      );
    } else {
      // Wait for the token refresh to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => next.handle(this.addTokenToRequest(request, token)))
      );
    }
  }
}

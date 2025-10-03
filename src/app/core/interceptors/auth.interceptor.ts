import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('🔐 AuthInterceptor: Intercepting request to:', req.url);

    // Skip auth for login requests
    if (req.url.includes('/login') || req.url.includes('/register')) {
      console.log('🔐 AuthInterceptor: Skipping auth for login/register');
      return next.handle(req);
    }

    // Get token and add to request
    const token = this.authService.getToken();
    console.log(
      '🔐 AuthInterceptor: Retrieved token:',
      token ? 'Token exists' : 'No token found'
    );

    if (!token) {
      console.log(
        '🔐 AuthInterceptor: No token, proceeding without auth header'
      );
      return next.handle(req);
    }

    const tokenizedRequest = this.addTokenToRequest(req, token);
    console.log('🔐 AuthInterceptor: Added auth header to request');
    console.log('🔐 Request details:', {
      method: req.method,
      url: req.url,
      body: req.body,
      headers: tokenizedRequest.headers.keys(),
    });

    return next.handle(tokenizedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 errors by logging out
        if (error.status === 401) {
          console.log('Auth interceptor: Got 401, logging out user');
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(
    request: HttpRequest<any>,
    token: string
  ): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

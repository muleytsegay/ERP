import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip auth for login requests
    if (req.url.includes('/login') || req.url.includes('/register')) {
      return next.handle(req);
    }

    // Get token and add to request
    const token = this.authService.getToken();
    if (!token) {
      return next.handle(req);
    }

    const tokenizedRequest = this.addTokenToRequest(req, token);
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

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}

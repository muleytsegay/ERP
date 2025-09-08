import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError, switchMap } from 'rxjs';
import { User, UserRole } from '../../features/auth/profile/models/user.model';

interface LoginRequest {
  email: string;
  password: string;
}

interface KeycloakTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // 🔑 CONFIG (adjust to your setup)
  private realm = 'hrms';
  private keycloakBaseUrl = 'http://localhost:8080'; // Gateway forwards to Keycloak
  private clientId = 'hrms-api';
  private clientSecret = '46aKzP0Xe4hXANdIpkpezBGPMl1bBY4c';

  private tokenUrl = `${this.keycloakBaseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
  private userInfoUrl = `${this.keycloakBaseUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`;
  private logoutUrl = `${this.keycloakBaseUrl}/realms/${this.realm}/protocol/openid-connect/logout`;

  constructor(private http: HttpClient) {
    this.loadUserFromToken();
  }

  // 🔑 Login via Keycloak
  login(credentials: LoginRequest): Observable<User> {
    const body = new URLSearchParams();
    body.set('client_id', this.clientId);
    body.set('client_secret', this.clientSecret);
    body.set('grant_type', 'password');
    body.set('email', credentials.email);
    body.set('password', credentials.password);

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<KeycloakTokenResponse>(this.tokenUrl, body.toString(), { headers }).pipe(
      tap(res => {
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('refreshToken', res.refresh_token);
      }),
      switchMap(res =>
        this.http.get<User>(this.userInfoUrl, {
          headers: { Authorization: `Bearer ${res.access_token}` }
        })
      ),
      tap(user => this.currentUserSubject.next(user)),
      catchError(error => {
        console.error('Login failed:', error);
        return throwError(() => error);
      })
    );
  }

  // 🚪 Logout from Keycloak
  logout(): Observable<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    const body = new URLSearchParams();
    body.set('client_id', this.clientId);
    body.set('client_secret', this.clientSecret);
    if (refreshToken) {
      body.set('refresh_token', refreshToken);
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<void>(this.logoutUrl, body.toString(), { headers }).pipe(
      tap(() => this.clearAuthData()),
      catchError(err => {
        this.clearAuthData();
        return throwError(() => err);
      })
    );
  }

  // 🔄 Refresh token
  refreshToken(): Observable<KeycloakTokenResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const body = new URLSearchParams();
    body.set('client_id', this.clientId);
    body.set('client_secret', this.clientSecret);
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', refreshToken);

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<KeycloakTokenResponse>(this.tokenUrl, body.toString(), { headers }).pipe(
      tap(res => {
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('refreshToken', res.refresh_token);
      }),
      catchError(error => {
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }

  // 👤 Load user profile
  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token && this.isAuthenticated()) {
      this.http.get<User>(this.userInfoUrl, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: user => this.currentUserSubject.next(user),
        error: () => this.clearAuthData()
      });
    }
  }

  // ✏️ Update profile (Keycloak account endpoint)
  updateProfile(userData: Partial<User>): Observable<User> {
    const token = this.getToken();
    if (!token) return throwError(() => new Error('Not authenticated'));

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    // ⚠️ Uses Keycloak account REST API (must enable Account REST API in realm)
    return this.http.put<User>(`${this.keycloakBaseUrl}/realms/${this.realm}/account`, userData, { headers }).pipe(
      tap(updatedUser => {
        this.currentUserSubject.next(updatedUser);
      }),
      catchError(error => {
        console.error('Profile update failed:', error);
        return throwError(() => error);
      })
    );
  }

  // 🔑 Change password
  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    const token = this.getToken();
    if (!token) return throwError(() => new Error('Not authenticated'));

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const payload = {
      currentPassword: oldPassword,
      newPassword,
      confirmation: newPassword
    };

    return this.http.post<void>(`${this.keycloakBaseUrl}/realms/${this.realm}/account/credentials/password`, payload, { headers }).pipe(
      catchError(error => {
        console.error('Password change failed:', error);
        return throwError(() => error);
      })
    );
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.currentUserSubject.next(null);
  }

  // --- Helpers ---
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUserValue();
    return user?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUserValue();
    return user ? roles.includes(user.role) : false;
  }
}

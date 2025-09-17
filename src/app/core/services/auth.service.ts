import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError, switchMap, of, map } from 'rxjs';
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
  private keycloakBaseUrl = 'https://hrms-microservices-1-07vv.onrender.com'; // Gateway forwards to Keycloak
  private clientId = 'hrms-api';
  private clientSecret = 'Gw9QCikk2bBzbqF6IS3O7e8UvM7Dn7MT';

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
    body.set('username', credentials.email);
    body.set('password', credentials.password);
    body.set('scope', 'openid profile email'); // Add required scopes

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<KeycloakTokenResponse>(this.tokenUrl, body.toString(), { headers }).pipe(
      tap(res => {
        console.log('Token received, storing in localStorage');
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('refreshToken', res.refresh_token);
      }),
      switchMap(res =>
        this.http.get<User>(this.userInfoUrl, {
          headers: { Authorization: `Bearer ${res.access_token}` }
        })
      ),
      tap(user => {
        console.log('Login successful, storing user data');
        // Store user data in localStorage for refresh persistence
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Login failed:', error);
        return throwError(() => error);
      })
    );
  }

  // 🚪 Logout from Keycloak
  logout(): Observable<void> {
    console.log('AuthService: Starting logout process');
    
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('AuthService: Logout - refresh token available:', !!refreshToken);
    
    const body = new URLSearchParams();
    body.set('client_id', this.clientId);
    body.set('client_secret', this.clientSecret);
    if (refreshToken) {
      body.set('refresh_token', refreshToken);
      console.log('AuthService: Logout - added refresh token to request');
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    console.log('AuthService: Logout - making request to:', this.logoutUrl);

    return this.http.post<void>(this.logoutUrl, body.toString(), { headers }).pipe(
      tap(() => {
        console.log('AuthService: Logout request successful, clearing auth data');
        this.clearAuthData();
      }),
      catchError((err: HttpErrorResponse) => {
        console.error('AuthService: Logout request failed:', {
          status: err.status,
          message: err.message,
          error: err.error
        });
        // Always clear auth data even if logout request fails
        console.log('AuthService: Clearing auth data despite logout error');
        this.clearAuthData();
        return throwError(() => err);
      })
    );
  }

  // Simple logout without API call (for cases where token is invalid)
  logoutLocal(): void {
    console.log('AuthService: Performing local logout (no API call)');
    this.clearAuthData();
    console.log('AuthService: Local logout completed');
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
    const storedUser = localStorage.getItem('user');
    
    if (!token) {
      console.log('No token found, clearing auth data');
      this.clearAuthData();
      return;
    }

    // Check if token is expired
    if (!this.isAuthenticated()) {
      console.log('Token expired, attempting refresh...');
      this.refreshToken().subscribe({
        next: () => {
          console.log('Token refreshed successfully');
          this.loadUserFromToken(); // Retry loading user after refresh
        },
        error: (refreshError) => {
          console.error('Token refresh failed:', refreshError);
          this.clearAuthData();
        }
      });
      return;
    }

    // If we have stored user data and a valid token, use that instead of calling userinfo
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log('Loading user from localStorage:', user);
        this.currentUserSubject.next(user);
        return;
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('user'); // Clear corrupted user data
      }
    }

    // Fallback: try to get user info from Keycloak (only if no stored user)
    console.log('No stored user data, attempting to fetch from userinfo endpoint');
    this.http.get<User>(this.userInfoUrl, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: user => {
        console.log('User loaded from userinfo endpoint:', user);
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      },
      error: (error) => {
        console.error('Failed to load user info:', error);
        
        // If 403 or 401, token is likely invalid or expired
        if (error.status === 403 || error.status === 401) {
          console.log('Token invalid or expired, attempting refresh...');
          
          // Try to refresh token first
          this.refreshToken().subscribe({
            next: () => {
              console.log('Token refreshed, retrying user info...');
              // Retry getting user info with new token
              this.loadUserFromToken();
            },
            error: (refreshError) => {
              console.error('Token refresh failed:', refreshError);
              this.clearAuthData();
            }
          });
        } else {
          // For other errors, just clear auth data
          this.clearAuthData();
        }
      }
    });
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
    console.log('AuthService: Clearing authentication data');
    
    const hadToken = !!localStorage.getItem('token');
    const hadRefreshToken = !!localStorage.getItem('refreshToken');
    const hadUser = !!localStorage.getItem('user');
    
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user'); // Also clear stored user data
    this.currentUserSubject.next(null);
    
    console.log('AuthService: Auth data cleared:', {
      hadToken,
      hadRefreshToken,
      hadUser,
      currentUserSubjectValue: this.currentUserSubject.value
    });
  }

  // --- Helpers ---
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Get a valid token, refreshing if necessary
  getValidToken(): Observable<string> {
    const token = this.getToken();
    
    console.log('getValidToken: Current token exists:', !!token);
    
    if (!token) {
      console.log('getValidToken: No token available');
      return throwError(() => new Error('No token available'));
    }

    if (this.isAuthenticated()) {
      console.log('getValidToken: Token is valid, returning current token');
      return of(token);
    }

    // Token is expired, try to refresh
    console.log('getValidToken: Token expired, attempting refresh...');
    return this.refreshToken().pipe(
      map(() => {
        const newToken = this.getToken();
        console.log('getValidToken: Got new token after refresh:', !!newToken);
        if (!newToken) {
          throw new Error('Failed to get new token after refresh');
        }
        return newToken;
      }),
      catchError(error => {
        console.error('getValidToken: Token refresh failed:', error);
        this.clearAuthData();
        return throwError(() => new Error('Token refresh failed'));
      })
    );
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      console.log('No token found');
      return false;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const isValid = payload.exp > currentTime;
      
      if (!isValid) {
        console.log('Token expired:', new Date(payload.exp * 1000));
      }
      
      return isValid;
    } catch (error) {
      console.error('Invalid token format:', error);
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

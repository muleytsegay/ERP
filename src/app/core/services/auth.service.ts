import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  tap,
  catchError,
  throwError,
  map,
  switchMap,
} from 'rxjs';
import {
  User,
  UserRole,
  LoginRequest,
  AuthResponse,
} from '../../features/auth/profile/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private baseUrl =
    'https://gateway-microservice.onrender.com/hrms/api/v1/employees';

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  // 🔑 Login against backend
  login(credentials: LoginRequest): Observable<User> {
    const loginPayload = {
      username: credentials.email,
      password: credentials.password,
    };

    return this.http.post<any>(`${this.baseUrl}/login`, loginPayload).pipe(
      tap((res) => {
        console.log('Login response received:', res);
        console.log('Raw response type:', typeof res);
        console.log('Response keys:', Object.keys(res));

        // Handle the actual response format
        const token = res.accessToken || res.token;
        const refreshToken = res.refreshToken;
        const roles = res.roles || [];

        if (token) {
          localStorage.setItem('token', token);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }

          // Create user from JWT token instead of calling /me endpoint
          try {
            const tokenPayload = this.decodeJwtToken(token);
            console.log('Decoded JWT payload:', tokenPayload);

            // Check for roles in both response and JWT token
            const jwtRoles =
              tokenPayload.roles ||
              tokenPayload.authorities ||
              tokenPayload.scope?.split(' ') ||
              [];
            const allRoles = [...roles, ...jwtRoles];
            console.log('Roles from response:', roles);
            console.log('Roles from JWT:', jwtRoles);
            console.log('Combined roles:', allRoles);

            const user: User = {
              id: tokenPayload.sub || tokenPayload.id || 'unknown',
              username:
                tokenPayload.preferred_username ||
                tokenPayload.username ||
                credentials.email,
              email: tokenPayload.email || credentials.email,
              firstName:
                tokenPayload.given_name || tokenPayload.first_name || 'Unknown',
              lastName:
                tokenPayload.family_name || tokenPayload.last_name || 'User',
              role: this.determineUserRole(allRoles),
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            console.log('Created user from JWT:', user);
            localStorage.setItem('user', JSON.stringify(user));
            this.currentUserSubject.next(user);
          } catch (jwtError) {
            console.error('Failed to decode JWT token:', jwtError);
            // Fall back to creating a basic user
            const user: User = {
              id: 'unknown',
              username: credentials.email,
              email: credentials.email,
              firstName: 'Unknown',
              lastName: 'User',
              role: this.determineUserRole(roles),
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            localStorage.setItem('user', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        } else {
          throw new Error('No access token received');
        }
      }),
      map((res) => {
        // Return the user we just created and stored
        console.log('Login raw response:', res);
        console.log('Roles field from login response:', res.roles);

        const tokenPayload = this.decodeJwtToken(res.accessToken);
        console.log('JWT payload roles:', tokenPayload?.roles);
        return this.getCurrentUserValue()!;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Login failed:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);
        return throwError(() => error);
      })
    );
  }

  // 🚪 Logout
  logout(): void {
    console.log('Performing logout, clearing localStorage');
    this.clearAuthData();
  }

  // 👤 Get current user info from backend
  getCurrentUser(): Observable<User> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }

    return this.http
      .get<any>(`${this.baseUrl}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        map((userResponse) => {
          console.log('User info received from /me endpoint:', userResponse);

          // Try to get additional info from JWT token
          const tokenData = this.decodeJwtToken(token);
          console.log('Decoded token data:', tokenData);

          // Map the backend response to our User interface, preferring JWT token data for names
          const user: User = {
            id: userResponse.id || tokenData?.sub || userResponse.email,
            username:
              userResponse.username ||
              tokenData?.preferred_username ||
              userResponse.email,
            email: userResponse.email || tokenData?.email,
            firstName:
              tokenData?.given_name ||
              userResponse.firstName ||
              userResponse.given_name ||
              'Unknown',
            lastName:
              tokenData?.family_name ||
              userResponse.lastName ||
              userResponse.family_name ||
              'User',
            role: this.determineUserRole(
              tokenData?.roles || userResponse.roles || []
            ),
            createdAt: userResponse.createdAt
              ? new Date(userResponse.createdAt)
              : new Date(),
            updatedAt: userResponse.updatedAt
              ? new Date(userResponse.updatedAt)
              : new Date(),
            isActive:
              userResponse.isActive !== undefined
                ? userResponse.isActive
                : true,
          };

          console.log('Mapped user object:', user);

          // Update stored user and current user subject
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);

          return user;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Failed to get current user:', error);
          if (error.status === 401) {
            // Token is invalid, clear auth data
            this.clearAuthData();
          }
          return throwError(() => error);
        })
      );
  }

  // 🔄 Load user from localStorage on refresh
  private loadUserFromStorage(): void {
    console.log('Loading user from storage...');
    const token = this.getToken();
    const storedUser = localStorage.getItem('user');

    console.log('Token exists:', !!token);
    console.log('Stored user exists:', !!storedUser);

    if (token && storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        console.log('Loaded user from storage:', user);
        this.currentUserSubject.next(user);
        // Just use the stored user data
      } catch (err) {
        console.error('Failed to parse stored user, fetching fresh data');
        this.getCurrentUser().subscribe({
          error: () => {
            console.error('Failed to get fresh user data, clearing auth');
            this.clearAuthData();
          },
        });
      }
    } else if (token && !storedUser) {
      console.log('No stored user but token exists, fetching user data...');
      this.getCurrentUser().subscribe({
        error: () => {
          console.error('Failed to get user data, clearing auth');
          this.clearAuthData();
        },
      });
    } else {
      console.log('No token found, clearing auth data');
      this.clearAuthData();
    }
  }

  // ✏️ Update profile
  updateProfile(userData: Partial<User>): Observable<User> {
    const token = this.getToken();
    if (!token) return throwError(() => new Error('Not authenticated'));

    return this.http
      .put<User>(`${this.baseUrl}/profile`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        tap((updatedUser) => {
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Profile update failed:', error);
          return throwError(() => error);
        })
      );
  }

  // 🔑 Change password
  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    const token = this.getToken();
    if (!token) return throwError(() => new Error('Not authenticated'));

    const payload = {
      currentPassword: oldPassword,
      newPassword: newPassword,
    };

    return this.http
      .post<void>(`${this.baseUrl}/change-password`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Password change failed:', error);
          return throwError(() => error);
        })
      );
  }

  // Helper method to determine user role from roles array
  private determineUserRole(roles: string[]): UserRole {
    console.log('Determining user role from roles:', roles);

    if (!roles || roles.length === 0) {
      console.log('No roles found, defaulting to EMPLOYEE');
      return UserRole.EMPLOYEE;
    }

    // Normalize roles to lowercase for comparison
    const normalizedRoles = roles.map((role) => role.toLowerCase().trim());
    console.log('Normalized roles:', normalizedRoles);

    // Check for specific roles in priority order (exact matches first, then partial)
    if (
      normalizedRoles.some(
        (role) =>
          role === 'admin' ||
          role === 'administrator' ||
          role === 'super_admin' ||
          role === 'superadmin'
      )
    ) {
      console.log('Admin role detected');
      return UserRole.ADMIN;
    }

    if (
      normalizedRoles.some(
        (role) =>
          role === 'hr' ||
          role === 'human_resources' ||
          role === 'hr_manager' ||
          role === 'hr_admin'
      )
    ) {
      console.log('HR role detected');
      return UserRole.HR;
    }

    if (
      normalizedRoles.some(
        (role) =>
          role === 'finance' ||
          role === 'financial' ||
          role === 'finance_manager' ||
          role === 'accountant'
      )
    ) {
      console.log('Finance role detected');
      return UserRole.FINANCE;
    }

    console.log('No specific role matched, defaulting to EMPLOYEE');
    // Default to employee
    return UserRole.EMPLOYEE;
  }

  // Decode JWT token to extract user information
  private decodeJwtToken(token: string): any {
    try {
      // JWT tokens have 3 parts separated by dots: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT token format');
        return null;
      }

      // Decode the payload (second part)
      const payload = parts[1];
      // Add padding if needed
      const paddedPayload =
        payload + '=='.substring(0, (4 - (payload.length % 4)) % 4);

      const decodedPayload = atob(paddedPayload);
      const tokenData = JSON.parse(decodedPayload);

      console.log('Successfully decoded JWT token:', tokenData);
      return tokenData;
    } catch (error) {
      console.error('Failed to decode JWT token:', error);
      return null;
    }
  }

  // Clear authentication data
  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    console.log('Auth data cleared');
  }

  // --- Helpers ---
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUserValue();
    const isAuth = !!(token && user);
    console.log(
      'AuthService: isAuthenticated check - token:',
      !!token,
      'user:',
      !!user,
      'result:',
      isAuth
    );
    return isAuth;
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

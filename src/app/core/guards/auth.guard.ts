
import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // Role-based access
    const allowedRoles = route.data['roles'] as string[] | undefined;
    if (allowedRoles && allowedRoles.length > 0) {
      const user = this.authService.getCurrentUserValue();
      if (!user || !user.role || !allowedRoles.includes(user.role)) {
        // Optionally redirect to dashboard or forbidden page
        this.router.navigate(['/dashboard']);
        return false;
      }
    }
    return true;
  }
}

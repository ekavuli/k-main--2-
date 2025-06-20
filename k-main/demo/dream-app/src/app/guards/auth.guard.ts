import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    console.log('User not logged in, redirecting to login page');
    router.navigate(['/login']);
    return false;
  }

  console.log('User is logged in, allowing access');
  return true;
};

export const AdminGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    console.log('User not logged in, redirecting to login page');
    router.navigate(['/login']);
    return false;
  }

  if (!auth.isAdmin()) {
    console.log('User is not admin, access denied');
    router.navigate(['/home']);
    return false;
  }
  
  console.log('User is admin, allowing access');
  return true;
};
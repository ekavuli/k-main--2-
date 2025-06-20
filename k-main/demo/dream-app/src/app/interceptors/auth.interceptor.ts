import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  console.log('AuthInterceptor - Processing request:', req.method, req.url);
  console.log('AuthInterceptor - Token exists:', !!token);
  
  let authReq = req;
  
  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('AuthInterceptor - Added Authorization header');
  }
  
  return next(authReq).pipe(
    catchError(error => {
      console.error('AuthInterceptor - Request failed:', error);
      if (error.status === 401) {
        console.error('AuthInterceptor - 401 Unauthorized, token may be invalid');
        // Optionally logout user on 401
        // authService.logout();
      }
      return throwError(() => error);
    })
  );
};

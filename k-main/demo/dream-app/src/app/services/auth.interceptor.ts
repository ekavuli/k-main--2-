import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    let authReq = req;
    
    if (token) {
      authReq = req.clone({
        setHeaders: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('AuthInterceptor - Added Authorization header for:', req.url);
    }
    
    return next.handle(authReq).pipe(
      catchError(error => {
        console.error('AuthInterceptor - Request failed:', error);
        if (error.status === 401) {
          console.error('AuthInterceptor - 401 Unauthorized, redirecting to login');
          this.auth.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

interface AuthResponse {
  token: string;
  username: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'token';
  private usernameKey = 'username';
  private rolesKey = 'roles';
  private apiUrl = 'http://localhost:8081/api';
  private cachedToken: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<boolean> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }),
      withCredentials: true
    };

    console.log('Attempting login for user:', username);
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { username, password }, httpOptions)
      .pipe(
        tap(response => console.log('Raw login response:', response)),
        map(response => {
          if (response && response.token) {
            console.log('Login successful, token received');
            localStorage.setItem(this.tokenKey, response.token);
            localStorage.setItem(this.usernameKey, response.username);
            localStorage.setItem(this.rolesKey, JSON.stringify(response.roles || []));
            this.cachedToken = response.token; // Cache the token
            return true;
          }
          console.warn('Login response missing token');
          return false;
        }),
        catchError(err => {
          console.error('Login error details:', {
            status: err.status,
            message: err.message,
            error: err.error,
            url: err.url
          });
          
          let errorMessage = 'Authentication failed';
          if (err.status === 401) {
            errorMessage = 'Invalid username or password';
          } else if (err.status === 0) {
            errorMessage = 'Cannot connect to server';
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usernameKey);
    localStorage.removeItem(this.rolesKey);
    this.cachedToken = null; // Clear cached token
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      if (now >= exp) {
        console.log('Token is expired, removing from storage');
        this.logout();
        return false;
      }
      
      return true;
    } catch (e) {
      console.error('Error parsing token:', e);
      this.logout();
      return false;
    }
  }

  getToken(): string | null {
    if (this.cachedToken === null) {
      this.cachedToken = localStorage.getItem(this.tokenKey);
      if (this.cachedToken) {
        console.log('AuthService - Retrieved token from storage');
      } else {
        console.log('AuthService - No token found in storage');
      }
    }
    return this.cachedToken;
  }

  getUsername(): string | null {
    return localStorage.getItem(this.usernameKey);
  }

  getRoles(): string[] {
    const roles = localStorage.getItem(this.rolesKey);
    const parsedRoles = roles ? JSON.parse(roles) : [];
    console.log('AuthService - Retrieved roles:', parsedRoles);
    return parsedRoles;
  }

  isAdmin(): boolean {
    const roles = this.getRoles();
    const isAdminUser = roles.includes('ROLE_ADMIN');
    console.log('AuthService - Is admin check:', isAdminUser, 'Roles:', roles);
    return isAdminUser;
  }

  canAccess(requiredRole: string): boolean {
    return this.isLoggedIn() && this.getRoles().includes(requiredRole);
  }

  searchOsobaVakcina(query: string): Observable<any> {
    const token = this.getToken();
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Add authorization header only if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return this.http.get(`${this.apiUrl}/osobavakcina/search`, {
      headers,
      params: { query: query }
    }).pipe(
      tap(response => console.log('Search response:', response)),
      catchError(err => {
        console.error('Error while searching:', err);
        if (err.status === 401 || err.status === 403) {
          // Don't automatically redirect for search - it might be a public endpoint
          console.warn('Authentication issue during search');
        }
        return throwError(() => new Error(err.error?.message || 'Search failed. Please try again.'));
      })
    );
  }

  // Add a method to make authenticated requests
  private makeAuthenticatedRequest(url: string, options: any = {}) {
    const token = this.getToken();
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('AuthService - Adding Authorization header to request');
    } else {
      console.warn('AuthService - No token available for authenticated request');
    }
    
    return { ...options, headers };
  }

  // Vaccination campaign methods
  createVaccinationCampaign(campaign: any): Observable<any> {
    const requestOptions = this.makeAuthenticatedRequest(`${this.apiUrl}/vaccination/create`);
    return this.http.post(`${this.apiUrl}/vaccination/create`, campaign, requestOptions).pipe(
      tap(response => console.log('Create vaccination campaign response:', response)),
      catchError(err => {
        console.error('Error creating vaccination campaign:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to create vaccination campaign'));
      })
    );
  }

  getAllVaccinationCampaigns(): Observable<any> {
    const requestOptions = this.makeAuthenticatedRequest(`${this.apiUrl}/vaccination/all`);
    return this.http.get(`${this.apiUrl}/vaccination/all`, requestOptions).pipe(
      tap(response => console.log('Get all vaccination campaigns response:', response)),
      catchError(err => {
        console.error('Error getting vaccination campaigns:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to get vaccination campaigns'));
      })
    );
  }

  updateVaccinationCampaign(id: number, campaign: any): Observable<any> {
    const requestOptions = this.makeAuthenticatedRequest(`${this.apiUrl}/vaccination/${id}`);
    return this.http.put(`${this.apiUrl}/vaccination/${id}`, campaign, requestOptions).pipe(
      tap(response => console.log('Update vaccination campaign response:', response)),
      catchError(err => {
        console.error('Error updating vaccination campaign:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to update vaccination campaign'));
      })
    );
  }

  deleteVaccinationCampaign(id: number): Observable<any> {
    const requestOptions = this.makeAuthenticatedRequest(`${this.apiUrl}/vaccination/${id}`);
    return this.http.delete(`${this.apiUrl}/vaccination/${id}`, requestOptions).pipe(
      tap(response => console.log('Delete vaccination campaign response:', response)),
      catchError(err => {
        console.error('Error deleting vaccination campaign:', err);
        return throwError(() => new Error(err.error?.message || 'Failed to delete vaccination campaign'));
      })
    );
  }
}
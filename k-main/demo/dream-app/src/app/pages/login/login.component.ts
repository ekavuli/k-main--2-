import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    if (!this.username || !this.password) {
      this.error = 'Please enter username and password';
      return;
    }

    this.loading = true;
    this.error = '';

    console.log('Attempting login with username:', this.username);

    this.auth.login(this.username, this.password).subscribe({
      next: (success) => {
        this.loading = false;
        if (success) {
          console.log('Login successful, navigating to home');
          this.router.navigate(['/home']);
        } else {
          console.warn('Login failed - invalid credentials');
          this.error = 'Invalid username or password. Please try again.';
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        console.error('Login error details:', err);
        
        if (err.status === 401) {
          this.error = 'Invalid username or password. Please check your credentials.';
        } else if (err.status === 0) {
          this.error = 'Cannot connect to server. Please check your internet connection and try again.';
        } else if (err.status === 403) {
          this.error = 'Access denied. Please contact administrator.';
        } else if (err.status >= 500) {
          this.error = 'Server error occurred. Please try again later.';
        } else if (err.error?.message) {
          this.error = `Login failed: ${err.error.message}`;
        } else {
          this.error = `Login error (${err.status}). Please try again.`;
        }
      }
    });
  }
}
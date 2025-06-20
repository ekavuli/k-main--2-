import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class HeaderComponent implements OnInit {
  isScrolled = false;

  constructor(
    public auth: AuthService, 
    private router: Router
  ) {}

  ngOnInit() {
    this.checkScroll();
    
    // Debug authentication state
    console.log('Header - User logged in:', this.auth.isLoggedIn());
    console.log('Header - User is admin:', this.auth.isAdmin());
    console.log('Header - User roles:', this.auth.getRoles());
  }

  @HostListener('window:scroll')
  checkScroll() {
    this.isScrolled = window.pageYOffset > 50;
    const navbar = document.getElementById('main-navbar');
    if (navbar) {
      if (this.isScrolled) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { Vaccine } from '../../../models/interfaces';

@Component({
  selector: 'app-add-vaccine',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-container" *ngIf="!authService.isLoggedIn()">
      <div class="auth-warning">
        <h3>⚠️ Authentication Required</h3>
        <p>You must be logged in as an administrator to add vaccines.</p>
        <button (click)="goToLogin()" class="btn-primary">Go to Login</button>
      </div>
    </div>

    <div class="form-container" *ngIf="authService.isLoggedIn()">
      <h2>Add New Vaccine</h2>
      <form (ngSubmit)="onSubmit(vaccineForm)" #vaccineForm="ngForm">
        <div class="form-group">
          <label for="nazov">Vaccine Name *</label>
          <input 
            type="text"
            id="nazov"
            [(ngModel)]="vaccine.nazov" 
            name="nazov" 
            required
            class="form-control"
            #nazov="ngModel">
          <div class="error" *ngIf="nazov.invalid && (nazov.dirty || nazov.touched || formSubmitted)">
            Vaccine name is required
          </div>
        </div>

        <div class="form-group">
          <label for="typ">Vaccine Type *</label>
          <select 
            id="typ"
            [(ngModel)]="vaccine.typ" 
            name="typ" 
            required
            class="form-control"
            #typ="ngModel">
            <option value="">Select vaccine type</option>
            <option value="mRNA">mRNA</option>
            <option value="vektorová">Vector</option>
            <option value="proteínová">Protein</option>
            <option value="iná">Other</option>
          </select>
          <div class="error" *ngIf="typ.invalid && (typ.dirty || typ.touched || formSubmitted)">
            Vaccine type is required
          </div>
        </div>

        <div class="form-group">
          <label for="vyrobca">Manufacturer *</label>
          <input 
            type="text"
            id="vyrobca"
            [(ngModel)]="vaccine.vyrobca" 
            name="vyrobca" 
            required
            class="form-control"
            #vyrobca="ngModel">
          <div class="error" *ngIf="vyrobca.invalid && (vyrobca.dirty || vyrobca.touched || formSubmitted)">
            Manufacturer is required
          </div>
        </div>

        <div class="form-group">
          <label for="pocetDavok">Number of Doses *</label>
          <input 
            type="number"
            id="pocetDavok"
            [(ngModel)]="vaccine.pocetDavok" 
            name="pocetDavok" 
            min="1"
            max="10"
            required
            class="form-control"
            (ngModelChange)="updateIntervals()"
            #pocetDavok="ngModel">
          <div class="error" *ngIf="pocetDavok.invalid && (pocetDavok.dirty || pocetDavok.touched || formSubmitted)">
            Number of doses is required (1-10)
          </div>
        </div>

        <div class="intervals-section" *ngIf="vaccine.pocetDavok && vaccine.pocetDavok > 1">
          <h4>Intervals Between Doses (in days)</h4>
          <div *ngFor="let interval of vaccine.intervalyDni; let i = index" class="interval-group">
            <label>Days between dose {{i + 1}} and {{i + 2}}:</label>
            <input 
              [(ngModel)]="vaccine.intervalyDni![i]"
              [name]="'interval_' + i"
              type="number"
              min="1"
              required
              class="form-control interval-input">
          </div>
        </div>

        <button type="submit" [disabled]="loading || !vaccineForm.valid" class="btn-primary">
          Add Vaccine
        </button>

        <div *ngIf="message" [class]="messageType">
          {{ message }}
        </div>
        
        <div *ngIf="loading" class="loading-indicator">
          <div class="spinner"></div>
          <span>Processing...</span>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container { 
      max-width: 500px; 
      margin: 20px auto; 
      padding: 20px; 
      border-radius: 8px;
      background-color: #f8f8f8;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    h2 {
      color: #212121;
      margin-bottom: 20px;
      font-weight: 600;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .form-group { 
      margin-bottom: 20px;
    }
    .form-control { 
      width: 100%;
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      margin-top: 5px;
      transition: border-color 0.3s, box-shadow 0.3s;
      background-color: #fff;
    }
    .form-control:focus {
      border-color: #212121;
      outline: none;
      box-shadow: 0 0 0 2px rgba(33, 33, 33, 0.1);
    }
    select.form-control {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='6' fill='none'%3E%3Cpath fill='%23666' d='M6 6 0 0h12L6 6Z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 36px;
    }
    .error { 
      color: #d32f2f; 
      font-size: 0.875em; 
      margin-top: 5px; 
    }
    .success { 
      color: #388e3c; 
      margin-top: 10px; 
      padding: 8px;
      background-color: #e8f5e9;
      border-radius: 4px;
      text-align: center;
    }
    .failure { 
      color: #d32f2f; 
      margin-top: 10px; 
      padding: 8px;
      background-color: #ffebee;
      border-radius: 4px;
      text-align: center;
    }
    .btn-primary { 
      width: 100%;
      padding: 12px;
      background: #212121;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: background-color 0.3s;
    }
    .btn-primary:hover:not(:disabled) { 
      background: #424242;
    }
    .btn-primary:disabled { 
      background: #bdbdbd;
      cursor: not-allowed;
    }
    label { 
      font-weight: 500;
      color: #424242;
      display: block;
      margin-bottom: 6px;
    }
    .loading-indicator {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      margin-top: 10px;
    }
    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-top-color: #212121;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .intervals-section {
      margin: 20px 0;
      padding: 15px;
      background-color: #e8f4f8;
      border-radius: 4px;
      border: 1px solid #b3d9e6;
    }
    
    .intervals-section h4 {
      margin-bottom: 15px;
      color: #2c5282;
    }
    
    .interval-group {
      margin-bottom: 10px;
    }
    
    .interval-group label {
      font-size: 0.9em;
      color: #4a5568;
      margin-bottom: 5px;
    }
    
    .interval-input {
      max-width: 120px;
    }
    .auth-warning {
      text-align: center;
      padding: 3rem 2rem;
      background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
      border: 2px solid #f44336;
      border-radius: 12px;
      color: #c62828;
    }
    
    .auth-warning h3 {
      color: #c62828;
      margin-bottom: 1rem;
    }
    
    .auth-warning p {
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }
  `]
})
export class AddVaccineComponent implements OnInit {
  vaccine: Vaccine = {
    nazov: '',
    typ: '',
    vyrobca: '',
    pocetDavok: 1,
    intervalyDni: []
  };

  message = '';
  messageType = '';
  loading = false;
  formSubmitted = false;

  constructor(
    private apiService: ApiService, 
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.message = 'Please log in as an administrator to add vaccines.';
      this.messageType = 'failure';
    }
  }

  updateIntervals() {
    const numDoses = this.vaccine.pocetDavok || 1;
    this.vaccine.intervalyDni = [];
    
    for (let i = 0; i < numDoses - 1; i++) {
      this.vaccine.intervalyDni.push(21); // Default 21 days between doses
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  onSubmit(vaccineForm: any) {
    this.formSubmitted = true;
    this.message = '';
    this.messageType = '';
    
    if (!this.vaccine.nazov?.trim() || !this.vaccine.typ || !this.vaccine.vyrobca?.trim() || !this.vaccine.pocetDavok) {
      this.message = 'Please fill in all required fields';
      this.messageType = 'failure';
      return;
    }
    
    if (this.vaccine.pocetDavok < 1 || this.vaccine.pocetDavok > 10) {
      this.message = 'Number of doses must be between 1 and 10';
      this.messageType = 'failure';
      return;
    }
    
    const payload = {
      nazov: this.vaccine.nazov.trim(),
      typ: this.vaccine.typ,
      vyrobca: this.vaccine.vyrobca.trim(),
      pocetDavok: Number(this.vaccine.pocetDavok),
      intervalyDni: (this.vaccine.intervalyDni || []).map(x => Number(x))
    };
    
    this.loading = true;
    console.log('Sending vaccine:', payload);
  
    this.apiService.addVaccine(payload).subscribe({
      next: (response: any) => {
        this.loading = false;
        console.log('API Response:', response);
        
        if (response && response.error) {
          console.error('Server returned error:', response.error);
          this.message = `Error: ${response.error.message || 'Server error occurred'}`;
          this.messageType = 'failure';
        } else {
          console.log('Vaccine added successfully:', response);
          this.message = `Vaccine ${this.vaccine.nazov} added successfully!`;
          this.messageType = 'success';
          this.resetForm(vaccineForm);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error adding vaccine:', error);
        
        let errorMessage = 'Unknown error occurred';
        
        if (error.status === 0) {
          errorMessage = 'Cannot connect to server. Please check your connection.';
        } else if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else {
            errorMessage = error.statusText || `HTTP ${error.status} error`;
          }
        } else {
          errorMessage = error.message || error.statusText || `HTTP ${error.status} error`;
        }
        
        this.message = `Error: ${errorMessage}`;
        this.messageType = 'failure';
      }
    });
  }
  
  private resetForm(vaccineForm: any) {
    this.vaccine = {
      nazov: '',
      typ: '',
      vyrobca: '',
      pocetDavok: 1,
      intervalyDni: []
    };
    this.formSubmitted = false;
    vaccineForm.resetForm();
  }
}
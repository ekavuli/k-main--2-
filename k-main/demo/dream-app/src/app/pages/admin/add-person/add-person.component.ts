import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Person } from '../../../models/interfaces';

@Component({
  selector: 'app-add-person',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-container">
      <h2>Add New Person</h2>
      <form (ngSubmit)="onSubmit(personForm)" #personForm="ngForm">
        <div class="form-group">
          <label for="meno">First Name *</label>
          <input 
            type="text"
            id="meno"
            [(ngModel)]="person.meno" 
            name="meno" 
            required
            class="form-control"
            #meno="ngModel">
          <div class="error" *ngIf="meno.invalid && (meno.dirty || meno.touched || formSubmitted)">
            First name is required
          </div>
        </div>

        <div class="form-group">
          <label for="priezvisko">Last Name *</label>
          <input 
            type="text"
            id="priezvisko"
            [(ngModel)]="person.priezvisko" 
            name="priezvisko" 
            required
            class="form-control"
            #priezvisko="ngModel">
          <div class="error" *ngIf="priezvisko.invalid && (priezvisko.dirty || priezvisko.touched || formSubmitted)">
            Last name is required
          </div>
        </div>

        <div class="form-group">
          <label for="datumNarodenia">Date of Birth *</label>
          <input 
            id="datumNarodenia"
            [(ngModel)]="person.datumNarodenia" 
            name="datumNarodenia" 
            type="date"
            required
            class="form-control"
            #datumNarodenia="ngModel">
          <div class="error" *ngIf="datumNarodenia.invalid && (datumNarodenia.dirty || datumNarodenia.touched || formSubmitted)">
            Date of birth is required
          </div>
        </div>

        <div class="form-group">
          <label for="telefon">Phone Number</label>
          <input 
            type="tel"
            id="telefon"
            [(ngModel)]="person.telefon" 
            name="telefon" 
            class="form-control"
            placeholder="+421 XXX XXX XXX">
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input 
            type="email"
            id="email"
            [(ngModel)]="person.email" 
            name="email" 
            class="form-control"
            placeholder="example@email.com">
        </div>

        <button type="submit" [disabled]="loading" class="btn-primary">
          Add Person
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
    .btn-primary:hover { 
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
  `]
})
export class AddPersonComponent {
  person: Person = {
    meno: '',
    priezvisko: '',
    datumNarodenia: new Date().toISOString().split('T')[0],
    telefon: '',
    email: ''
  };

  message = '';
  messageType = '';
  loading = false;
  formSubmitted = false;

  constructor(private apiService: ApiService) {}

  onSubmit(personForm: any) {
    this.formSubmitted = true;
    this.message = '';
    this.messageType = '';
    
    // Validate form manually
    if (!this.person.meno || !this.person.priezvisko || !this.person.datumNarodenia) {
      this.message = 'Please fill in all required fields';
      this.messageType = 'failure';
      return;
    }
    
    // Fix date formatting to match working vaccination code
    const payload = {
      ...this.person,
      datumNarodenia: this.person.datumNarodenia
    };
    
    this.loading = true;
    console.log('Sending person data:', payload);
    
    this.apiService.addPerson(payload).subscribe({
      next: (response: any) => {
        this.loading = false;
        console.log('Person added successfully:', response);
        this.message = `Person ${this.person.meno} ${this.person.priezvisko} added successfully!`;
        this.messageType = 'success';
        this.resetForm(personForm);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error adding person:', error);
        
        // Handle error response properly
        let errorMessage = 'Unknown error occurred';
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server. Please check your connection.';
        }
        
        this.message = `Error adding person: ${errorMessage}`;
        this.messageType = 'failure';
      }
    });
  }

  private resetForm(personForm: any) {
    this.person = {
      meno: '',
      priezvisko: '',
      datumNarodenia: new Date().toISOString().split('T')[0],
      telefon: '',
      email: ''
    };
    this.formSubmitted = false;
    personForm.resetForm();
  }
}
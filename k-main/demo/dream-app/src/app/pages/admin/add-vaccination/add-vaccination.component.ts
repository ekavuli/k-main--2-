import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { Person, Vaccine, Vaccination } from '../../../models/interfaces';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-add-vaccination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-container">
      <h2>Add Vaccination Record</h2>
      
      <!-- Priority Notifications Section -->
      <div class="notifications-section" *ngIf="priorityNotifications.length > 0">
        <h3>🔔 Priority Vaccination Reminders</h3>
        <div *ngFor="let notification of priorityNotifications.slice(0, 5)" 
             class="notification" 
             [class.urgent]="notification.dniDoAplikacie < 0"
             [class.soon]="notification.dniDoAplikacie >= 0 && notification.dniDoAplikacie <= 3"
             [class.normal]="notification.dniDoAplikacie > 3">
          <div class="notification-content">
            <strong>{{notification.osobaMeno}} {{notification.osobaPriezvisko}}</strong>
            <div class="due-date">
              {{notification.vakcinaNazov}} - Dose {{notification.poradieDavky}}
              <span *ngIf="notification.dniDoAplikacie < 0" class="priority-text">
                {{Math.abs(notification.dniDoAplikacie)}} days overdue
              </span>
              <span *ngIf="notification.dniDoAplikacie === 0" class="priority-text">
                Due today
              </span>
              <span *ngIf="notification.dniDoAplikacie > 0" class="priority-text">
                Due in {{notification.dniDoAplikacie}} days
              </span>
            </div>
          </div>
          <button class="contact-btn" (click)="contactPerson(notification)">
            📞 Contact
          </button>
        </div>
      </div>
      
      <form (ngSubmit)="onSubmit(vaccinationForm)" #vaccinationForm="ngForm">
        <div class="form-group">
          <label for="osobaId">Person *</label>
          <select 
            id="osobaId"
            [(ngModel)]="vaccination.osobaId" 
            name="osobaId" 
            required
            class="form-control"
            (ngModelChange)="checkExistingVaccinations()"
            #osobaId="ngModel">
            <option [ngValue]="null">Select Person</option>
            <option *ngFor="let person of people" [ngValue]="person.id">
              {{person.meno}} {{person.priezvisko}}
            </option>
          </select>
          <div class="error" *ngIf="osobaId.invalid && (osobaId.dirty || osobaId.touched)">
            Person selection is required
          </div>
        </div>
        
        <div class="form-group">
          <label for="vakcinaId">Vaccine *</label>
          <select 
            id="vakcinaId"
            [(ngModel)]="vaccination.vakcinaId" 
            name="vakcinaId" 
            required
            class="form-control"
            (ngModelChange)="checkExistingVaccinations()"
            #vakcinaId="ngModel">
            <option [ngValue]="null">Select Vaccine</option>
            <option *ngFor="let vaccine of vaccines" [ngValue]="vaccine.id">
              {{vaccine.nazov}} ({{vaccine.typ}})
            </option>
          </select>
          <div class="error" *ngIf="vakcinaId.invalid && (vakcinaId.dirty || vakcinaId.touched)">
            Vaccine selection is required
          </div>
        </div>

        <!-- Existing Records Info -->
        <div class="existing-info" *ngIf="existingRecords.length > 0">
          <h4>📋 Existing Records for Selected Person & Vaccine</h4>
          <div *ngFor="let record of existingRecords" class="existing-record">
            Dose {{record.poradieDavky}} - {{record.datumAplikacie | date:'dd.MM.yyyy'}}
          </div>
          <p class="next-dose-info">
            <strong>Next dose will be: {{getNextDoseNumber()}}</strong>
          </p>
        </div>
        
        <div class="form-group">
          <label for="datumAplikacie">Date of Application *</label>
          <input 
            id="datumAplikacie"
            [(ngModel)]="vaccination.datumAplikacie" 
            name="datumAplikacie" 
            type="date"
            required
            class="form-control"
            #datumAplikacie="ngModel">
          <div class="error" *ngIf="datumAplikacie.invalid && (datumAplikacie.dirty || datumAplikacie.touched)">
            Application date is required
          </div>
        </div>
        
        <div class="form-group">
          <label for="poradieDavky">Dose Number</label>
          <input 
            id="poradieDavky"
            [(ngModel)]="vaccination.poradieDavky" 
            name="poradieDavky" 
            type="number" 
            min="1"
            class="form-control"
            [readonly]="existingRecords.length > 0"
            #poradieDavky="ngModel">
          <small *ngIf="existingRecords.length > 0" class="help-text">
            Dose number is automatically determined based on existing records
          </small>
        </div>

        <button type="submit" [disabled]="!vaccinationForm.form.valid || loading" class="btn-primary">
          {{existingRecords.length > 0 ? 'Add Next Dose' : 'Add Vaccination Record'}}
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
      max-width: 600px; 
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
      text-align: center;
      color: #212121;
      margin-top: 10px;
      font-size: 0.9em;
    }
    
    .notifications-section {
      margin-bottom: 30px;
      padding: 20px;
      background-color: #e3f2fd;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
      box-shadow: 0 2px 8px rgba(33, 150, 243, 0.1);
    }
    
    .notifications-section h3 {
      color: #1565c0;
      margin-bottom: 15px;
      font-weight: 600;
      font-size: 1.1em;
    }
    
    .notification {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      margin-bottom: 12px;
      border-radius: 6px;
      background-color: #fff;
      transition: transform 0.2s, box-shadow 0.2s;
      border: 1px solid #e0e0e0;
    }
    
    .notification:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .notification.urgent {
      border-left: 5px solid #f44336;
      background-color: #ffebee;
      animation: pulse 2s infinite;
    }
    
    .notification.soon {
      border-left: 5px solid #ff9800;
      background-color: #fff3e0;
    }
    
    .notification.normal {
      border-left: 5px solid #4caf50;
      background-color: #f1f8e9;
    }
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(244, 67, 54, 0); }
      100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
    }
    
    .notification-content {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }
    
    .notification-content strong {
      color: #212121;
      font-size: 1.05em;
    }
    
    .due-date {
      font-size: 0.9em;
      color: #666;
      font-weight: 500;
    }
    
    .priority-text {
      font-size: 0.8em;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 12px;
      align-self: flex-start;
    }
    
    .notification.urgent .priority-text {
      background-color: #f44336;
      color: white;
    }
    
    .notification.soon .priority-text {
      background-color: #ff9800;
      color: white;
    }
    
    .contact-btn {
      padding: 10px 16px;
      background: #2196f3;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9em;
      font-weight: 500;
      transition: all 0.3s;
      white-space: nowrap;
    }
    
    .contact-btn:hover {
      background: #1976d2;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(25, 118, 210, 0.3);
    }
    
    .existing-info {
      margin: 20px 0;
      padding: 15px;
      background-color: #e3f2fd;
      border-radius: 6px;
      border-left: 4px solid #2196f3;
    }
    
    .existing-record {
      padding: 5px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .next-dose-info {
      margin-top: 10px;
      color: #1976d2;
      font-weight: 600;
    }
    
    .help-text {
      color: #666;
      font-style: italic;
    }
  `]
})
export class AddVaccinationComponent implements OnInit {
  vaccination: any = {
    osobaId: null,
    vakcinaId: null,
    datumAplikacie: new Date().toISOString().split('T')[0],
    poradieDavky: 1
  };
  
  people: Person[] = [];
  vaccines: Vaccine[] = [];
  existingRecords: any[] = [];
  priorityNotifications: any[] = [];
  message = '';
  messageType = '';
  loading = false;
  Math = Math;

  constructor(
    private apiService: ApiService,
    public auth: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.message = 'Please log in as an administrator to add vaccination records.';
      this.messageType = 'failure';
      return;
    }
    
    this.loadData();
    this.loadPriorityNotifications();
  }

  loadData() {
    this.loading = true;
    
    // Load people with authentication
    this.apiService.getAllPersons().subscribe({
      next: (persons) => {
        this.people = persons || [];
        console.log('Loaded people:', this.people.length);
      },
      error: (error) => {
        console.error('Error loading people:', error);
        if (error.status === 403) {
          this.message = 'Access denied. Please log in as an administrator.';
        } else {
          this.message = 'Failed to load people data. Please refresh the page.';
        }
        this.messageType = 'failure';
        this.loading = false;
      },
      complete: () => this.loadVaccines()
    });
  }
  
  loadVaccines() {
    this.apiService.getAllVaccines().subscribe({
      next: (vaccines) => {
        this.vaccines = vaccines || [];
        console.log('Loaded vaccines:', this.vaccines.length);
      },
      error: (error) => {
        console.error('Error loading vaccines:', error);
        if (error.status === 403) {
          this.message = 'Access denied. Please log in as an administrator.';
        } else {
          this.message = 'Failed to load vaccine data. Please refresh the page.';
        }
        this.messageType = 'failure';
      },
      complete: () => this.loading = false
    });
  }

  loadPriorityNotifications() {
    this.http.get<any[]>(`${environment.apiUrl}/notifications/priority`)
      .subscribe({
        next: (notifications) => {
          this.priorityNotifications = notifications || [];
          console.log('Loaded priority notifications:', notifications);
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
          this.priorityNotifications = []; // Set empty array on error
        }
      });
  }

  checkExistingVaccinations() {
    if (this.vaccination.osobaId && this.vaccination.vakcinaId) {
      console.log('Checking existing vaccinations for person:', this.vaccination.osobaId, 'vaccine:', this.vaccination.vakcinaId);
      
      this.apiService.getVaccinationsByPersonAndVaccine(this.vaccination.osobaId, this.vaccination.vakcinaId)
        .subscribe({
          next: (records) => {
            this.existingRecords = records || [];
            console.log('Found existing records:', this.existingRecords);
            
            if (records && records.length > 0) {
              const maxDose = Math.max(...records.map(r => r.poradieDavky || 1));
              this.vaccination.poradieDavky = maxDose + 1;
              console.log('Next dose will be:', this.vaccination.poradieDavky);
            } else {
              this.vaccination.poradieDavky = 1;
              console.log('First dose for this person/vaccine combination');
            }
          },
          error: (error) => {
            console.error('Error checking existing vaccinations:', error);
            this.existingRecords = [];
            this.vaccination.poradieDavky = 1;
          }
        });
    } else {
      this.existingRecords = [];
      this.vaccination.poradieDavky = 1;
    }
  }

  getNextDoseNumber(): number {
    return this.vaccination.poradieDavky;
  }

  onSubmit(vaccinationForm: any) {
    if (!this.auth.isLoggedIn()) {
      this.message = 'You must be logged in as an administrator to add vaccination records.';
      this.messageType = 'failure';
      return;
    }

    this.message = '';
    this.loading = true;
    
    console.log('Form submission started with data:', this.vaccination);
    
    // Enhanced validation
    if (!this.vaccination.osobaId || !this.vaccination.vakcinaId) {
      this.message = 'Please select both person and vaccine';
      this.messageType = 'failure';
      this.loading = false;
      return;
    }
    
    if (!this.vaccination.datumAplikacie) {
      this.message = 'Please select application date';
      this.messageType = 'failure';
      this.loading = false;
      return;
    }

    // Validate dose number
    const doseNumber = Number(this.vaccination.poradieDavky) || 1;
    if (doseNumber < 1) {
      this.message = 'Dose number must be at least 1';
      this.messageType = 'failure';
      this.loading = false;
      return;
    }
    
    // Ensure proper data types
    const payload = {
      osobaId: Number(this.vaccination.osobaId),
      vakcinaId: Number(this.vaccination.vakcinaId),
      datumAplikacie: this.vaccination.datumAplikacie,
      poradieDavky: doseNumber
    };
    
    console.log('Submitting vaccination payload:', payload);
    
    // Use HttpClient directly with explicit response handling
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.auth.getToken()}`
    });
    
    this.http.post(`${environment.apiUrl}/osobavakcina/add-smart`, payload, { 
      headers,
      observe: 'response',
      responseType: 'json'
    }).subscribe({
      next: (response: any) => {
        this.loading = false;
        console.log('Full HTTP response:', response);
        console.log('Response body:', response.body);
        console.log('Response status:', response.status);
        
        if (response.status === 200) {
          this.message = 'Vaccination record added successfully!';
          this.messageType = 'success';
          this.resetForm(vaccinationForm);
          this.loadPriorityNotifications();
        } else {
          this.message = 'Unexpected response status: ' + response.status;
          this.messageType = 'failure';
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error adding vaccination:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        this.handleError(error);
      }
    });
  }

  private handleError(error: any) {
    console.log('Detailed error analysis:', {
      status: error.status,
      statusText: error.statusText,
      error: error.error,
      message: error.message,
      name: error.name,
      url: error.url,
      ok: error.ok
    });
    
    let errorMessage = 'Unknown error occurred';
    
    if (error.status === 0) {
      errorMessage = 'Cannot connect to server. Please check your connection.';
    } else if (error.name === 'HttpErrorResponse' && error.message.includes('parsing')) {
      errorMessage = 'Server response format error. The operation may have succeeded despite this error.';
    } else if (error.error) {
      if (typeof error.error === 'string') {
        try {
          const parsedError = JSON.parse(error.error);
          errorMessage = parsedError.error || parsedError.message || error.error;
        } catch (e) {
          errorMessage = error.error;
        }
      } else if (error.error.error) {
        errorMessage = error.error.error;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = error.statusText || `HTTP ${error.status} error`;
      }
    } else {
      errorMessage = error.message || error.statusText || `HTTP ${error.status} error`;
    }
    
    this.message = `Error adding vaccination: ${errorMessage}`;
    this.messageType = 'failure';
  }
  
  private resetForm(vaccinationForm: any) {
    this.vaccination = {
      osobaId: null,
      vakcinaId: null,
      datumAplikacie: new Date().toISOString().split('T')[0],
      poradieDavky: 1
    };
    this.existingRecords = [];
    vaccinationForm.resetForm();
  }

  contactPerson(notification: any) {
    if (!this.auth.isLoggedIn()) {
      alert('Only administrators can contact patients.');
      return;
    }
    
    const message = `Reminder: ${notification.vakcinaNazov} vaccination (dose ${notification.poradieDavky}) was due on ${new Date(notification.planovanyDatum).toLocaleDateString()}`;
    
    // Mark as contacted
    this.http.post(`${environment.apiUrl}/notifications/mark-contacted/${notification.osobaId}`, {})
      .subscribe({
        next: () => {
          console.log('Marked as contacted');
        },
        error: (error) => {
          console.error('Error marking as contacted:', error);
        }
      });
    
    alert(`Contact ${notification.osobaMeno} ${notification.osobaPriezvisko}\n\n${message}`);
  }
}
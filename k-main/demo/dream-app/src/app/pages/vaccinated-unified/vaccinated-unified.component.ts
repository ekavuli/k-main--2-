import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { VaccinationRecord, Vaccine } from '../../models/interfaces';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-vaccinated-unified',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header-section">
        <h2>Vaccination Records Management</h2>
        <p class="subtitle">Search, filter, and manage all vaccination records</p>
      </div>
      
      <!-- Advanced Filter Section -->
      <div class="filter-section">
        <div class="filter-row">
          <div class="search-group">
            <label for="search">🔍 Search:</label>
            <input 
              type="text" 
              id="search"
              placeholder="Search by name or vaccine..." 
              (input)="onSearchInput($event)"
              [value]="searchTerm"
              class="search-input">
          </div>
          
          <div class="filter-group">
            <label for="vaccine-filter">💉 Filter by vaccine:</label>
            <select 
              id="vaccine-filter"
              [(ngModel)]="vaccineFilter" 
              (ngModelChange)="applyFilters()"
              class="filter-select">
              <option value="">All vaccines</option>
              <option *ngFor="let vaccine of vaccines" [value]="vaccine.nazov">
                {{vaccine.nazov}} ({{vaccine.vyrobca}})
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="dose-filter">💊 Filter by dose:</label>
            <select 
              id="dose-filter"
              [(ngModel)]="doseFilter" 
              (ngModelChange)="applyFilters()"
              class="filter-select">
              <option value="">All doses</option>
              <option value="1">1st dose</option>
              <option value="2">2nd dose</option>
              <option value="3">3rd dose</option>
              <option value="4+">4+ doses</option>
            </select>
          </div>
        </div>
        
        <div class="controls-row">
          <div class="view-toggle">
            <button 
              [class.active]="viewMode === 'table'"
              (click)="setViewMode('table')"
              class="toggle-btn">
              📊 Table View
            </button>
            <button 
              [class.active]="viewMode === 'cards'"
              (click)="setViewMode('cards')"
              class="toggle-btn">
              🗂️ Card View
            </button>
          </div>
          
          <div class="sort-controls">
            <label>Sort by:</label>
            <select [(ngModel)]="sortBy" (ngModelChange)="applySort()" class="sort-select">
              <option value="name">Name</option>
              <option value="vaccine">Vaccine</option>
              <option value="date">Date</option>
              <option value="dose">Dose</option>
            </select>
            <button (click)="toggleSortDirection()" class="sort-direction-btn">
              {{sortDirection === 'asc' ? '⬆️' : '⬇️'}}
            </button>
          </div>
          
          <button (click)="resetFilters()" class="reset-btn">🔄 Reset</button>
          <button (click)="exportData()" class="export-btn">📥 Export</button>
        </div>
      </div>

      <!-- Results Summary -->
      <div class="results-info">
        <div class="results-count">
          Showing <strong>{{filteredRecords.length}}</strong> of <strong>{{allRecords.length}}</strong> records
        </div>
        <div class="quick-stats" *ngIf="filteredRecords.length > 0">
          <span class="stat">📅 Latest: {{getLatestDate() | date:'dd.MM.yyyy'}}</span>
          <span class="stat">💉 Vaccines: {{getUniqueVaccines()}}</span>
        </div>
      </div>

      <!-- Loading and Error States -->
      <div *ngIf="loading" class="loading">
        <div class="spinner-large"></div>
        <p>Loading vaccination records...</p>
      </div>
      <div *ngIf="error" class="error">
        <h3>⚠️ Error Loading Data</h3>
        <p>{{error}}</p>
        <button (click)="loadRecords()" class="retry-btn">🔄 Retry</button>
      </div>

      <!-- Table View -->
      <div class="table-container" *ngIf="!loading && !error && viewMode === 'table'">
        <table class="vaccination-table">
          <thead>
            <tr>
              <th (click)="changeSorting('name')" class="sortable">
                👤 Name {{getSortIndicator('name')}}
              </th>
              <th (click)="changeSorting('vaccine')" class="sortable">
                💉 Vaccine {{getSortIndicator('vaccine')}}
              </th>
              <th (click)="changeSorting('date')" class="sortable">
                📅 Date {{getSortIndicator('date')}}
              </th>
              <th (click)="changeSorting('dose')" class="sortable">
                💊 Dose {{getSortIndicator('dose')}}
              </th>
              <th *ngIf="auth.isLoggedIn()">📧 Contact</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let record of filteredRecords; trackBy: trackByRecordId" class="record-row">
              <td>
                <div class="person-cell">
                  <strong>{{record.osobaPriezvisko}}, {{record.osobaMeno}}</strong>
                  <small>ID: {{record.osobaId}}</small>
                </div>
              </td>
              <td>
                <div class="vaccine-cell">
                  <span class="vaccine-name">{{record.vakcinaNazov}}</span>
                  <span class="vaccine-type">({{record.vakcinaTyp}})</span>
                </div>
              </td>
              <td>{{record.datumAplikacie | date:'dd.MM.yyyy'}}</td>
              <td>
                <span class="dose-badge dose-{{record.poradieDavky}}">{{record.poradieDavky}}</span>
              </td>
              <td *ngIf="auth.isLoggedIn()">
                <div class="contact-actions">
                  <button class="contact-btn phone-btn" title="Call">📞</button>
                  <button class="contact-btn email-btn" title="Email">📧</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Card View -->
      <div class="cards-container" *ngIf="!loading && !error && viewMode === 'cards'">
        <div *ngFor="let record of filteredRecords; trackBy: trackByRecordId" class="record-card">
          <div class="card-header">
            <div class="person-info">
              <h3>{{record.osobaMeno}} {{record.osobaPriezvisko}}</h3>
              <span class="person-id">ID: {{record.osobaId}}</span>
            </div>
            <span class="dose-badge dose-{{record.poradieDavky}}">Dose {{record.poradieDavky}}</span>
          </div>
          <div class="card-body">
            <div class="vaccine-details">
              <div class="vaccine-main">
                <strong>{{record.vakcinaNazov}}</strong>
                <span class="vaccine-type">{{record.vakcinaTyp}}</span>
              </div>
              <div class="date-info">
                <span class="date-label">📅 Administered:</span>
                <span class="date-value">{{record.datumAplikacie | date:'dd.MM.yyyy'}}</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <div class="contact-actions" *ngIf="auth.isLoggedIn()">
              <button class="contact-btn phone-btn">📞 Call</button>
              <button class="contact-btn email-btn">📧 Email</button>
              <button class="contact-btn info-btn">ℹ️ Details</button>
            </div>
          </div>
        </div>
      </div>
      
      <div *ngIf="filteredRecords.length === 0 && !loading && !error" class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>No records found</h3>
        <p>Try adjusting your search criteria or filters</p>
        <button (click)="resetFilters()" class="reset-btn">🔄 Reset Filters</button>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1400px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }

    .header-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header-section h2 {
      font-size: 2.2rem;
      color: #212121;
      font-weight: 700;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .subtitle {
      color: #666;
      font-size: 1.1rem;
      margin-bottom: 0;
    }

    .filter-section {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .filter-row, .controls-row {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
      align-items: end;
      margin-bottom: 1rem;
    }

    .controls-row {
      margin-bottom: 0;
      justify-content: space-between;
    }

    .search-group, .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 200px;
    }

    .search-input, .filter-select, .sort-select {
      padding: 0.8rem 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 0.95rem;
      background-color: #fff;
      transition: all 0.3s ease;
    }

    .search-input:focus, .filter-select:focus, .sort-select:focus {
      outline: none;
      border-color: #212121;
      box-shadow: 0 0 0 3px rgba(33, 33, 33, 0.1);
    }

    .view-toggle, .sort-controls {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .toggle-btn, .sort-direction-btn {
      padding: 0.8rem 1.2rem;
      border: 2px solid #e0e0e0;
      background: #fff;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .toggle-btn.active {
      background: #212121;
      color: white;
      border-color: #212121;
    }

    .reset-btn, .export-btn, .retry-btn {
      padding: 0.8rem 1.5rem;
      background: linear-gradient(135deg, #424242 0%, #212121 100%);
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .reset-btn:hover, .export-btn:hover, .retry-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(33, 33, 33, 0.3);
    }

    .results-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .quick-stats {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .stat {
      background: #212121;
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .vaccination-table {
      width: 100%;
      border-collapse: collapse;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      overflow: hidden;
      background: white;
    }

    .vaccination-table th {
      background: linear-gradient(135deg, #212121 0%, #424242 100%);
      color: #fff;
      padding: 1.2rem;
      font-weight: 600;
      cursor: pointer;
      text-transform: uppercase;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
      transition: background-color 0.3s;
    }

    .vaccination-table th:hover {
      background: linear-gradient(135deg, #424242 0%, #616161 100%);
    }

    .vaccination-table td {
      padding: 1rem 1.2rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .vaccination-table tr:hover {
      background-color: #f8f9fa;
    }

    .person-cell strong {
      display: block;
      color: #212121;
    }

    .person-cell small {
      color: #666;
      font-size: 0.8rem;
    }

    .vaccine-cell {
      display: flex;
      flex-direction: column;
    }

    .vaccine-name {
      font-weight: 600;
      color: #212121;
    }

    .vaccine-type {
      color: #666;
      font-size: 0.9rem;
    }

    .dose-badge {
      display: inline-block;
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-align: center;
      min-width: 24px;
    }

    .dose-1 { background: #e3f2fd; color: #1976d2; }
    .dose-2 { background: #e8f5e8; color: #388e3c; }
    .dose-3 { background: #fff3e0; color: #f57c00; }

    .cards-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .record-card {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    .record-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.5rem;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-bottom: 1px solid #e0e0e0;
    }

    .person-info h3 {
      margin: 0 0 0.3rem 0;
      color: #212121;
      font-size: 1.1rem;
    }

    .person-id {
      color: #666;
      font-size: 0.8rem;
    }

    .card-body {
      padding: 1.5rem;
    }

    .vaccine-details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .vaccine-main {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .vaccine-main strong {
      color: #212121;
      font-size: 1.05rem;
    }

    .date-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .date-label {
      color: #666;
      font-size: 0.9rem;
    }

    .date-value {
      font-weight: 600;
      color: #212121;
    }

    .card-footer {
      padding: 1rem 1.5rem;
      background: #f8f9fa;
      border-top: 1px solid #e0e0e0;
    }

    .contact-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }

    .contact-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .phone-btn {
      background: #4caf50;
      color: white;
    }

    .email-btn {
      background: #2196f3;
      color: white;
    }

    .info-btn {
      background: #ff9800;
      color: white;
    }

    .contact-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .loading, .no-results {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .spinner-large {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-top-color: #212121;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error {
      text-align: center;
      padding: 2rem;
      background: #ffebee;
      color: #d32f2f;
      border-radius: 8px;
      border-left: 4px solid #d32f2f;
    }

    .no-results-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
      .filter-row, .controls-row {
        flex-direction: column;
        align-items: stretch;
      }
      
      .cards-container {
        grid-template-columns: 1fr;
      }
      
      .vaccination-table {
        font-size: 0.9rem;
      }
      
      .vaccination-table th,
      .vaccination-table td {
        padding: 0.8rem;
      }
    }
  `]
})
export class VaccinatedUnifiedComponent implements OnInit, OnDestroy {
  searchTerm = '';
  vaccineFilter = '';
  doseFilter = '';
  sortBy = 'name';
  sortDirection = 'asc';
  viewMode: 'table' | 'cards' = 'table';
  
  allRecords: VaccinationRecord[] = [];
  filteredRecords: VaccinationRecord[] = [];
  vaccines: Vaccine[] = [];
  
  loading = false;
  error = '';
  
  private searchTerms = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient, private apiService: ApiService, public auth: AuthService) {}

  ngOnInit() {
    this.loadVaccines();
    this.loadRecords();
    this.setupSearch();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadVaccines() {
    this.apiService.getAllVaccines().subscribe({
      next: (data) => {
        this.vaccines = data || [];
        console.log('Loaded vaccines:', this.vaccines);
      },
      error: (err) => {
        console.error('Error loading vaccines:', err);
        this.vaccines = []; // Set empty array on error
      }
    });
  }
  
  loadRecords() {
    this.loading = true;
    this.error = '';
    
    this.http.get<VaccinationRecord[]>(`${environment.apiUrl}/osobavakcina`)
      .subscribe({
        next: (data) => {
          this.allRecords = data;
          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          this.error = `Error loading data: ${err.message}`;
          this.loading = false;
          console.error('Error loading vaccination records:', err);
        }
      });
  }

  setupSearch() {
    this.searchTerms.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.applyFilters();
    });
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerms.next(input.value);
  }

  applyFilters() {
    let filtered = [...this.allRecords];

    if (this.searchTerm.trim()) {
      const lowercaseSearchTerm = this.searchTerm.toLowerCase();
      filtered = filtered.filter(record => {
        const nameMatch = `${record.osobaMeno} ${record.osobaPriezvisko}`.toLowerCase().includes(lowercaseSearchTerm);
        const vaccineMatch = record.vakcinaNazov.toLowerCase().includes(lowercaseSearchTerm);
        return nameMatch || vaccineMatch;
      });
    }

    if (this.vaccineFilter) {
      filtered = filtered.filter(record => 
        record.vakcinaNazov.toLowerCase().includes(this.vaccineFilter.toLowerCase())
      );
    }

    if (this.doseFilter) {
      if (this.doseFilter === '4+') {
        filtered = filtered.filter(record => record.poradieDavky >= 4);
      } else {
        filtered = filtered.filter(record => record.poradieDavky === parseInt(this.doseFilter));
      }
    }

    this.filteredRecords = filtered;
    this.applySort();
  }
  
  resetFilters() {
    this.searchTerm = '';
    this.vaccineFilter = '';
    this.doseFilter = '';
    this.applyFilters();
  }

  setViewMode(mode: 'table' | 'cards') {
    this.viewMode = mode;
  }
  
  changeSorting(column: string) {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }

  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.applySort();
  }
  
  applySort() {
    const direction = this.sortDirection === 'asc' ? 1 : -1;
    
    this.filteredRecords.sort((a, b) => {
      switch(this.sortBy) {
        case 'name':
          return direction * (`${a.osobaPriezvisko} ${a.osobaMeno}`).localeCompare(`${b.osobaPriezvisko} ${b.osobaMeno}`);
        case 'vaccine':
          return direction * a.vakcinaNazov.localeCompare(b.vakcinaNazov);
        case 'date':
          return direction * (new Date(a.datumAplikacie).getTime() - new Date(b.datumAplikacie).getTime());
        case 'dose':
          return direction * (a.poradieDavky - b.poradieDavky);
        default:
          return 0;
      }
    });
  }
  
  getSortIndicator(column: string): string {
    if (this.sortBy === column) {
      return this.sortDirection === 'asc' ? '↑' : '↓';
    }
    return '';
  }

  trackByRecordId(index: number, record: VaccinationRecord): number {
    return record.id;
  }

  getLatestDate(): string {
    if (this.filteredRecords.length === 0) return '';
    const latest = this.filteredRecords.reduce((latest, record) => {
      return new Date(record.datumAplikacie) > new Date(latest.datumAplikacie) ? record : latest;
    });
    return latest.datumAplikacie;
  }

  getUniqueVaccines(): number {
    return new Set(this.filteredRecords.map(r => r.vakcinaNazov)).size;
  }

  exportData() {
    // Simple CSV export
    const headers = ['Name', 'Vaccine', 'Type', 'Date', 'Dose'];
    const csvData = this.filteredRecords.map(record => [
      `${record.osobaPriezvisko}, ${record.osobaMeno}`,
      record.vakcinaNazov,
      record.vakcinaTyp,
      record.datumAplikacie,
      record.poradieDavky
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vaccination-records-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}

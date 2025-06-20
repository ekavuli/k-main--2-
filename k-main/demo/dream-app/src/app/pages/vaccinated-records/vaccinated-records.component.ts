import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { VaccinationRecord, Vaccine } from '../../models/interfaces';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-vaccinated-records',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h2>Vaccination Records</h2>
      
      <!-- Search and Filter Section -->
      <div class="filter-section">
        <div class="search-group">
          <label for="search">Search:</label>
          <input 
            type="text" 
            id="search"
            placeholder="Search by name or vaccine..." 
            (input)="onSearchInput($event)"
            [value]="searchTerm"
            class="search-input">
        </div>
        
        <div class="filter-group">
          <label for="vaccine-filter">Filter by vaccine:</label>
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
        
        <div class="view-toggle">
          <button 
            [class.active]="viewMode === 'table'"
            (click)="setViewMode('table')"
            class="toggle-btn">
            Table View
          </button>
          <button 
            [class.active]="viewMode === 'list'"
            (click)="setViewMode('list')"
            class="toggle-btn">
            List View
          </button>
        </div>
        
        <button (click)="resetFilters()" class="reset-btn">Reset Filters</button>
      </div>

      <!-- Results Summary -->
      <div class="results-info">
        Showing {{filteredRecords.length}} of {{allRecords.length}} records
      </div>

      <!-- Loading and Error States -->
      <div *ngIf="loading" class="loading">Loading vaccination records...</div>
      <div *ngIf="error" class="error">{{error}}</div>

      <!-- Table View -->
      <div class="table-container" *ngIf="!loading && !error && viewMode === 'table'">
        <table class="vaccination-table">
          <thead>
            <tr>
              <th (click)="changeSorting('name')" class="sortable">
                Name {{getSortIndicator('name')}}
              </th>
              <th (click)="changeSorting('vaccine')" class="sortable">
                Vaccine {{getSortIndicator('vaccine')}}
              </th>
              <th (click)="changeSorting('date')" class="sortable">
                Date {{getSortIndicator('date')}}
              </th>
              <th (click)="changeSorting('dose')" class="sortable">
                Dose {{getSortIndicator('dose')}}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let record of filteredRecords" class="record-row">
              <td>{{record.osobaPriezvisko}}, {{record.osobaMeno}}</td>
              <td>
                <span class="vaccine-name">{{record.vakcinaNazov}}</span>
                <span class="vaccine-type">({{record.vakcinaTyp}})</span>
              </td>
              <td>{{record.datumAplikacie | date:'dd.MM.yyyy'}}</td>
              <td>
                <span class="dose-badge">{{record.poradieDavky}}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- List View -->
      <div class="list-container" *ngIf="!loading && !error && viewMode === 'list'">
        <div *ngFor="let record of filteredRecords" class="record-card">
          <div class="record-header">
            <strong>{{record.osobaMeno}} {{record.osobaPriezvisko}}</strong>
            <span class="dose-badge">Dose {{record.poradieDavky}}</span>
          </div>
          <div class="record-body">
            <div class="vaccine-info">
              {{record.vakcinaNazov}} ({{record.vakcinaTyp}})
            </div>
            <div class="date-info">
              Date: {{record.datumAplikacie | date:'dd.MM.yyyy'}}
            </div>
          </div>
        </div>
      </div>
      
      <div *ngIf="filteredRecords.length === 0 && !loading" class="no-results">
        No vaccination records found matching your criteria.
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }

    h2 {
      margin-bottom: 1.8rem;
      font-size: 1.8rem;
      color: #212121;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .filter-section {
      margin-bottom: 2rem;
      background-color: #fff;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: end;
    }

    .search-group, .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .search-input, .filter-select {
      min-width: 200px;
      padding: 0.8rem 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      font-size: 0.95rem;
      background-color: #f9f9f9;
      transition: all 0.3s;
    }

    .search-input:focus, .filter-select:focus {
      outline: none;
      border-color: #212121;
      box-shadow: 0 0 0 2px rgba(33, 33, 33, 0.1);
      background-color: #fff;
    }

    .view-toggle {
      display: flex;
      gap: 0.5rem;
    }

    .toggle-btn {
      padding: 0.8rem 1rem;
      border: 1px solid #e0e0e0;
      background: #f9f9f9;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.3s;
    }

    .toggle-btn.active {
      background: #212121;
      color: white;
      border-color: #212121;
    }

    .reset-btn {
      padding: 0.8rem 1.2rem;
      background-color: #424242;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .reset-btn:hover {
      background-color: #212121;
    }

    .results-info {
      margin-bottom: 1rem;
      color: #666;
      font-size: 0.9rem;
    }

    .vaccination-table {
      width: 100%;
      border-collapse: collapse;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      overflow: hidden;
    }

    .vaccination-table th, .vaccination-table td {
      padding: 1rem;
      text-align: left;
    }

    .vaccination-table th {
      background: #212121;
      color: #fff;
      font-weight: 500;
      cursor: pointer;
      text-transform: uppercase;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
      transition: background-color 0.3s;
    }

    .vaccination-table th:hover {
      background: #424242;
    }

    .vaccination-table tr:nth-child(even) {
      background-color: #f5f5f5;
    }

    .vaccination-table tr:hover {
      background-color: #eee;
    }

    .record-card {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .record-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .record-body {
      color: #666;
    }

    .vaccine-name {
      font-weight: 500;
    }

    .vaccine-type {
      color: #888;
      font-size: 0.9rem;
    }

    .dose-badge {
      background: #212121;
      color: white;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .loading, .error, .no-results {
      padding: 3rem 1rem;
      text-align: center;
      border-radius: 8px;
      margin: 2rem 0;
    }

    .loading {
      background-color: #f5f5f5;
      color: #616161;
      font-weight: 500;
    }

    .error {
      color: #d32f2f;
      background-color: rgba(211, 47, 47, 0.1);
      border-left: 4px solid #d32f2f;
    }

    .no-results {
      color: #757575;
      background-color: #f5f5f5;
      border-left: 4px solid #212121;
    }
  `]
})
export class VaccinatedRecordsComponent implements OnInit, OnDestroy {
  searchTerm = '';
  vaccineFilter = '';
  sortBy = 'name';
  sortDirection = 'asc';
  viewMode: 'table' | 'list' = 'table';
  
  allRecords: VaccinationRecord[] = [];
  filteredRecords: VaccinationRecord[] = [];
  vaccines: Vaccine[] = [];
  
  loading = false;
  error = '';
  
  private searchTerms = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient, private apiService: ApiService) {}

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
        this.vaccines = data;
      },
      error: (err) => {
        console.error('Error loading vaccines:', err);
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

    this.filteredRecords = filtered;
    this.applySort();
  }
  
  resetFilters() {
    this.searchTerm = '';
    this.vaccineFilter = '';
    this.applyFilters();
  }

  setViewMode(mode: 'table' | 'list') {
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
}

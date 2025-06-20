import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { VaccinationRecord, Vaccine } from '../../models/interfaces';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-vaccinated-list',
  templateUrl: './vaccinated-list.component.html',
  // styleUrls: ['./vaccinated-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class VaccinatedListComponent implements OnInit, OnDestroy {
  searchTerm = '';
  records: VaccinationRecord[] = [];
  filteredRecords: VaccinationRecord[] = [];
  allRecords: VaccinationRecord[] = [];
  loading = false;
  error = '';
  sortBy = 'name';
  sortDirection = 'asc';
  vaccineFilter = '';
  vaccines: Vaccine[] = [];
  
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
        this.vaccines = data || [];
        console.log('Loaded vaccines:', this.vaccines);
      },
      error: (err) => {
        console.error('Error loading vaccines:', err);
        this.error = 'Failed to load vaccines';
        this.vaccines = [];
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
          this.records = [...this.allRecords];
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

    // Apply search filter
    if (this.searchTerm.trim()) {
      const lowercaseSearchTerm = this.searchTerm.toLowerCase();
      filtered = filtered.filter(record => {
        const nameMatch = `${record.osobaMeno} ${record.osobaPriezvisko}`.toLowerCase().includes(lowercaseSearchTerm);
        const vaccineMatch = record.vakcinaNazov.toLowerCase().includes(lowercaseSearchTerm);
        return nameMatch || vaccineMatch;
      });
    }

    // Apply vaccine filter
    if (this.vaccineFilter) {
      filtered = filtered.filter(record => 
        record.vakcinaNazov.toLowerCase().includes(this.vaccineFilter.toLowerCase()) ||
        record.vakcinaTyp.toLowerCase().includes(this.vaccineFilter.toLowerCase())
      );
    }

    this.filteredRecords = filtered;
    this.applySort();
  }
  
  resetFilters() {
    this.searchTerm = '';
    this.vaccineFilter = '';
    this.filteredRecords = [...this.allRecords];
    this.applySort();
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
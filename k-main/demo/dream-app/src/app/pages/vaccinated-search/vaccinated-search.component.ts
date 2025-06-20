import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { VaccinationRecord, Vaccine, Person } from '../../models/interfaces';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-vaccinated-search',
  templateUrl: './vaccinated-search.component.html',
  styleUrls: ['./vaccinated-search.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class VaccinatedSearchComponent implements OnInit, OnDestroy {
  searchTerm = '';
  vaccineFilter = '';
  dateFrom = '';
  dateTo = '';
  sortBy = 'name';
  sortDirection = 'asc';
  results: VaccinationRecord[] = [];
  allRecords: VaccinationRecord[] = [];
  loading = false;
  error = '';
  vaccines: Vaccine[] = [];
  people: Person[] = [];
  
  // CRUD variables
  showEditModal = false;
  showAddModal = false;
  editingRecord: any = {};
  
  // Add Math property to make it accessible in template
  Math = Math;
  
  private searchTerms = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient, 
    private apiService: ApiService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.loadVaccines();
    this.loadPeople();
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

  loadPeople() {
    this.apiService.getAllPersons().subscribe({
      next: (data) => {
        this.people = data;
      },
      error: (err) => {
        console.error('Error loading people:', err);
      }
    });
  }

  loadRecords() {
    this.loading = true;
    this.error = '';
    
    // Use enhanced search endpoint with filters
    const params = new URLSearchParams();
    if (this.searchTerm) params.append('query', this.searchTerm);
    if (this.dateFrom) params.append('dateFrom', this.dateFrom);
    if (this.dateTo) params.append('dateTo', this.dateTo);
    
    const url = `${environment.apiUrl}/osobavakcina/search${params.toString() ? '?' + params.toString() : ''}`;
    
    this.http.get<VaccinationRecord[]>(url)
      .subscribe({
        next: (data) => {
          this.allRecords = data;
          this.results = [...this.allRecords];
          this.applyFilters();
          this.loading = false;
          console.log(`Successfully loaded ${data.length} vaccination records`);
        },
        error: (err) => {
          this.loading = false;
          console.error('Error loading vaccination records:', err);
          this.handleLoadError(err);
        }
      });
  }

  private handleLoadError(err: any) {
    if (err.status === 0) {
      this.error = 'Cannot connect to server. Please check your connection and try again.';
    } else if (err.status === 404) {
      this.error = 'Vaccination records not found. The service may be unavailable.';
    } else if (err.status >= 500) {
      this.error = 'Server error occurred. Please try again later.';
    } else {
      this.error = `Error loading vaccination records: ${err.error?.message || err.statusText || 'Unknown error'}`;
    }
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

    this.results = filtered;
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
    
    this.results.sort((a, b) => {
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

  resetFilters() {
    this.searchTerm = '';
    this.vaccineFilter = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.loadRecords();
  }

  // CRUD Methods
  openAddModal() {
    this.editingRecord = {
      osobaId: '',
      vakcinaId: '',
      datumAplikacie: new Date().toISOString().split('T')[0],
      poradieDavky: 1
    };
    this.showAddModal = true;
  }

  saveRecord() {
    if (!this.auth.isLoggedIn()) {
      this.error = 'You must be logged in as an administrator to modify records.';
      return;
    }

    if (!this.editingRecord.osobaId || !this.editingRecord.vakcinaId) {
      this.error = 'Person and Vaccine selection are required';
      return;
    }

    if (!this.editingRecord.datumAplikacie) {
      this.error = 'Application date is required';
      return;
    }

    // Ensure proper data types
    const payload = {
      osobaId: Number(this.editingRecord.osobaId),
      vakcinaId: Number(this.editingRecord.vakcinaId),
      datumAplikacie: this.editingRecord.datumAplikacie,
      poradieDavky: Number(this.editingRecord.poradieDavky) || 1
    };

    console.log('Saving record with payload:', payload);

    if (this.showAddModal) {
      // Use smart add endpoint with authentication
      this.apiService.addSingleVaccination(payload)
        .subscribe({
          next: (response) => {
            console.log('Record added successfully:', response);
            this.closeModal();
            this.loadRecords();
            this.error = '';
          },
          error: (err) => {
            console.error('Error adding record:', err);
            this.handleSaveError(err, 'add');
          }
        });
    } else {
      // Update existing record
      const id = this.editingRecord.id;
      if (!id) {
        this.error = 'Missing record ID for update';
        return;
      }
      this.apiService.updateVaccinationRecord(id, payload)
        .subscribe({
          next: (response) => {
            console.log('Record updated successfully:', response);
            this.closeModal();
            this.loadRecords();
            this.error = '';
          },
          error: (err) => {
            console.error('Error updating record:', err);
            this.handleSaveError(err, 'update');
          }
        });
    }
  }

  private handleSaveError(err: any, operation: string) {
    if (err.status === 401 || err.status === 403) {
      this.error = `You are not authorized to ${operation} records. Please login again.`;
    } else if (err.status === 404) {
      this.error = 'Record not found. It may have been deleted.';
    } else if (err.status >= 500) {
      this.error = `Server error occurred while ${operation}ing. Please try again.`;
    } else {
      this.error = `Error ${operation}ing record: ${err.error?.message || err.statusText || 'Unknown error'}`;
    }
  }

  // Delete vaccination record
  deleteRecord(record: VaccinationRecord) {
    if (!record.id) {
      this.error = 'Missing record ID for delete';
      return;
    }
    if (confirm(`Are you sure you want to delete the vaccination record for ${record.osobaMeno} ${record.osobaPriezvisko}?`)) {
      console.log('Deleting record with ID:', record.id);
      
      this.apiService.deleteVaccinationRecord(record.id)
        .subscribe({
          next: () => {
            console.log('Record deleted successfully');
            this.loadRecords();
            this.error = '';
          },
          error: (err) => {
            console.error('Error deleting record:', err);
            if (err.status === 404) {
              this.error = 'Record not found. It may have already been deleted.';
            } else if (err.status === 403) {
              this.error = 'You are not authorized to delete this record.';
            } else {
              this.error = `Error deleting record: ${err.error?.message || err.statusText || 'Unknown error'}`;
            }
          }
        });
    }
  }

  // Update existing record
  updateOsobaVakcinaFromDto(id: number, dto: any) {
    console.log('Updating record with ID:', id, 'and data:', dto);
    
    return this.apiService.updateVaccinationRecord(id, dto)
      .subscribe({
        next: (response) => {
          console.log('Record updated successfully:', response);
          this.loadRecords();
          this.error = '';
        },
        error: (err) => {
          console.error('Error updating record:', err);
          this.error = `Error updating record: ${err.error?.message || err.statusText || 'Unknown error'}`;
        }
      });
  }

  editRecord(record: VaccinationRecord) {
    this.editingRecord = {
      id: record.id,
      osobaId: record.osobaId,
      vakcinaId: record.vakcinaId,
      datumAplikacie: record.datumAplikacie,
      poradieDavky: record.poradieDavky
    };
    this.showEditModal = true;
  }

  closeModal() {
    this.showEditModal = false;
    this.showAddModal = false;
    this.editingRecord = {};
  }

  trackByRecordId(index: number, record: VaccinationRecord): number {
    return record.id;
  }

  refreshData(): void {
    // Implement the refresh logic here
    // For example, reload the search results or reset filters
    this.loadData();
  }

  private loadData() {
    this.loadRecords();
    this.loadVaccines();
    this.loadPeople();
  }
}
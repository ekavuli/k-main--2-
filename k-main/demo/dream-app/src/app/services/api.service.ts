import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Person, Vaccine, Vaccination, VaccinationRecord } from '../models/interfaces';
import { AuthService } from './auth.service';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Vaccines
  getAllVaccines(): Observable<Vaccine[]> {
    return this.http.get<Vaccine[]>(`${this.baseUrl}/vakcina/all`);
  }

  getVaccineById(id: number): Observable<Vaccine> {
    return this.http.get<Vaccine>(`${this.baseUrl}/vakcina/${id}`);
  }

  addVaccine(vaccine: Vaccine): Observable<Vaccine> {
    return this.http.post<Vaccine>(`${this.baseUrl}/vakcina/add`, vaccine, {
      headers: this.getAuthHeaders()
    });
  }

  updateVaccine(id: number, vaccine: Vaccine): Observable<Vaccine> {
    return this.http.put<Vaccine>(`${this.baseUrl}/vakcina/update/${id}`, vaccine, {
      headers: this.getAuthHeaders()
    });
  }

  deleteVaccine(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/vakcina/delete/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  searchVaccines(query: string): Observable<Vaccine[]> {
    return this.http.get<Vaccine[]>(`${this.baseUrl}/vakcina/search?query=${query}`);
  }

  // People
  getAllPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.baseUrl}/osoby/all`);
  }

  getPersonById(id: number): Observable<Person> {
    return this.http.get<Person>(`${this.baseUrl}/osoby/${id}`);
  }

  addPerson(person: Person): Observable<Person> {
    return this.http.post<Person>(`${this.baseUrl}/osoby/add`, person, {
      headers: this.getAuthHeaders()
    });
  }

  updatePerson(id: number, person: Person): Observable<Person> {
    return this.http.put<Person>(`${this.baseUrl}/osoby/${id}`, person, {
      headers: this.getAuthHeaders()
    });
  }

  deletePerson(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/osoby/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  searchPersons(query: string): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.baseUrl}/osoby/search?query=${query}`);
  }

  // Vaccinations
  getAllVaccinations(): Observable<Vaccination[]> {
    return this.http.get<Vaccination[]>(`${this.baseUrl}/vaccination/all`);
  }

  getActiveVaccinations(): Observable<Vaccination[]> {
    return this.http.get<Vaccination[]>(`${this.baseUrl}/vaccination/active`);
  }

  getVaccinationsByPerson(personId: number): Observable<Vaccination[]> {
    return this.http.get<Vaccination[]>(`${this.baseUrl}/vaccination/person/${personId}`);
  }

  getVaccinationById(id: number): Observable<Vaccination> {
    return this.http.get<Vaccination>(`${this.baseUrl}/vaccination/${id}`);
  }

  createVaccinationCampaign(data: any): Observable<Vaccination> {
    return this.http.post<Vaccination>(`${this.baseUrl}/vaccination/create`, data, {
      headers: this.getAuthHeaders()
    });
  }

  updateVaccinationCampaign(id: number, data: any): Observable<Vaccination> {
    return this.http.put<Vaccination>(`${this.baseUrl}/vaccination/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  deleteVaccinationCampaign(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/vaccination/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  markDoseAsApplied(doseId: number, actualDate: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/vaccination/dose/${doseId}/apply`, null, {
      headers: this.getAuthHeaders(),
      params: { actualDate }
    });
  }

  // Vaccination Records (OsobaVakcina)
  getAllVaccinationRecords(): Observable<VaccinationRecord[]> {
    return this.http.get<VaccinationRecord[]>(`${this.baseUrl}/osobavakcina`);
  }

  getVaccinationRecordById(id: number): Observable<VaccinationRecord> {
    return this.http.get<VaccinationRecord>(`${this.baseUrl}/osobavakcina/${id}`);
  }

  getVaccinationsByPersonAndVaccine(personId: number, vaccineId: number): Observable<VaccinationRecord[]> {
    return this.http.get<VaccinationRecord[]>(
      `${this.baseUrl}/osobavakcina/person/${personId}/vaccine/${vaccineId}`
    );
  }

  addSingleVaccination(data: any): Observable<VaccinationRecord> {
    return this.http.post<VaccinationRecord>(`${this.baseUrl}/osobavakcina/add-smart`, data, {
      headers: this.getAuthHeaders(),
      responseType: 'json'
    }).pipe(
      tap(response => console.log('Add vaccination response:', response)),
      catchError(error => {
        console.error('Error in addSingleVaccination:', error);
        return throwError(() => error);
      })
    );
  }

  updateVaccinationRecord(id: number, data: any): Observable<VaccinationRecord> {
    return this.http.put<VaccinationRecord>(`${this.baseUrl}/osobavakcina/update/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  deleteVaccinationRecord(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/osobavakcina/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  searchVaccinationRecords(query?: string, dateFrom?: string, dateTo?: string): Observable<VaccinationRecord[]> {
    let url = `${this.baseUrl}/osobavakcina/search`;
    const params: string[] = [];

    if (query) params.push(`query=${query}`);
    if (dateFrom) params.push(`dateFrom=${dateFrom}`);
    if (dateTo) params.push(`dateTo=${dateTo}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<VaccinationRecord[]>(url);
  }
}
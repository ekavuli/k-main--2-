import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class HomeComponent implements OnInit {
  personCount = 0;
  vaccineCount = 0;
  vaccinationCount = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Get count of people
    this.http.get<any[]>(`${environment.apiUrl}/osoby/all`)
      .subscribe(data => {
        this.personCount = data.length;
      });
      
    // Get count of vaccines
    this.http.get<any[]>(`${environment.apiUrl}/vakcina/all`)
      .subscribe(data => {
        this.vaccineCount = data.length;
      });
      
    // Get count of vaccinations
    this.http.get<any[]>(`${environment.apiUrl}/osobavakcina`)
      .subscribe(data => {
        this.vaccinationCount = data.length;
      });
  }
}
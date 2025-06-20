import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';

export interface NotificationItem {
  id: string;
  personId: number;
  personName: string;
  personPhone?: string;
  personEmail?: string;
  vaccineName: string;
  nextDoseNumber: number;
  scheduledDate: Date;
  isUrgent: boolean;
  isOverdue: boolean;
  daysUntil: number;
  priority: 'urgent' | 'soon' | 'normal';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient, private apiService: ApiService) {
    this.loadNotifications();
    // Refresh notifications every 5 minutes
    setInterval(() => this.loadNotifications(), 5 * 60 * 1000);
  }

  loadNotifications(): void {
    // Use the actual backend endpoints instead of calculating ourselves
    this.http.get<any[]>(`${environment.apiUrl}/notifications/overdue`).pipe(
      map((notifications) => {
        return notifications.map(notif => ({
          id: `${notif.osobaId}-${notif.vakcinaNazov}-${notif.poradieDavky}`,
          personId: notif.osobaId,
          personName: `${notif.osobaMeno} ${notif.osobaPriezvisko}`,
          personPhone: '', // Would need to be added from person data
          personEmail: '', // Would need to be added from person data
          vaccineName: notif.vakcinaNazov,
          nextDoseNumber: notif.poradieDavky,
          scheduledDate: new Date(notif.planovanyDatum),
          isUrgent: notif.dniDoAplikacie < 0,
          isOverdue: notif.dniDoAplikacie < 0,
          daysUntil: notif.dniDoAplikacie,
          priority: notif.dniDoAplikacie < 0 ? 'urgent' : 'normal'
        } as NotificationItem));
      }),
      catchError(error => {
        console.error('Error loading notification data:', error);
        return of([]);
      })
    ).subscribe(notifications => {
      this.notificationsSubject.next(notifications);
    });
  }

  private loadVaccinationRecords(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/osobavakcina`).pipe(
      catchError(error => {
        console.error('Error loading vaccination records:', error);
        return of([]);
      })
    );
  }

  // Remove the complex calculation method and use simpler approach
  private calculateOverdueVaccinations(persons: any[], vaccines: any[], records: any[]): NotificationItem[] {
    // This method is no longer needed as we get data directly from backend
    return [];
  }

  private getMockNotifications(): NotificationItem[] {
    return [];
  }

  getNotificationCount(): Observable<number> {
    return this.notifications$.pipe(
      map(notifications => notifications.filter(n => n.isOverdue).length)
    );
  }

  markAsContacted(notificationId: string): void {
    // Implementation for marking notification as contacted
    // This could update a backend service or local storage
    console.log(`Marked notification ${notificationId} as contacted`);
  }
}

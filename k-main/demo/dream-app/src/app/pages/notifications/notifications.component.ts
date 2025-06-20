import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationItem } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="header">
        <h2>Vaccination Notifications</h2>
        <p class="subtitle">Manage overdue vaccination appointments</p>
      </div>
      
      <div class="notification-sections">
        <div class="section overdue" *ngIf="overdueNotifications.length > 0; else noNotifications">
          <div class="section-header">
            <h3>Overdue Vaccinations</h3>
            <span class="count">{{overdueNotifications.length}}</span>
          </div>
          <div class="notification-list">
            <div *ngFor="let notification of overdueNotifications" class="notification-item urgent">
              <div class="notification-content">
                <div class="person-info">
                  <strong>{{notification.personName}}</strong>
                  <span class="vaccine-details">{{notification.vaccineName}} - Dose {{notification.nextDoseNumber}}</span>
                </div>
                <div class="date-info">
                  <span class="scheduled-date">Scheduled: {{notification.scheduledDate | date:'dd/MM/yyyy'}}</span>
                  <span class="overdue-days">{{Math.abs(notification.daysUntil)}} days overdue</span>
                </div>
              </div>
              <div class="actions" *ngIf="auth.isLoggedIn()">
                <button class="action-btn primary" (click)="contactPerson(notification)">Contact</button>
                <button class="action-btn secondary" (click)="markAsContacted(notification.id)">Mark Contacted</button>
              </div>
            </div>
          </div>
        </div>
        
        <ng-template #noNotifications>
          <div class="no-notifications">
            <h3>No Overdue Vaccinations</h3>
            <p>All vaccination schedules are up to date!</p>
            <button class="refresh-btn" (click)="refreshNotifications()">Refresh</button>
          </div>
        </ng-template>
      </div>

      <div *ngIf="loading" class="loading">Loading notifications...</div>
      <div *ngIf="error" class="error">{{error}}</div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1000px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }

    .header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header h2 {
      font-size: 2rem;
      color: #212121;
      font-weight: 600;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .subtitle {
      color: #666;
      font-size: 1rem;
      margin: 0;
    }

    .notification-sections {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .section {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: #ffebee;
      border-bottom: 1px solid #f44336;
    }

    .section-header h3 {
      margin: 0;
      font-size: 1.2rem;
      color: #212121;
      font-weight: 600;
    }

    .count {
      background: #d32f2f;
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .notification-list {
      display: flex;
      flex-direction: column;
    }

    .notification-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.2s;
      border-left: 4px solid #d32f2f;
    }

    .notification-item:hover {
      background-color: #f8f9fa;
    }

    .notification-item:last-child {
      border-bottom: none;
    }

    .notification-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }

    .person-info {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .person-info strong {
      color: #212121;
      font-size: 1.1rem;
    }

    .vaccine-details {
      color: #666;
      font-size: 0.9rem;
    }

    .date-info {
      display: flex;
      gap: 1rem;
      font-size: 0.9rem;
    }

    .scheduled-date {
      color: #666;
    }

    .overdue-days {
      color: #d32f2f;
      font-weight: 600;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
    }

    .action-btn.primary {
      background: #212121;
      color: white;
    }

    .action-btn.primary:hover {
      background: #424242;
    }

    .action-btn.secondary {
      background: transparent;
      color: #666;
      border: 1px solid #e0e0e0;
    }

    .action-btn.secondary:hover {
      background: #f8f9fa;
      color: #212121;
    }

    .no-notifications {
      padding: 4rem 2rem;
      text-align: center;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .no-notifications h3 {
      color: #4caf50;
      margin-bottom: 1rem;
    }

    .no-notifications p {
      color: #666;
      font-size: 1.1rem;
    }

    .refresh-btn {
      margin-top: 1rem;
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      background: #4caf50;
      color: white;
      transition: background-color 0.2s;
    }

    .refresh-btn:hover {
      background: #388e3c;
    }

    .loading, .error {
      padding: 2rem;
      text-align: center;
    }

    .loading {
      color: #666;
    }

    .error {
      color: #d32f2f;
      background: #ffebee;
      border-radius: 4px;
    }

    @media (max-width: 768px) {
      .notification-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .actions {
        width: 100%;
        justify-content: flex-end;
      }

      .date-info {
        flex-direction: column;
        gap: 0.2rem;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications$: Observable<NotificationItem[]>;
  overdueNotifications: NotificationItem[] = [];
  loading = false;
  error = '';
  Math = Math;

  constructor(
    private notificationService: NotificationService,
    public auth: AuthService
  ) {
    this.notifications$ = this.notificationService.notifications$;
  }

  ngOnInit() {
    this.loading = true;
    this.notifications$.subscribe({
      next: (notifications) => {
        this.overdueNotifications = notifications.filter(n => n.isOverdue);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load notifications';
        this.loading = false;
        console.error('Error loading notifications:', error);
      }
    });
  }

  contactPerson(notification: NotificationItem) {
    if (!this.auth.isLoggedIn()) {
      alert('Only administrators can contact patients.');
      return;
    }
    
    const message = `Reminder: Your next ${notification.vaccineName} vaccination (dose ${notification.nextDoseNumber}) was scheduled for ${notification.scheduledDate.toLocaleDateString()}.`;
    
    if (notification.personEmail) {
      window.location.href = `mailto:${notification.personEmail}?subject=Vaccination Reminder&body=${encodeURIComponent(message)}`;
    } else if (notification.personPhone) {
      alert(`Contact ${notification.personName} at: ${notification.personPhone}\n\n${message}`);
    } else {
      alert(`Contact information not available for ${notification.personName}`);
    }
  }

  markAsContacted(notificationId: string) {
    if (!this.auth.isLoggedIn()) {
      alert('Only administrators can mark notifications as contacted.');
      return;
    }
    
    this.notificationService.markAsContacted(notificationId);
  }

  refreshNotifications() {
    this.loading = true;
    this.notificationService.loadNotifications();
  }
}

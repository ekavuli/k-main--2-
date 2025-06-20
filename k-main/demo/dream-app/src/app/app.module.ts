import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { routes } from './app.routes';
import { AuthInterceptor } from './services/auth.interceptor';
import { NotificationService } from './services/notification.service';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    NotificationService
  ],
})
export class AppModule { }
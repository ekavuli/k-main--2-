import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { VaccinatedSearchComponent } from './pages/vaccinated-search/vaccinated-search.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { AddPersonComponent } from './pages/admin/add-person/add-person.component';
import { AddVaccineComponent } from './pages/admin/add-vaccine/add-vaccine.component';
import { AddVaccinationComponent } from './pages/admin/add-vaccination/add-vaccination.component';
import { VaccinationCampaignsComponent } from './pages/vaccination-campaigns/vaccination-campaigns.component';
import { AdminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'vaccinated', component: VaccinatedSearchComponent },
  { path: 'search', component: VaccinatedSearchComponent },
  { path: 'notifications', component: NotificationsComponent, canActivate: [AdminGuard] },
  { path: 'vaccination-campaigns', component: VaccinationCampaignsComponent, canActivate: [AdminGuard] },
  { path: 'admin/add-person', component: AddPersonComponent, canActivate: [AdminGuard] },
  { path: 'admin/add-vaccine', component: AddVaccineComponent, canActivate: [AdminGuard] },
  { path: 'admin/add-vaccination', component: AddVaccinationComponent, canActivate: [AdminGuard] }
];
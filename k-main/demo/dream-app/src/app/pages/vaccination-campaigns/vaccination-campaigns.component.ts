import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-vaccination-campaigns',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vaccination-campaigns.component.html',
  styleUrls: ['./vaccination-campaigns.component.css']
})
export class VaccinationCampaignsComponent implements OnInit {
  campaigns: any[] = [];
  loading = false;
  error: string | null = null;
  
  newCampaign = {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    targetGroup: '',
    vaccineType: ''
  };
  
  showCreateForm = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadCampaigns();
  }

  loadCampaigns() {
    this.loading = true;
    this.error = null;
    
    this.authService.getAllVaccinationCampaigns().subscribe({
      next: (campaigns) => {
        this.campaigns = campaigns;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  createCampaign() {
    if (!this.validateCampaign()) return;

    this.loading = true;
    this.authService.createVaccinationCampaign(this.newCampaign).subscribe({
      next: () => {
        this.resetForm();
        this.loadCampaigns();
        this.showCreateForm = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  deleteCampaign(id: number) {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    this.authService.deleteVaccinationCampaign(id).subscribe({
      next: () => {
        this.loadCampaigns();
      },
      error: (error) => {
        this.error = error.message;
      }
    });
  }

  private validateCampaign(): boolean {
    return !!(this.newCampaign.name && this.newCampaign.startDate && this.newCampaign.endDate);
  }

  private resetForm() {
    this.newCampaign = {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      targetGroup: '',
      vaccineType: ''
    };
  }
}

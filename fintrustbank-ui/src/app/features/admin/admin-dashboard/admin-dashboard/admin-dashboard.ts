import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../../core/services/admin';
import { PopupService } from '../../../../core/services/popup';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboardComponent implements OnInit {
  adminService = inject(AdminService);
  popupService = inject(PopupService);
  private cdr = inject(ChangeDetectorRef);
  logs: any[] = [];
  dashboard: any = null;
  recentLogs: any[] = [];
  loading = true;
 hello=true;

  ngOnInit() {
    this.loadDashboard();
    this.cdr.detectChanges();
  }

  loadDashboard() {
  this.loading = true;

  forkJoin({
    dashboard: this.adminService.getDashboard(),
    logs: this.adminService.getAuditLogs(1, 10)
  }).subscribe({
    next: (res: any) => {
      this.dashboard = res.dashboard.data;
      this.recentLogs = res.logs.data.items; // ✅ set together
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.loading = false;
      this.popupService.error('Error', 'Failed to load admin dashboard.');
      this.cdr.detectChanges();
    }
  });
}
}
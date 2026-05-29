import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from '../../../core/services/account';
import { TransactionService } from '../../../core/services/transaction';
import { KycService } from '../../../core/services/kyc';
import { AuthService } from '../../../core/services/auth';
import { PopupService } from '../../../core/services/popup';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  accountService    = inject(AccountService);
  transactionService = inject(TransactionService);
  kycService        = inject(KycService);
  authService       = inject(AuthService);
  popupService      = inject(PopupService);
  router            = inject(Router);

  constructor(private cdr: ChangeDetectorRef) {}

  user: any               = null;
  accounts: any[]         = [];
  recentTransactions: any[] = [];
  kycStatus: any          = null;
  loading                 = false;
  showTotalBalance        = false;
  totalBalance            = 0;
  activeAccounts          = 0;
  hasDeactivatedAccount   = false; // status === 4
  loaded                  = false;

  ngOnInit() {
    this.user = this.authService.getUser();
    if (!this.loaded) {
      this.loadDashboard();
      this.loaded = true;
    }
  }

  loadDashboard() {
    this.loading = true;
    this.cdr.detectChanges();

    this.accountService.getMyAccounts().subscribe({
      next: (res: any) => {
        this.accounts        = res.data || [];
        this.totalBalance    = this.accounts.reduce((sum: number, a: any) => sum + a.balance, 0);
        this.activeAccounts  = this.accounts.filter((a: any) => a.status === 2).length;
        // AccountStatus.Deactivated = 4
        this.hasDeactivatedAccount = this.accounts.some((a: any) => a.status === 4);

        if (this.accounts.length > 0) {
          this.transactionService.getHistory(this.accounts[0].id, 1, 5).subscribe({
            next: (txRes: any) => {
              this.recentTransactions = txRes.data.items || [];
              this.loading = false;
              this.cdr.detectChanges();
            },
            error: () => {
              this.loading = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.popupService.error('Error', 'Failed to load dashboard data.');
      }
    });

    this.kycService.getMyKyc().subscribe({
      next: (res: any) => {
        this.kycStatus = res.data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.kycStatus = null;
        this.cdr.detectChanges();
      }
    });
  }

  toggleTotalBalance() { this.showTotalBalance = !this.showTotalBalance; }

  getStatusLabel(status: number): string {
    const map: any = { 1: 'Pending Activation', 2: 'Active', 3: 'Inactive', 4: 'Deactivated' };
    return map[status] || 'Unknown';
  }

  getStatusClass(status: number): string {
    const map: any = { 1: 'badge-warning', 2: 'badge-success', 3: 'badge-muted', 4: 'badge-danger' };
    return map[status] || 'badge-muted';
  }

  getKycStatusLabel(status: number): string {
    const map: any = { 1: 'Pending', 2: 'Approved', 3: 'Rejected' };
    return map[status] || 'Not Submitted';
  }

  getKycStatusClass(status: number): string {
    const map: any = { 1: 'badge-warning', 2: 'badge-success', 3: 'badge-danger' };
    return map[status] || 'badge-muted';
  }

  getTxTypeLabel(type: number): string {
    const map: any = { 1: 'Deposit', 2: 'Withdrawal', 3: 'Transfer Out', 4: 'Transfer In' };
    return map[type] || 'Unknown';
  }

  getTxTypeClass(type: number): string {
    const map: any = { 1: 'badge-success', 2: 'badge-danger', 3: 'badge-warning', 4: 'badge-info' };
    return map[type] || 'badge-muted';
  }

  getAccountTypeLabel(type: number): string {
    const map: any = { 1: 'Savings', 2: 'Current', 3: 'Fixed Deposit' };
    return map[type] || 'Unknown';
  }
}
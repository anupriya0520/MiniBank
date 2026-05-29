import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { KycService } from '../../../../core/services/kyc';
import { PopupService } from '../../../../core/services/popup';
import{Router} from '@angular/router';
@Component({
  selector: 'app-kyc-status',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './kyc-status.html',
  styleUrl: './kyc-status.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KycStatusComponent implements OnInit {
  kycService  = inject(KycService);
  popupService = inject(PopupService);
  cdr         = inject(ChangeDetectorRef);

  kyc: any = null;
  loading  = true;

  statusLabel      = '';
  statusClass      = '';
  accountTypeLabel = '';
constructor(private router: Router) {}
goBack(){
  this.router.navigate(['/accounts']);
}
  ngOnInit() {
    this.loadKyc();
  }

  loadKyc() {
    this.loading = true;
    this.kycService.getMyKyc().subscribe({
      next: (res: any) => {
        this.kyc = res.data;
        if (this.kyc) {
          this.statusLabel      = this.getStatusLabel(this.kyc.status);
          this.statusClass      = this.getStatusClass(this.kyc.status);
          this.accountTypeLabel = this.getAccountTypeLabel(this.kyc.requestedAccountType);
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.kyc     = null;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private getStatusLabel(status: number): string {
    const map: any = { 1: 'Pending Review', 2: 'Approved', 3: 'Rejected' };
    return map[status] || 'Unknown';
  }

  private getStatusClass(status: number): string {
    const map: any = { 1: 'badge-warning', 2: 'badge-success', 3: 'badge-danger' };
    return map[status] || 'badge-muted';
  }

  private getAccountTypeLabel(type: number): string {
    const map: any = { 1: 'Savings', 2: 'Current', 3: 'Fixed Deposit' };
    return map[type] || 'Unknown';
  }
}
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../core/services/admin';
import { PopupService } from '../../../../core/services/popup';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-kyc-management',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './kyc-management.html',
  styleUrl: './kyc-management.css'
})
export class KycManagementComponent implements OnInit {
  adminService = inject(AdminService);
  popupService = inject(PopupService);
  private cdr = inject(ChangeDetectorRef);

  kycList: any[] = [];
  filteredList: any[] = [];
  loading = true;
  activeFilter: 'all' | 'pending' | 'approved' | 'rejected' = 'pending';

  selectedKyc: any = null;
  showReviewPanel = false;
  submitting = false;

  // ✅ rejection reason input
  rejectionReason = '';
  showRejectionInput = false;

  ngOnInit() {
    this.loadKyc();
  }

  loadKyc() {
    this.loading = true;

    this.adminService.getAllKyc().subscribe({
      next: (res: any) => {
        this.kycList = res.data || [];
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.popupService.error('Error', 'Failed to load KYC requests.');
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter() {
    if (this.activeFilter === 'all') {
      this.filteredList = this.kycList;
    } else {
      const map: any = { pending: 1, approved: 2, rejected: 3 };
      this.filteredList = this.kycList.filter(k => k.status === map[this.activeFilter]);
    }
    this.cdr.detectChanges();
  }

  setFilter(filter: 'all' | 'pending' | 'approved' | 'rejected') {
    this.activeFilter = filter;
    this.applyFilter();
  }

  getCount(status: 'all' | 'pending' | 'approved' | 'rejected'): number {
    if (status === 'all') return this.kycList.length;
    const map: any = { pending: 1, approved: 2, rejected: 3 };
    return this.kycList.filter(k => k.status === map[status]).length;
  }

  openReview(kyc: any) {
    this.selectedKyc = kyc;
    this.showReviewPanel = true;
    this.rejectionReason = '';
    this.showRejectionInput = false;
    this.cdr.detectChanges();
  }

  closeReview() {
    this.showReviewPanel = false;
    this.selectedKyc = null;
    this.rejectionReason = '';
    this.showRejectionInput = false;
    this.cdr.detectChanges();
  }

  // ✅ direct approve — no toggle needed
  approveKyc() {
    this.submitting = true;
    this.cdr.detectChanges();

    this.adminService.reviewKyc(this.selectedKyc.id, {
      isApproved: true,
      rejectionReason: ''
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.closeReview();
        this.popupService.success(
          'KYC Approved',
          'KYC approved. Bank account has been created for the user.',
          () => this.loadKyc()
        );
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.submitting = false;
        this.popupService.error('Error', err?.error?.message || 'Could not approve KYC.');
        this.cdr.detectChanges();
      }
    });
  }

  // ✅ show rejection input first
  initiateReject() {
    this.showRejectionInput = true;
    this.cdr.detectChanges();
  }

  // ✅ submit rejection with reason
  rejectKyc() {
    if (!this.rejectionReason.trim()) return;

    this.submitting = true;
    this.cdr.detectChanges();

    this.adminService.reviewKyc(this.selectedKyc.id, {
      isApproved: false,
      rejectionReason: this.rejectionReason
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.closeReview();
        this.popupService.success(
          'KYC Rejected',
          'KYC rejected successfully.',
          () => this.loadKyc()
        );
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.submitting = false;
        this.popupService.error('Error', err?.error?.message || 'Could not reject KYC.');
        this.cdr.detectChanges();
      }
    });
  }

  getStatusLabel(status: number): string {
    const map: any = { 1: 'Pending', 2: 'Approved', 3: 'Rejected' };
    return map[status] || 'Unknown';
  }

  getStatusClass(status: number): string {
    const map: any = { 1: 'badge-warning', 2: 'badge-success', 3: 'badge-danger' };
    return map[status] || 'badge-muted';
  }

  openDocument(kycId: number): void {
    this.adminService.downloadKycDocument(kycId).subscribe({
      next: (blob: Blob) => {
        const objectUrl = URL.createObjectURL(blob);
        window.open(objectUrl, '_blank');
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      },
      error: (err) => {
        this.popupService.error('Error', err?.error?.message || 'Could not load document.');
      }
    });
  }

  getAccountTypeLabel(type: number): string {
    const map: any = { 1: 'Savings', 2: 'Current', 3: 'Fixed Deposit' };
    return map[type] || 'Unknown';
  }
}
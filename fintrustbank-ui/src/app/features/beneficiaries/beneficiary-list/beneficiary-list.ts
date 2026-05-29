import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountService } from '../../../core/services/account';
import { PopupService } from '../../../core/services/popup';
import { Router } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-beneficiary-list',
  standalone: true,
  imports: [CommonModule, RouterModule,FormsModule],
  templateUrl: './beneficiary-list.html',
  styleUrl: './beneficiary-list.css'
})
export class BeneficiaryListComponent implements OnInit {
  accountService = inject(AccountService);
  popupService = inject(PopupService);
  router = inject(Router);
  transactionService = inject(TransactionService);

  constructor(private cdr: ChangeDetectorRef) {}

  accounts: any[] = [];
  beneficiaries: any[] = [];
  selectedAccountId: number | null = null;
  loadingAccounts = true;
  loadingBeneficiaries = false;
  transferPopupVisible = false;
selectedBeneficiary: any = null;
transferAmount = '';
transferPin = '';
transferLoading = false;

  ngOnInit() {
    this.accountService.getMyAccounts().subscribe({
      next: (res: any) => {
        this.accounts = res.data || [];
        this.loadingAccounts = false;
        this.cdr.detectChanges();  

        if (this.accounts.length > 0) {
          this.selectedAccountId = this.accounts[0].id;
          this.loadBeneficiaries();
        }
      },
      error: () => {
        this.loadingAccounts = false;
        this.cdr.detectChanges();  
        this.popupService.error('Error', 'Failed to load accounts.');
      }
    });
  }

  goToTransfer() {
    this.router.navigate(['/transactions/transfer']);
  }

  onAccountChange(event: any) {
    this.selectedAccountId = +event.target.value;
    this.loadBeneficiaries();
  }
 openTransferPopup(b: any) {
  console.log("Transfer clicked", b);
  this.selectedBeneficiary = b;
  this.transferPopupVisible = true;
  this.cdr.detectChanges(); 
}
confirmTransfer() {
  if (!this.transferAmount || !this.transferPin) {
    this.popupService.error('Error', 'Amount and PIN required');
    return;
  }

  if (!this.selectedAccountId) return;

  this.transferLoading = true;

  this.transactionService.transferToBeneficiary(
    this.selectedAccountId,
    {
      beneficiaryId: this.selectedBeneficiary.id,
      amount: +this.transferAmount,
      transferPin: this.transferPin,
      description: `Transfer to ${this.selectedBeneficiary.name}`
    }
  ).subscribe({
    next: () => {
      this.transferLoading = false;
      this.transferPopupVisible = false;

      this.popupService.success(
        'Transfer Successful',
        `₹${this.transferAmount} sent to ${this.selectedBeneficiary.name}`
      );
    },
    error: (err:any) => {
      this.transferLoading = false;
      this.popupService.error(
        'Transfer Failed',
        err?.error?.message || 'Something went wrong'
      );
    }
  });
}
  loadBeneficiaries() {
    if (!this.selectedAccountId) return;

    this.loadingBeneficiaries = true;
    this.cdr.detectChanges(); 

    this.accountService.getBeneficiaries(this.selectedAccountId).subscribe({
      next: (res: any) => {
        this.beneficiaries = res.data || [];
        this.loadingBeneficiaries = false;
        this.cdr.detectChanges(); 
      },
      error: () => {
        this.loadingBeneficiaries = false;
        this.cdr.detectChanges(); 
        this.popupService.error('Error', 'Failed to load beneficiaries.');
      }
    });
  }

  confirmDelete(beneficiaryId: number, name: string) {
    this.popupService.confirm(
      'Remove Beneficiary',
      `Are you sure you want to remove "${name}" from your beneficiaries?`,
      () => this.deleteBeneficiary(beneficiaryId)
    );
  }

  deleteBeneficiary(beneficiaryId: number) {
    if (!this.selectedAccountId) return;

    this.accountService.deleteBeneficiary(this.selectedAccountId, beneficiaryId).subscribe({
      next: () => {
        this.popupService.success(
          'Removed',
          'Beneficiary removed successfully.',
          () => this.loadBeneficiaries()
        );
      },
      error: (err: any) => {
        this.popupService.error('Error', err?.error?.message || 'Failed to remove beneficiary.');
      }
    });
  }
}
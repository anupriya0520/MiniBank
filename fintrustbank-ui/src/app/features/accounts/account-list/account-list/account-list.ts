import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountService } from '../../../../core/services/account';
import { PopupService } from '../../../../core/services/popup';
import { PopupComponent } from '../../../../shared/components/popup/popup';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule, RouterModule, PopupComponent, FormsModule],
  templateUrl: './account-list.html',
  styleUrls: ['./account-list.css']
})
export class AccountListComponent implements OnInit {
  accountService = inject(AccountService);
  popupService   = inject(PopupService);

  accounts: any[]       = [];
  loading               = true;
  hasPin                = false;
  pinPopupVisible       = false;
  enteredPin            = '';
  selectedAccount: any  = null;
  hasDeactivatedAccount = false; // AccountStatus.Deactivated = 4

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadAccounts(); }

  viewBalance(account: any) {
    this.selectedAccount = account;
    this.enteredPin = '';
    this.pinPopupVisible = true;
  }

  confirmPin(pin: string) {
    if (!pin) { this.popupService.error('Error', 'PIN is required'); return; }

    this.accountService.viewBalance(this.selectedAccount.id, pin).subscribe({
      next: (res: any) => {
        this.selectedAccount.balance     = res.data;
        this.selectedAccount.showBalance = true;
        this.pinPopupVisible = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.pinPopupVisible = false;
        this.popupService.error('Error', 'Invalid PIN');
      }
    });
  }

  loadAccounts() {
    this.loading = true;
    this.cdr.detectChanges();

    this.accountService.getMyAccounts().subscribe({
      next: (res: any) => {
        this.accounts = res?.data || [];
        this.hasPin   = this.accounts.some(a => a?.hasTransferPin === true);
        // AccountStatus.Deactivated = 4
        this.hasDeactivatedAccount = this.accounts.some((a: any) => a.status === 4);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.popupService.error('Error', 'Failed to load accounts.');
      }
    });
  }

  getStatusLabel(status: number): string {
    const map: any = { 1: 'Pending Activation', 2: 'Active', 3: 'Inactive', 4: 'Deactivated' };
    return map[status] || 'Unknown';
  }

  getStatusClass(status: number): string {
    const map: any = { 1: 'badge-warning', 2: 'badge-success', 3: 'badge-muted', 4: 'badge-danger' };
    return map[status] || 'badge-muted';
  }

  getAccountTypeLabel(type: number): string {
    const map: any = { 1: 'Savings', 2: 'Current', 3: 'Fixed Deposit' };
    return map[type] || 'Unknown';
  }

  getOtherAccountType(): number {
    const hasSavings = this.accounts.some(a => a.accountType === 1);
    const hasCurrent = this.accounts.some(a => a.accountType === 2);
    if (hasCurrent && !hasSavings) return 1;
    if (hasSavings && !hasCurrent) return 2;
    return 1;
  }

  getOtherAccountLabel(): string {
    const type = this.getOtherAccountType();
    if (type === 1) return 'Savings';
    if (type === 2) return 'Current';
    return 'Account';
  }

  createOtherAccount() {
    const accountType = this.getOtherAccountType();
    this.accountService.createAccount({ accountType }).subscribe({
      next: () => {
        this.popupService.success('Success', 'Account created successfully');
        this.loadAccounts();
      },
      error: () => { this.popupService.error('Error', 'Failed to create account'); }
    });
  }
}
import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction';
import { AccountService } from '../../../core/services/account';
import { PopupService } from '../../../core/services/popup';

@Component({
  selector: 'app-withdraw',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './withdraw.html',
  styleUrl: './withdraw.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WithdrawComponent implements OnInit {
  fb                 = inject(FormBuilder);
  transactionService = inject(TransactionService);
  accountService     = inject(AccountService);
  popupService       = inject(PopupService);
  router             = inject(Router);
  cdr                = inject(ChangeDetectorRef);

  withdrawForm!: FormGroup;
  accounts: any[]  = [];
  loading          = false;
  loadingAccounts  = true;
  showPin          = false;
  hasDeactivatedAccount=false;

  ngOnInit() {
    this.withdrawForm = this.fb.group({
      accountId:   ['', Validators.required],
      amount:      ['', [Validators.required, Validators.min(1)]],
      transferPin: ['', Validators.required],
      description: ['']
    });

    this.accountService.getMyAccounts().subscribe({
      next: (res: any) => {
        const all = res.data || [];
        // Show active accounts only (status=2) — deactivated/inactive cannot withdraw
        // Backend also blocks it but we filter here for clean UX
        this.accounts = all.filter((a: any) => a.status === 2);
        this.hasDeactivatedAccount=all.some((a:any)=>a.status===4);
        this.loadingAccounts = false;
        if (this.accounts.length > 0) {
          this.withdrawForm.patchValue({ accountId: this.accounts[0].id });
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingAccounts = false;
        this.cdr.markForCheck();
        this.popupService.error('Error', 'Failed to load accounts.');
      }
    });
  }

  getAccountTypeLabel(type: number): string {
    const map: any = { 1: 'Savings', 2: 'Current', 3: 'Fixed Deposit' };
    return map[type] || 'Unknown';
  }

  get accountId()   { return this.withdrawForm.get('accountId'); }
  get amount()      { return this.withdrawForm.get('amount'); }
  get transferPin() { return this.withdrawForm.get('transferPin'); }

  trackById(index: number, item: any): number { return item.id ?? index; }

  getSelectedAccount(): any {
    return this.accounts.find(a => a.id === +this.withdrawForm.value.accountId);
  }

  onSubmit() {
    if (this.withdrawForm.invalid) { this.withdrawForm.markAllAsTouched(); return; }

    const { accountId, amount, transferPin, description } = this.withdrawForm.value;
    const account = this.getSelectedAccount();

    if (account && +amount > account.balance) {
      this.popupService.error('Insufficient Balance',
        `Your balance is ₹${account.balance}. You cannot withdraw ₹${amount}.`);
      return;
    }

    this.popupService.confirm(
      'Confirm Withdrawal',
      `Are you sure you want to withdraw ₹${amount} from account ${account?.accountNumber}?`,
      () => {
        this.loading = true;
        this.cdr.markForCheck();
        this.transactionService.withdraw(accountId, { amount: +amount, transferPin, description }).subscribe({
          next: (res: any) => {
            this.loading = false;
            this.cdr.markForCheck();
            this.popupService.success(
              'Withdrawal Successful',
              `₹${amount} withdrawn. Remaining balance: ₹${res.data.balanceAfter}`,
              () => this.router.navigate(['/transactions/history'])
            );
          },
          error: (err: any) => {
            this.loading = false;
            this.cdr.markForCheck();
            this.popupService.error('Withdrawal Failed', err?.error?.message || 'Something went wrong.');
          }
        });
      }
    );
  }
}
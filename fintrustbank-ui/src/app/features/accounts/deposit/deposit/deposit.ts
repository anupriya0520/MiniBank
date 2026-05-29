import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AccountService } from '../../../../core/services/account';
import { PopupService } from '../../../../core/services/popup';
import { TransactionService } from '../../../../core/services/transaction';

@Component({
  selector: 'app-deposit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './deposit.html',
  styleUrl: './deposit.css'
})
export class DepositComponent implements OnInit {
  fb = inject(FormBuilder);
  accountService = inject(AccountService);
  popupService = inject(PopupService);
  transactionService = inject(TransactionService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  constructor(private cdr: ChangeDetectorRef) {}

  depositForm!: FormGroup;
  accounts: any[] = [];
  loading = false;
  loadingAccounts = true;

  ngOnInit() {
    this.depositForm = this.fb.group({
      accountId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      description: ['']
    });

    this.accountService.getMyAccounts().subscribe({
      next: (res: any) => {
        this.accounts = res.data || [];
        this.loadingAccounts = false;
        this.cdr.detectChanges(); 

        const accountId = this.route.snapshot.queryParams['accountId'];
        if (accountId) {
          this.depositForm.patchValue({ accountId });
        } else if (this.accounts.length > 0) {
          this.depositForm.patchValue({ accountId: this.accounts[0].id });
        }

        this.cdr.detectChanges(); 
      },
      error: () => {
        this.loadingAccounts = false;
        this.popupService.error('Error', 'Failed to load accounts.');
        this.cdr.detectChanges(); 
      }
    });
  }

  getAccountTypeLabel(type: number): string {
    const map: any = {
      1: 'Savings',
      2: 'Current',
      3: 'Fixed Deposit'
    };
    return map[type] || 'Account';
  }

  get accountId() { return this.depositForm.get('accountId'); }
  get amount() { return this.depositForm.get('amount'); }

  onSubmit() {
    if (this.depositForm.invalid) {
      this.depositForm.markAllAsTouched();
      return;
    }

    const { accountId, amount, description } = this.depositForm.value;

    this.popupService.confirm(
      'Confirm Deposit',
      `Are you sure you want to deposit ₹${amount} into the selected account?`,
      () => {
        this.loading = true;
        this.cdr.detectChanges(); 

        this.transactionService.deposit(accountId, { amount: +amount, description }).subscribe({
          next: (res: any) => {
            this.loading = false;
            this.cdr.detectChanges(); 

            this.popupService.success(
              'Deposit Successful',
              `₹${amount} has been deposited Successfully.`,
              () => this.router.navigate(['/accounts'])
            );
          },
          error: (err: any) => {
            this.loading = false;
            this.cdr.detectChanges(); 
            this.popupService.error('Deposit Failed', err?.error?.message || 'Something went wrong.');
          }
        });
      }
    );
  }
}
import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction';
import { AccountService } from '../../../core/services/account';
import { PopupService } from '../../../core/services/popup';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './transfer.html',
  styleUrls: ['./transfer.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferComponent implements OnInit {
  fb                 = inject(FormBuilder);
  transactionService = inject(TransactionService);
  accountService     = inject(AccountService);
  popupService       = inject(PopupService);
  router             = inject(Router);
  cdr                = inject(ChangeDetectorRef);

  accounts: any[]   = [];
  beneficiaries: any[] = [];
  loading               = false;
  loadingAccounts       = true;
  showPin               = false;
  isExternalTransfer    = false;
  activeTab: 'account' | 'phone' | 'beneficiary' = 'account';

  accountForm!: FormGroup;
  phoneForm!:   FormGroup;
  beneficiaryForm!: FormGroup;
  hasDeactivatedAccount=false;

  ngOnInit() {
    this.accountForm = this.fb.group({
      accountId:             ['', Validators.required],
      receiverAccountNumber: ['', Validators.required],
      ifscCode:              [''],
      receiverBankName:      [''],
      amount:                ['', [Validators.required, Validators.min(1)]],
      transferPin:           ['', Validators.required],
      description:           ['']
    });

    this.phoneForm = this.fb.group({
      accountId:     ['', Validators.required],
      receiverPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      amount:        ['', [Validators.required, Validators.min(1)]],
      transferPin:   ['', Validators.required],
      description:   ['']
    });

    this.beneficiaryForm = this.fb.group({
      accountId:     ['', Validators.required],
      beneficiaryId: ['', Validators.required],
      amount:        ['', [Validators.required, Validators.min(1)]],
      transferPin:   ['', Validators.required],
      description:   ['']
    });

    this.accountService.getMyAccounts().subscribe({
      next: (res: any) => {
        const all = (res?.data || []).map((a: any) => ({
          ...a,
          isTransferEnabled: a.isTransferEnabled ?? a.IsTransferEnabled ?? false
        }));
        // Only Active (status=2) accounts with transfer enabled
        // Deactivated accounts cannot transfer — backend blocks it anyway
        this.accounts = all.filter((a: any) => a.status === 2 && a.isTransferEnabled);
        this.hasDeactivatedAccount=all.some((a:any)=>a.status===4);
        this.loadingAccounts = false;

        if (this.accounts.length > 0) {
          const id = this.accounts[0].id;
          this.accountForm.patchValue({ accountId: id });
          this.phoneForm.patchValue({ accountId: id });
          this.beneficiaryForm.patchValue({ accountId: id });
          this.loadBeneficiaries(id);
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

  loadBeneficiaries(accountId: number) {
    this.accountService.getBeneficiaries(accountId).subscribe({
      next: (res: any) => { this.beneficiaries = res.data || []; this.cdr.markForCheck(); },
      error: () => { this.beneficiaries = []; this.cdr.markForCheck(); }
    });
  }

  onAccountChange(event: any) {
    const id = +event.target.value;
    this.accountForm.patchValue({ accountId: id });
    this.phoneForm.patchValue({ accountId: id });
    this.beneficiaryForm.patchValue({ accountId: id });
    this.loadBeneficiaries(id);
  }

  onExternalToggle(event: any) {
    this.isExternalTransfer = event.target.checked;
    if (!this.isExternalTransfer) {
      this.accountForm.patchValue({ ifscCode: '', receiverBankName: '' });
    }
    this.cdr.markForCheck();
  }

  switchTab(tab: 'account' | 'phone' | 'beneficiary') {
    this.activeTab = tab;
    this.isExternalTransfer = false;
    this.accountForm.patchValue({ ifscCode: '', receiverBankName: '' });
  }

  trackById(index: number, item: any): number { return item.id ?? index; }

  getSelectedAccount(form: FormGroup): any {
    return this.accounts.find(a => a.id === +form.value.accountId);
  }

  submitTransfer(type: 'account' | 'phone' | 'beneficiary') {
    const form: FormGroup =
      type === 'account' ? this.accountForm :
      type === 'phone'   ? this.phoneForm   : this.beneficiaryForm;

    if (form.invalid) { form.markAllAsTouched(); return; }

    const amount  = +form.value.amount;
    const account = this.getSelectedAccount(form);

    if (account && amount > account.balance) {
      this.popupService.error('Insufficient Balance', `Your balance is ₹${account.balance}.`);
      return;
    }

    this.popupService.confirm(
      'Confirm Transfer',
      `Transfer ₹${amount} from account ${account?.accountNumber}?`,
      () => {
        this.loading = true;
        this.cdr.markForCheck();
        const accountId = form.value.accountId;
        const { transferPin, description } = form.value;

        const req$ =
          type === 'account'
            ? this.transactionService.transferToAccount(accountId, {
                receiverAccountNumber: form.value.receiverAccountNumber,
                ifscCode:         form.value.ifscCode || null,
                receiverBankName: form.value.receiverBankName || null,
                amount, transferPin, description
              })
            : type === 'phone'
            ? this.transactionService.transferToPhone(accountId, {
                receiverPhone: form.value.receiverPhone,
                amount, transferPin, description
              })
            : this.transactionService.transferToBeneficiary(accountId, {
                beneficiaryId: +form.value.beneficiaryId,
                amount, transferPin, description
              });

        req$.subscribe({
          next: (res: any) => {
            this.loading = false;
            this.cdr.markForCheck();
            this.popupService.success(
              'Transfer Successful',
              `₹${amount} transferred successfully. Remaining balance: ₹${res.data.balanceAfter}`,
              () => this.router.navigate(['/transactions/history'])
            );
          },
          error: (err: any) => {
            this.loading = false;
            this.cdr.markForCheck();
            this.popupService.error('Transfer Failed', err?.error?.message || 'Something went wrong.');
          }
        });
      }
    );
  }
}
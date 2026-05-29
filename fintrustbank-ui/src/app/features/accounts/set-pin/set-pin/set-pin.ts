// src/app/features/accounts/set-pin/set-pin.component.ts
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from '../../../../core/services/account';
import { PopupService } from '../../../../core/services/popup';

@Component({
  selector: 'app-set-pin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './set-pin.html',
  styleUrls: ['./set-pin.css'] 
})
export class SetPinComponent implements OnInit {
  fb = inject(FormBuilder);
  accountService = inject(AccountService);
  popupService = inject(PopupService);
  router = inject(Router);

  constructor(private cdr: ChangeDetectorRef) {}

  setPinForm!: FormGroup;
  updatePinForm!: FormGroup;

  accounts: any[] = [];

  loading = false;
  loadingAccounts = true;

  // ✅ Global flags based on ALL accounts
  hasPin = false;            // true if ANY account has transfer enabled
  hasActiveAccount = false;  // true if ANY account is Active (status === 2)
  goBack(){
  this.router.navigate(['/accounts']);
}
  ngOnInit() {
    this.setPinForm = this.fb.group({
      accountId: ['', Validators.required],
      pin: ['', [Validators.required, Validators.pattern(/^\d{4,6}$/)]]
    });

    this.updatePinForm = this.fb.group({
      accountId: ['', Validators.required],
      // ✅ Enforce 4–6 digit numeric for oldPin as well
      oldPin: ['', [Validators.required, Validators.pattern(/^\d{4,6}$/)]],
      newPin: ['', [Validators.required, Validators.pattern(/^\d{4,6}$/)]]
    });

    this.loadAccounts();
  }

  loadAccounts() {
    this.accountService.getMyAccounts().subscribe({
      next: (res: any) => {
        this.accounts = res?.data || [];
        this.loadingAccounts = false;

        // ✅ Compute global flags
        this.hasPin = this.accounts.some(a => a?.isTransferEnabled === true);
        this.hasActiveAccount = this.accounts.some(a => a?.status === 2); // 2 = Active

        // Default select first account (safe)
        if (this.accounts.length > 0) {
          const first = this.accounts[0];
          this.setPinForm.patchValue({ accountId: first.id });
          this.updatePinForm.patchValue({ accountId: first.id });
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingAccounts = false;
        this.cdr.detectChanges();

        this.popupService.error('Error', 'Failed to load accounts.');
      }
    });
  }

  onSetPin() {
    if (this.setPinForm.invalid) {
      this.setPinForm.markAllAsTouched();
      return;
    }

    // ✅ Step 3: Frontend guard to match backend rule
    if (!this.hasActiveAccount) {
      this.popupService.error(
        'Not Allowed',
        'You must have at least one ACTIVE account before setting a transfer PIN.'
      );
      return;
    }

    const { accountId, pin } = this.setPinForm.value;

    this.loading = true;
    this.cdr.detectChanges();

    this.accountService.setTransferPin(accountId, { pin }).subscribe({
      next: () => {
        this.loading = false;

        // ✅ Reload accounts so UI reflects global enablement
        this.loadAccounts();

        this.cdr.detectChanges();
        this.popupService.success(
          'PIN Set Successfully',
          'Your transfer PIN has been set successfully.'
        );
      },
      error: (err: any) => {
        this.loading = false;
        this.cdr.detectChanges();

        this.popupService.error(
          'Failed',
          err?.error?.message || 'Could not set PIN.'
        );
      }
    });
  }

  onUpdatePin() {
    if (this.updatePinForm.invalid) {
      this.updatePinForm.markAllAsTouched();
      return;
    }

    const { accountId, oldPin, newPin } = this.updatePinForm.value;

    this.loading = true;
    this.cdr.detectChanges();

    this.accountService.updateTransferPin(accountId, { oldPin, newPin }).subscribe({
      next: () => {
        this.loading = false;

        // ✅ Reload accounts to reflect any state changes
        this.loadAccounts();

        this.cdr.detectChanges();
        this.popupService.success(
          'PIN Updated',
          'Your transfer PIN has been updated successfully.'
        );
      },
      error: (err: any) => {
        this.loading = false;
        this.cdr.detectChanges();

        this.popupService.error(
          'Failed',
          err?.error?.message || 'Could not update PIN.'
        );
      }
    });
  }
}

import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from '../../../core/services/account';
import { PopupService } from '../../../core/services/popup';

@Component({
  selector: 'app-add-beneficiary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-beneficiary.html',
  styleUrl: './add-beneficiary.css'
})
export class AddBeneficiaryComponent implements OnInit {

  fb = inject(FormBuilder);
  accountService = inject(AccountService);
  popupService = inject(PopupService);
  router = inject(Router);

  constructor(private cdr: ChangeDetectorRef) {}

  beneficiaryForm!: FormGroup;
  accounts: any[] = [];
  loading = false;
  loadingAccounts = true;
  isExternalBank = false; // ← ADDED: tracks if beneficiary is from another bank

  ngOnInit() {
    this.beneficiaryForm = this.fb.group({
      accountId:     ['', Validators.required],
      name:          ['', [Validators.required, Validators.maxLength(100)]],
      accountNumber: ['', [Validators.required, Validators.maxLength(20)]],
      phone:         ['', Validators.pattern(/^\d{10}$/)],
      nickname:      ['', Validators.maxLength(100)],
      ifscCode:      [''],   // ← ADDED: optional — filled = external bank
      bankName:      ['']    // ← ADDED: optional bank display name
    });

    this.accountService.getMyAccounts().subscribe({
      next: (res: any) => {
        this.accounts = res.data || [];
        this.loadingAccounts = false;
        this.cdr.detectChanges();

        if (this.accounts.length > 0) {
          this.beneficiaryForm.patchValue({ accountId: this.accounts[0].id });
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.loadingAccounts = false;
        this.cdr.detectChanges();
        this.popupService.error('Error', 'Failed to load accounts.');
      }
    });
  }

  get name()          { return this.beneficiaryForm.get('name'); }
  get accountNumber() { return this.beneficiaryForm.get('accountNumber'); }
  get phone()         { return this.beneficiaryForm.get('phone'); }

  // ← ADDED: toggle external bank fields
  onExternalToggle(event: any) {
    this.isExternalBank = event.target.checked;
    if (!this.isExternalBank) {
      this.beneficiaryForm.patchValue({ ifscCode: '', bankName: '' });
    }
    this.cdr.detectChanges();
  }

  onSubmit() {
    if (this.beneficiaryForm.invalid) {
      this.beneficiaryForm.markAllAsTouched();
      return;
    }

    const { accountId, name, accountNumber, phone, nickname, ifscCode, bankName } = this.beneficiaryForm.value;
    this.loading = true;
    this.cdr.detectChanges();

    this.accountService.addBeneficiary(accountId, {
      name,
      accountNumber,
      phone,
      nickname,
      ifscCode: ifscCode || null,     // ← ADDED
      bankName: bankName || null      // ← ADDED
    }).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.detectChanges();

        this.popupService.success(
          'Beneficiary Added',
          `${name} has been added to your beneficiaries.`,
          () => this.router.navigate(['/beneficiaries'])
        );
      },
      error: (err: any) => {
        this.loading = false;
        this.cdr.detectChanges();
        this.popupService.error('Failed', err?.error?.message || 'Could not add beneficiary.');
      }
    });
  }
}
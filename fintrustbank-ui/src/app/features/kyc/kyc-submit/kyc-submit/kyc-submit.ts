import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { KycService } from '../../../../core/services/kyc';
import { PopupService } from '../../../../core/services/popup';

@Component({
  selector: 'app-kyc-submit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './kyc-submit.html',
  styleUrl: './kyc-submit.css'
})
export class KycSubmitComponent implements OnInit {

  fb = inject(FormBuilder);
  kycService = inject(KycService);
  popupService = inject(PopupService);
  router = inject(Router);

  constructor(private cdr: ChangeDetectorRef) {}   

  kycForm!: FormGroup;
  loading = false;
  selectedFile: File | null = null;
  fileError = '';
  existingKyc: any = null;
  checkingKyc = true;
  goBack(){
  this.router.navigate(['/accounts']);
}
  ngOnInit() {
    this.kycForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(150)]],
      dateOfBirth: ['', Validators.required],
      address: ['', [Validators.required, Validators.maxLength(300)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      aadharNumber: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
      requestedAccountType: ['', Validators.required]
    });

    this.kycService.getMyKyc().subscribe({
      next: (res: any) => {
        this.existingKyc = res.data;
        this.checkingKyc = false;
        this.cdr.detectChanges();  
      },
      error: () => {
        this.existingKyc = null;
        this.checkingKyc = false;
        this.cdr.detectChanges();  
      }
    });
  }

  get fullName()             { return this.kycForm.get('fullName'); }
  get dateOfBirth()          { return this.kycForm.get('dateOfBirth'); }
  get address()              { return this.kycForm.get('address'); }
  get phone()                { return this.kycForm.get('phone'); }
  get aadharNumber()         { return this.kycForm.get('aadharNumber'); }
  get requestedAccountType() { return this.kycForm.get('requestedAccountType'); }

  onFileChange(event: any) {
    const file = event.target.files[0];
    this.fileError = '';
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      this.fileError = 'Only JPG, PNG, or PDF files are allowed.';
      this.selectedFile = null;
      this.cdr.detectChanges();  
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.fileError = 'File size must not exceed 5MB.';
      this.selectedFile = null;
      this.cdr.detectChanges();  
      return;
    }

    this.selectedFile = file;
    this.cdr.detectChanges();    
  }

  onSubmit() {
    if (this.kycForm.invalid) {
      this.kycForm.markAllAsTouched();
      return;
    }

    if (!this.selectedFile) {
      this.fileError = 'Aadhaar document is required.';
      this.cdr.detectChanges();  
      return;
    }

    this.popupService.confirm(
      'Submit KYC',
      'Are you sure you want to submit your KYC documents for review?',
      () => {

        this.loading = true;
        this.cdr.detectChanges();  

        const formData = new FormData();
        const v = this.kycForm.value;
        formData.append('FullName', v.fullName);
        formData.append('DateOfBirth', v.dateOfBirth);
        formData.append('Address', v.address);
        formData.append('Phone', v.phone);
        formData.append('AadharNumber', v.aadharNumber);
        formData.append('RequestedAccountType', v.requestedAccountType);
        formData.append('AadharDocument', this.selectedFile!);

        this.kycService.submitKyc(formData).subscribe({
          next: () => {
            this.loading = false;
            this.cdr.detectChanges();  

            this.popupService.success(
              'KYC Submitted',
              'Your KYC documents have been submitted successfully. Awaiting admin review.',
              () => this.router.navigate(['/kyc/status'])
            );
          },
          error: (err: any) => {
            this.loading = false;
            this.cdr.detectChanges();  

            this.popupService.error(
              'Submission Failed',
              err?.error?.message || 'Could not submit KYC. Please try again.'
            );
          }
        });
      }
    );
  }
}
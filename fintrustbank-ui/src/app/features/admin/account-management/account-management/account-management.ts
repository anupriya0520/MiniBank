import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AdminService } from '../../../../core/services/admin';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { PopupComponent } from '../../../../shared/components/popup/popup';

interface AccountAdminDto {
  id: number;
  accountNumber: string;
  userName: string;
  email: string;
  accountType: number;
  status: number;
  balance: number;
  createdAt: string;
  flagCount: number;
}

@Component({
  selector: 'app-account-management',
  standalone: true,
  imports: [CommonModule, FormsModule, PopupComponent],
  templateUrl: './account-management.html',
  styleUrls: ['./account-management.css']
})
export class AccountManagementComponent implements OnInit, OnDestroy {

  accounts: AccountAdminDto[] = [];

  search = '';
  status: string | null = null;

  page = 1;
  pageSize = 10;
  totalCount = 0;

  popupVisible = false;
  popupType: 'success' | 'error' | 'warning' | 'confirm' = 'confirm';
  popupTitle = '';
  popupMessage = '';
  selectedAccount: AccountAdminDto | null = null;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.page = 1;
      this.loadAccounts();
    });

    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.search = params['search'];
      }
      this.loadAccounts();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(value: string) {
    this.search = value;
    this.searchSubject.next(value);
  }

  loadAccounts() {
    this.adminService.getAccounts(
      this.page,
      this.pageSize,
      this.search,
      this.status ?? undefined
    ).subscribe({
      next: (res: any) => {
        this.accounts = res.data.items;
        this.totalCount = res.data.totalCount;
        this.cdr.detectChanges();
      }
    });
  }

  getAccountStatus(status: number): string {
    switch (status) {
      case 1: return 'Pending';
      case 2: return 'Active';
      case 3: return 'Suspended';
      case 4: return 'Deactivated';
      default: return 'Unknown';
    }
  }

  getAccountType(type: number): string {
    switch (type) {
      case 1: return 'Savings';
      case 2: return 'Current';
      default: return 'Unknown';
    }
  }

  // ✅ opens popup instead of alert
  toggleAccount(account: AccountAdminDto) {
    this.selectedAccount = account;
    this.popupType = 'confirm';
    this.popupTitle = account.status === 2 ? 'Deactivate Account' : 'Activate Account';
    this.popupMessage = `Are you sure you want to ${account.status === 2 ? 'deactivate' : 'activate'} account ${account.accountNumber}?`;
    this.popupVisible = true;
  }

 confirmToggle(reason: string) {
  if (!this.selectedAccount) return;

  const isDeactivating = this.selectedAccount.status === 2;

  this.adminService.toggleAccount(this.selectedAccount.id, reason)
    .subscribe({
      next: () => {
        this.popupVisible = false;
        this.loadAccounts();

        setTimeout(() => {
          this.popupType = 'success';
          this.popupTitle = isDeactivating ? 'Account Deactivated' : 'Account Activated';
          this.popupMessage = isDeactivating
            ? 'Account has been deactivated successfully.'
            : 'Account has been activated successfully.';
          this.popupVisible = true;

          // ✅ Auto-close success popup after 3 seconds
          setTimeout(() => {
            this.popupVisible = false;
            this.cdr.detectChanges();
          }, 3000);

        }, 300);
        this.selectedAccount = null;
      },
      error: (err) => {
        console.error(err);
        this.popupVisible = false;

        setTimeout(() => {
          this.popupType = 'error';
          this.popupTitle = 'Error';
          this.popupMessage = err?.error?.message || 'Could not update account status.';
          this.popupVisible = true;

          //  Auto-close error popup after 3 seconds
          setTimeout(() => {
            this.popupVisible = false;
            this.cdr.detectChanges();
          }, 3000);

        }, 300);
        this.selectedAccount = null;
      }
    });
}
  cancelPopup() {
    this.popupVisible = false;
    this.selectedAccount = null;
  }

  filterStatus(status: string | null) {
    this.status = status;
    this.page = 1;
    this.loadAccounts();
  }

  clearFilters() {
    this.search = '';
    this.status = null;
    this.page = 1;
    this.loadAccounts();
  }
  nextPage() {
  this.page++;
  this.loadAccounts();
}

prevPage() {
  if (this.page > 1) {
    this.page--;
    this.loadAccounts();
  }
}
}
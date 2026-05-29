import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AdminService } from '../../../core/services/admin';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import{Router} from '@angular/router'
interface TransactionResponseDto {
  id: number;
  transactionNumber: string;
  type: number;
  status: number;
  amount: number;
  balanceAfter: number;
  accountNumber?: string;
  receiverAccountNumber?: string;
  receiverPhone?: string;
  description: string;
  isFlagged: boolean;
  flagReason?: string;
  createdAt: string;
}

@Component({
  selector: 'app-transaction-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-management.html',
  styleUrls: ['./transaction-management.css']
})
export class TransactionManagementComponent implements OnInit, OnDestroy {

  transactions: TransactionResponseDto[] = [];
  totalCount = 0;

  search = '';
  flagged: boolean | null = null;
  type: string = '';
  fromDate: string | null = null;
  toDate: string | null = null;

  page = 1;
  pageSize = 10;

  // ✅ Today's date in YYYY-MM-DD for HTML date input max attribute
  today = new Date().toISOString().split('T')[0];

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.page = 1;
      this.loadTransactions();
    });

    this.loadTransactions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(value: string) {
    this.search = value;
    this.searchSubject.next(value);
  }

  // ✅ Appending T00:00:00 forces local midnight — avoids UTC shift bug
  private parseLocalDate(dateStr: string): Date {
    return new Date(dateStr + 'T00:00:00');
  }

  loadTransactions() {
    this.adminService.getTransactions(
      this.page,
      this.pageSize,
      null,
      this.search
    ).subscribe((res: any) => {
      let data: TransactionResponseDto[] = res.data.items;

      // Flagged filter
      if (this.flagged !== null) {
        data = data.filter((t) => t.isFlagged === this.flagged);
      }

      // Type filter
      if (this.type === 'deposit') {
        data = data.filter((t) => t.type === 1);
      } else if (this.type === 'withdraw') {
        data = data.filter((t) => t.type === 2);
      } else if (this.type === 'transfer') {
        data = data.filter((t) => t.type === 3 || t.type === 4);
      }

      // ✅ Date filter — parsed as local time to avoid UTC off-by-one-day bug
      if (this.fromDate) {
        const from = this.parseLocalDate(this.fromDate);
        data = data.filter((t) => new Date(t.createdAt) >= from);
      }

      if (this.toDate) {
        const to = this.parseLocalDate(this.toDate);
        to.setHours(23, 59, 59, 999); // include full toDate day
        data = data.filter((t) => new Date(t.createdAt) <= to);
      }

      this.transactions = data;
      this.totalCount = data.length;
      this.cdr.detectChanges();
    });
  }

  onDateChange() {
    this.page = 1;
    this.loadTransactions();
  }

  filterType(type: string) {
    this.type = type;
    this.page = 1;
    this.loadTransactions();
  }
  viewAccount(txn: TransactionResponseDto) {
  this.router.navigate(['/admin/accounts'], {
    queryParams: { search: txn.accountNumber } // ✅ use accountNumber
  });
}
  filterFlagged() {
  this.flagged = true;
  this.page = 1;
  this.loadTransactions();
}

  clearFilters() {
    this.search = '';
    this.flagged = null;
    this.type = '';
    this.fromDate = null;
    this.toDate = null;
    this.page = 1;
    this.loadTransactions();
  }

  getTransactionType(type: number) {
    switch (type) {
      case 1: return 'Deposit';
      case 2: return 'Withdraw';
      case 3: return 'Transfer Out';
      case 4: return 'Transfer In';
      default: return 'Unknown';
    }
  }

  getTransactionStatus(status: number) {
    switch (status) {
      case 1: return 'Pending';
      case 2: return 'Completed';
      case 3: return 'Failed';
      case 4: return 'Flagged';
      default: return 'Unknown';
    }
  }
  nextPage() {
  this.page++;
  this.loadTransactions();
}

prevPage() {
  if (this.page > 1) {
    this.page--;
    this.loadTransactions();
  }
}
}
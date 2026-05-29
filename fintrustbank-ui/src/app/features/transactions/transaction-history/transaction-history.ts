// src/app/features/transactions/transaction-history/transaction-history.component.ts
import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { TransactionService } from '../../../core/services/transaction';
import { AccountService } from '../../../core/services/account';
import { PopupService } from '../../../core/services/popup';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './transaction-history.html',
  styleUrl: './transaction-history.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionHistoryComponent implements OnInit, OnDestroy {
  transactionService = inject(TransactionService);
  accountService     = inject(AccountService);
  popupService       = inject(PopupService);
  route              = inject(ActivatedRoute);
  cdr                = inject(ChangeDetectorRef);

  accounts: any[]          = [];
  transactions: any[]      = [];
  selectedAccountId: number | null = null;
  loading          = false;
  loadingAccounts  = true;
  page = 1;
pageSize = 10;
totalPages = 0;

  private accountChange$ = new Subject<number>();
  private destroy$       = new Subject<void>();

  ngOnInit() {
    this.accountChange$.pipe(
      switchMap(id => {
        this.loading = true;
        this.cdr.markForCheck();
return this.transactionService.getHistory(id, this.page, this.pageSize);     }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {

  const result = res.data;

  this.totalPages = result.totalPages;

  this.transactions = (result.items || []).map((tx: any) => ({
    ...tx,
    typeLabel: this.getTxTypeLabel(tx.type),
    typeClass: this.getTxTypeClass(tx.type),
    statusLabel: this.getTxStatusLabel(tx.status),
    statusClass: this.getTxStatusClass(tx.status),
    isCredit: tx.type === 1 || tx.type === 4
  }));

  this.loading = false;
  this.cdr.markForCheck();
},
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.popupService.error('Error', 'Failed to load transactions.');
      }
    });

    this.accountService.getMyAccounts().subscribe({
      next: (res: any) => {
        this.accounts        = res.data || [];
        this.loadingAccounts = false;

        const accountId = this.route.snapshot.queryParams['accountId'];
        this.selectedAccountId = accountId
          ? +accountId
          : this.accounts[0]?.id ?? null;

        if (this.selectedAccountId) {
          this.accountChange$.next(this.selectedAccountId);
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
  nextPage() {
  if (this.page < this.totalPages) {
    this.page++;
    if (this.selectedAccountId) {
      this.accountChange$.next(this.selectedAccountId);
    }
  }
}

prevPage() {
  if (this.page > 1) {
    this.page--;
    if (this.selectedAccountId) {
      this.accountChange$.next(this.selectedAccountId);
    }
  }
}
  getAccountTypeLabel(type: number): string {
    const map: any = {
      1: 'Savings',
      2: 'Current',
      3: 'Fixed Deposit'
    };
    return map[type] || 'Unknown';
  }
  onAccountChange(event: any) {
    this.selectedAccountId = +event.target.value;
this.page = 1;
this.accountChange$.next(this.selectedAccountId);
  }

  trackById(index: number, item: any): number {
    return item.id ?? index;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getTxTypeLabel(type: number): string {
    const map: any = { 1: 'Deposit', 2: 'Withdrawal', 3: 'Transfer Out', 4: 'Transfer In' };
    return map[type] || 'Unknown';
  }

  private getTxTypeClass(type: number): string {
    const map: any = { 1: 'badge-success', 2: 'badge-danger', 3: 'badge-warning', 4: 'badge-info' };
    return map[type] || 'badge-muted';
  }

  private getTxStatusLabel(status: number): string {
    const map: any = { 1: 'Pending', 2: 'Completed', 3: 'Failed', 4: 'Flagged' };
    return map[status] || 'Unknown';
  }

  private getTxStatusClass(status: number): string {
    const map: any = { 1: 'badge-warning', 2: 'badge-success', 3: 'badge-danger', 4: 'badge-danger' };
    return map[status] || 'badge-muted';
  }
}
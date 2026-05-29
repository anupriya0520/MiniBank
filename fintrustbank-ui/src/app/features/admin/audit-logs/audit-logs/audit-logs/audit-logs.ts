import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AdminService } from '../../../../../core/services/admin';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

interface AuditLogDto {
  id: number;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  createdAt: string;
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-logs.html',
  styleUrls: ['./audit-logs.css']
})
export class AuditLogsComponent implements OnInit, OnDestroy {

  logs: AuditLogDto[] = [];

  search = '';
  action = '';

  page = 1;
  pageSize = 10;
  totalCount = 0;
  loading = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // ✅ dynamic search
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.page = 1;
      this.loadLogs();
    });

    this.loadLogs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(value: string) {
    this.search = value;
    this.searchSubject.next(value);
  }

  // ✅ action dropdown change
  onActionChange() {
    this.page = 1;
    this.loadLogs();
  }

  loadLogs() {
    this.loading = true;
    this.adminService.getAuditLogs(
      this.page,
      this.pageSize,
      this.action,
      this.search
    ).subscribe({
      next: (res: any) => {
        this.logs = res.data.items;
        this.totalCount = res.data.totalCount;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  clearFilters() {
  this.search = '';
  this.action = '';
  this.page = 1;
  // ✅ flush debounce subject so pending search doesn't fire after clear
  this.searchSubject.next('');
  this.loadLogs();
}

  nextPage() {
    this.page++;
    this.loadLogs();
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadLogs();
    }
  }
}
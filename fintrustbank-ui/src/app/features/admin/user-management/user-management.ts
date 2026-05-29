import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AdminService } from '../../../core/services/admin';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PopupComponent } from '../../../shared/components/popup/popup';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

interface UserResponseDto {
  id: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  accountCount: number;
  kycStatus: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, PopupComponent],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagementComponent implements OnInit, OnDestroy {

  users: UserResponseDto[] = [];

  search = '';
  isActive: boolean | null = null;
  status: string = 'all';
  page = 1;
  pageSize = 10;
  totalCount = 0;

  popupType: 'success' | 'error' | 'warning' | 'confirm' = 'confirm';
  loading = false;
  popupVisible = false;
  popupTitle = '';
  popupMessage = '';
  selectedUser: any = null;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // ✅ Dynamic search — fires 400ms after user stops typing
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.page = 1;
      this.loadUsers();
    });

    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ Called on every keystroke
  onSearchInput(value: string) {
    this.search = value;
    this.searchSubject.next(value);
  }

  loadUsers() {
    this.loading = true;

    this.adminService.getUsers(
      this.page,
      this.pageSize,
      this.search,
      this.isActive
    ).subscribe({
      next: (res: any) => {
        this.users = res.data.items;
        this.totalCount = res.data.totalCount;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterStatus(value: string) {
    this.status = value;
    if (value === 'all') this.isActive = null;
    if (value === 'active') this.isActive = true;
    if (value === 'inactive') this.isActive = false;
    this.page = 1;
    this.loadUsers();
  }

  toggleUser(user: any) {
    this.selectedUser = user;
    this.popupType = 'confirm';
    this.popupTitle = user.isActive ? 'Deactivate User' : 'Activate User';
    this.popupMessage = `Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} ${user.fullName}?`;
    this.popupVisible = true;
  }

  confirmToggle(reason: string) {
    if (!this.selectedUser) return;

    this.adminService.toggleUser(this.selectedUser.id, reason)
      .subscribe({
        next: () => {
          this.loadUsers();
          this.popupVisible = false;
        },
        error: (err) => {
          console.error(err);
          this.popupVisible = false;
        }
      });
  }

  cancelPopup() {
    this.popupVisible = false;
  }

  clearFilters() {
    this.search = '';
    this.isActive = null;
    this.status = 'all';
    this.page = 1;
    this.loadUsers();
  }

  nextPage() {
    this.page++;
    this.loadUsers();
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadUsers();
    }
  }
}
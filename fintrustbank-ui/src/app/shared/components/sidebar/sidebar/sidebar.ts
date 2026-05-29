// src/app/shared/components/sidebar/sidebar.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { filter } from 'rxjs/operators';

interface NavItem {
  label: string;
  route: string;
  adminOnly?: boolean;
}

interface NavGroup {
  group: string;
  adminOnly?: boolean;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);

  isAdmin = false;
  currentRoute = '';

  navGroups: NavGroup[] = [
    {
      group: 'Main',
      items: [
        { label: 'Dashboard', route: '/dashboard' }
      ]
    },
    {
      group: 'Accounts',
      items: [
        { label: 'My Accounts', route: '/accounts' },
        
      ]
    },

    {
      group: 'Transactions',
      items: [
        { label: 'Transaction History', route: '/transactions/history' },
        { label: 'Deposit', route: '/accounts/deposit' },
        { label: 'Withdraw', route: '/transactions/withdraw' },
        { label: 'Transfer', route: '/transactions/transfer' }
      ]
    },
    {
      group: 'Beneficiaries',
      items: [
        { label: 'My Beneficiaries', route: '/beneficiaries' },
        { label: 'Add Beneficiary', route: '/beneficiaries/add' }
      ]
    },
    {
  group: 'Admin Panel',
  adminOnly: true,
  items: [
    { label: 'Admin Dashboard',    route: '/admin/dashboard' },
    { label: 'KYC Management',     route: '/admin/kyc' },
    { label: 'User Management',    route: '/admin/users' },
    { label: 'Account Management', route: '/admin/accounts' },
    { label: 'Transaction Monitoring', route: '/admin/transactions' },
    { label: 'Audit Logs',         route: '/admin/audit-logs' }
  ]
}
  ];

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    this.currentRoute = this.router.url;

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.currentRoute = e.urlAfterRedirects;
      });
  }

  isActive(route: string): boolean {
    return this.currentRoute === route;
  }

  visibleGroups(): NavGroup[] {
  return this.isAdmin
    ? this.navGroups.filter(g => g.adminOnly)    
    : this.navGroups.filter(g => !g.adminOnly);    
}
}
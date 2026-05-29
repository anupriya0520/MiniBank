import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';
import { LayoutComponent } from './shared/components/layout/layout/layout';
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register/register').then(m => m.RegisterComponent)
  },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    data: { roles: ['User'] },
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard/dashboard').then(m => m.DashboardComponent) },
      { path: 'accounts', loadComponent: () => import('./features/accounts/account-list/account-list/account-list').then(m => m.AccountListComponent) },
      { path: 'accounts/deposit', loadComponent: () => import('./features/accounts/deposit/deposit/deposit').then(m => m.DepositComponent) },
      { path: 'accounts/set-pin', loadComponent: () => import('./features/accounts/set-pin/set-pin/set-pin').then(m => m.SetPinComponent) },
      { path: 'kyc/submit', loadComponent: () => import('./features/kyc/kyc-submit/kyc-submit/kyc-submit').then(m => m.KycSubmitComponent) },
      { path: 'kyc/status', loadComponent: () => import('./features/kyc/kyc-status/kyc-status/kyc-status').then(m => m.KycStatusComponent) },
      { path: 'transactions/history', loadComponent: () => import('./features/transactions/transaction-history/transaction-history').then(m => m.TransactionHistoryComponent) },
      { path: 'transactions/withdraw', loadComponent: () => import('./features/transactions/withdraw/withdraw').then(m => m.WithdrawComponent) },
      { path: 'transactions/transfer', loadComponent: () => import('./features/transactions/transfer/transfer').then(m => m.TransferComponent) },
      { path: 'beneficiaries', loadComponent: () => import('./features/beneficiaries/beneficiary-list/beneficiary-list').then(m => m.BeneficiaryListComponent) },
      { path: 'beneficiaries/add', loadComponent: () => import('./features/beneficiaries/add-beneficiary/add-beneficiary').then(m => m.AddBeneficiaryComponent) },
    ]
  },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard], 
    children: [
      { path: 'admin/dashboard', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent) },
      { path: 'admin/kyc',       canActivate: [adminGuard], loadComponent: () => import('./features/admin/kyc-management/kyc-management/kyc-management').then(m => m.KycManagementComponent) },
      
{
      path: 'admin/users',
      canActivate: [adminGuard],
      loadComponent: () =>
        import('./features/admin/user-management/user-management')
          .then(m => m.UserManagementComponent)
    },
    {
  path: 'admin/accounts',
  loadComponent: () =>
    import('./features/admin/account-management/account-management/account-management')
      .then(m => m.AccountManagementComponent)
},

{
  path: 'admin/transactions',
  loadComponent: () =>
    import('./features/admin/transaction-management/transaction-management')
      .then(m => m.TransactionManagementComponent)
},



      { path: 'admin/audit-logs',   canActivate: [adminGuard], 
        loadComponent: () => import('./features/admin/audit-logs/audit-logs/audit-logs/audit-logs').then(m => m.AuditLogsComponent) }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
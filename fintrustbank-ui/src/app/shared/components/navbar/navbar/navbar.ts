// src/app/shared/components/navbar/navbar.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { PopupService } from '../../../../core/services/popup';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);
  popupService = inject(PopupService);
  router = inject(Router);

  user: any = null;

  ngOnInit() {
    this.user = this.authService.getUser();
  }

  onLogout() {
    this.popupService.confirm(
      'Logout',
      'Are you sure you want to logout?',
      () => {
        this.authService.logout();
      }
    );
  }
}
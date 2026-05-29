import { Component } from '@angular/core'; 
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PopupComponent } from './shared/components/popup/popup';
import { PopupService } from './core/services/popup';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, PopupComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  constructor(public popupService: PopupService) {}
}
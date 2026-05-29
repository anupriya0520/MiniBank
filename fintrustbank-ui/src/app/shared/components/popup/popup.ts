// src/app/shared/components/popup/popup.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './popup.html',
  styleUrl: './popup.css'
})
export class PopupComponent {
  @Input() visible:     boolean = false;
  @Input() type:        'success' | 'error' | 'warning' | 'confirm' = 'success';
  @Input() title:       string = '';
  @Input() message:     string = '';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText:  string = 'Cancel';
  @Input() showCancel:  boolean = false;
  @Input() showInput: boolean = false;
@Input() inputType: string = 'text';
@Input() inputPlaceholder: string = '';
inputValue: string = '';

  @Output() onConfirm = new EventEmitter<string>();
  @Output() onCancel  = new EventEmitter<void>();
  @Output() onClose   = new EventEmitter<void>();

  
 close() {
    this.inputValue = '';      
    this.onClose.emit();
  }

   confirm() {
    this.onConfirm.emit(this.inputValue);
    this.inputValue = '';      
  }

  cancel() {
    this.inputValue = '';       
    this.onCancel.emit();
  }
}
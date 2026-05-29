import { Injectable, signal } from '@angular/core';

export interface PopupConfig {
  type: 'success' | 'error' | 'warning' | 'confirm';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({ providedIn: 'root' })
export class PopupService {
  visible = signal(false);
  config = signal<PopupConfig>({
    type: 'success',
    title: '',
    message: ''
  });

  show(cfg: PopupConfig) {
    this.config.set({
      confirmText: 'OK',
      cancelText: 'Cancel',
      showCancel: false,
      ...cfg
    });
    this.visible.set(true);
  }

  success(title: string, message: string, onConfirm?: () => void) {
    this.show({ type: 'success', title, message, confirmText: 'OK', onConfirm });
  }

  error(title: string, message: string) {
    this.show({ type: 'error', title, message, confirmText: 'OK' });
  }

  warning(title: string, message: string) {
    this.show({ type: 'warning', title, message, confirmText: 'OK' });
  }

  confirm(title: string, message: string, onConfirm: () => void, onCancel?: () => void) {
    this.show({
      type: 'confirm',
      title,
      message,
      confirmText: 'Yes, Confirm',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm,
      onCancel
    });
  }

  close() {
    this.visible.set(false);
  }
}
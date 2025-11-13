import { Injectable, TemplateRef } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/overlay';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationConfig {
  message: string;
  type?: NotificationType;
  duration?: number;
  action?: string;
  icon?: string;
  verticalPosition?: 'top' | 'bottom';
  horizontalPosition?: 'start' | 'center' | 'end' | 'left' | 'right';
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private defaultDuration = 5000;
  private loadingSubject = new Subject<boolean>();

  private successMessage = new BehaviorSubject<string>('');
  private errorMessage = new BehaviorSubject<string>('');

  currentSuccessMessage = this.successMessage.asObservable();
  currentErrorMessage = this.errorMessage.asObservable();

  constructor(private snackBar: MatSnackBar, private dialog: MatDialog) {}
  setSuccessMessage(message: string) {
    this.successMessage.next(message);
  }

  clearSuccessMessage() {
    this.successMessage.next('');
  }

  setErrorMessage(message: string) {
    this.errorMessage.next(message);
  }

  clearErrorMessage() {
    this.errorMessage.next('');
  }

  clearAllMessages() {
    this.successMessage.next('');
    this.errorMessage.next('');
  }

  show(config: NotificationConfig): void {
    const {
      message,
      type = 'info',
      duration = this.defaultDuration,
      action = 'OK',
      verticalPosition = 'top',
      horizontalPosition = 'center',
    } = config;

    const panelClass = `notification-${type}`;

    this.snackBar.open(message, action, {
      duration,
      panelClass: [panelClass, 'notification'],
      verticalPosition,
      horizontalPosition,
    });
  }

  success(
    message: string,
    config?: Omit<NotificationConfig, 'message' | 'type'>
  ): void {
    this.show({
      message,
      type: 'success',
      icon: 'check_circle',
      ...config,
    });
  }

  error(
    message: string,
    config?: Omit<NotificationConfig, 'message' | 'type'>
  ): void {
    this.show({
      message,
      type: 'error',
      icon: 'error',
      ...config,
    });
  }

  info(
    message: string,
    config?: Omit<NotificationConfig, 'message' | 'type'>
  ): void {
    this.show({
      message,
      type: 'info',
      icon: 'info',
      ...config,
    });
  }

  warning(
    message: string,
    config?: Omit<NotificationConfig, 'message' | 'type'>
  ): void {
    this.show({
      message,
      type: 'warning',
      icon: 'warning',
      ...config,
    });
  }

  showLoading(show: boolean = true): void {
    this.loadingSubject.next(show);
  }

  getLoadingState(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  openDialog<T, D = any, R = any>(
    component: ComponentType<T> | TemplateRef<T>,
    config?: any
  ): MatDialogRef<T, R> {
    return this.dialog.open(component, {
      width: '500px',
      panelClass: 'custom-dialog',
      autoFocus: false,
      ...config,
    });
  }

  confirm(
    title: string,
    message: string,
    confirmText: string = 'Confirmer',
    cancelText: string = 'Annuler',
    isDangerous: boolean = false,
    icon?: string
  ): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      disableClose: true,
      data: {
        title,
        message,
        confirmText,
        cancelText,
        isDangerous,
        icon,
      },
    });

    return dialogRef.afterClosed();
  }

  showCustomNotification<T>(
    component: ComponentType<T>,
    config: MatSnackBarConfig = {}
  ): MatSnackBarRef<T> {
    return this.snackBar.openFromComponent(component, {
      duration: this.defaultDuration,
      panelClass: ['custom-notification'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
      ...config,
    });
  }

  triggerAnimation(element: HTMLElement, animation: string): void {
    element.classList.add('animate__animated', `animate__${animation}`);

    const handleAnimationEnd = () => {
      element.classList.remove('animate__animated', `animate__${animation}`);
      element.removeEventListener('animationend', handleAnimationEnd);
    };

    element.addEventListener('animationend', handleAnimationEnd);
  }

  showSuccessAnimation(element: HTMLElement): void {
    this.triggerAnimation(element, 'tada');
  }

  showErrorAnimation(element: HTMLElement): void {
    this.triggerAnimation(element, 'shakeX');
  }

  showLoadingAnimation(element: HTMLElement): void {
    this.triggerAnimation(element, 'pulse');
  }
}

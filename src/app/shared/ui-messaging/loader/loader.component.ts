import { AsyncPipe, NgStyle } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from '@app/shared/ui-messaging/loader/loading.service';

@Component({
  selector: 'app-loader',
  template: `<mat-progress-bar
    [ngStyle]="{
      visibility: loadingService.loading() ? 'visible' : 'hidden'
    }"
    mode="indeterminate"
  ></mat-progress-bar>`,
  standalone: true,
  imports: [MatProgressBarModule, NgStyle, AsyncPipe],
})
export class LoaderComponent {
  loadingService = inject(LoadingService);
}

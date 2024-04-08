import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  catchError,
  combineLatest,
  fromEvent,
  interval,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { withSilentLoadContext } from '@app/shared/ui-messaging';

@Injectable({ providedIn: 'root' })
export class HeartbeatService {
  #httpClient = inject(HttpClient);

  #apiReachable$ = interval(5000).pipe(
    startWith(0),
    switchMap(() =>
      window.navigator.onLine
        ? this.#httpClient
            .get('/heartbeat', { context: withSilentLoadContext() })
            .pipe(
              map(() => true),
              catchError(() => of(false)),
            )
        : of(false),
    ),
  );
  #networkStatusChange = fromEvent(window, 'online').pipe(
    startWith(window.navigator.onLine),
  );

  readonly status = toSignal(
    combineLatest([this.#apiReachable$, this.#networkStatusChange]).pipe(
      map(([apiReachable]) =>
        apiReachable && navigator.onLine ? 'connected' : 'disconnected',
      ),
    ),
  );
}

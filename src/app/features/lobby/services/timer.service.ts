import { Injectable } from '@angular/core';
import { interval, map, Observable, Subject, switchMap, takeUntil } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private stop$ = new Subject<void>();
  private start$ = new Subject<number>();

  public timeRemaining$: Observable<number> = this.start$.pipe(
    switchMap((durationSeconds) => {
      const durationMs = durationSeconds * 1000;
      const endTime = Date.now() + durationMs;

      return interval(50).pipe(
        map(() => Math.max(0, endTime - Date.now()) / 1000),
        takeUntil(this.stop$),
      );
    }),
  );

  start(durationSeconds: number) {
    this.start$.next(durationSeconds);
  }

  stop() {
    this.stop$.next();
  }

  constructor() {}
}

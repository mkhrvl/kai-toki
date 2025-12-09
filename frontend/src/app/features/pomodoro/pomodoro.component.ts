import { Component, computed, inject, linkedSignal, OnDestroy, signal } from '@angular/core';
import { Pomodoro } from './pomodoro.interface';
import { PomodoroMode } from './pomodoro.enum';
import { PomodoroService } from './pomodoro.service';
import { filter, Subject, takeUntil, timer } from 'rxjs';

@Component({
  selector: 'app-pomodoro',
  imports: [],
  templateUrl: './pomodoro.component.html',
  styleUrl: './pomodoro.component.css',
})
export class PomodoroComponent implements OnDestroy {
  private pomodoroService = inject(PomodoroService);

  // TODO: Implement fetching saved pomodoro settings from database.
  pomodoro: Pomodoro = this.pomodoroService.getPomodoroByUserId('');

  mode = signal(PomodoroMode.Work);
  durationInMinutes = computed(() => {
    switch (this.mode()) {
      case PomodoroMode.ShortBreak:
        return this.pomodoro.shortBreakDuration;
      case PomodoroMode.LongBreak:
        return this.pomodoro.longBreakDuration;
      default:
        return this.pomodoro.workDuration;
    }
  });
  secondsRemaining = linkedSignal(() => this.durationInMinutes() * 60);
  formattedRemaining = computed(() => this.formatTime(this.secondsRemaining()));
  isRunning = signal<boolean>(false);
  sessionCount = signal<number>(1);
  breakCount = signal(0);

  private destroy$ = new Subject<void>();

  constructor() {
    this.setPomodoroMode(PomodoroMode.Work);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public toggleTimer() {
    if (this.isRunning()) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  public skipTimer() {
    this.handleModeTransition();
  }

  public setToWork() {
    this.setPomodoroMode(PomodoroMode.Work);
  }

  public setToShortBreak() {
    this.setPomodoroMode(PomodoroMode.ShortBreak);
  }

  public setToLongBreak() {
    this.setPomodoroMode(PomodoroMode.LongBreak);
  }

  public resetSession() {
    this.sessionCount.set(1);
  }

  private startTimer() {
    this.isRunning.set(true);
    this.destroy$.next();
    timer(0, 1000)
      .pipe(takeUntil(this.destroy$), filter(this.isRunning))
      .subscribe(() => {
        const newValue = this.secondsRemaining() - 1;
        this.secondsRemaining.set(newValue);
        if (newValue <= 0) {
          this.handleModeTransition();
        }
      });
  }

  private stopTimer() {
    this.isRunning.set(false);
  }

  private setPomodoroMode(mode: PomodoroMode) {
    this.stopTimer();
    this.mode.set(mode);
    this.secondsRemaining.set(this.durationInMinutes() * 60);
  }

  private handleModeTransition() {
    this.stopTimer();

    if (this.mode() === PomodoroMode.Work) {
      if (this.breakCount() >= this.pomodoro.longBreakInterval) {
        this.setPomodoroMode(PomodoroMode.LongBreak);
      } else {
        this.setPomodoroMode(PomodoroMode.ShortBreak);
      }
      return;
    }

    if (this.mode() === PomodoroMode.ShortBreak) {
      this.breakCount.update((value) => value + 1);
    } else if (this.mode() === PomodoroMode.LongBreak) {
      this.breakCount.set(0);
    }

    this.transitionToWork();
  }

  private transitionToWork() {
    this.setPomodoroMode(PomodoroMode.Work);
    this.sessionCount.update((value) => value + 1);
  }

  private formatTime(totalSeconds: number): string {
    return new Date(totalSeconds * 1000).toISOString().slice(14, 19);
  }
}

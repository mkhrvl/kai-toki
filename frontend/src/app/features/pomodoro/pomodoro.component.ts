import { Component, computed, signal } from '@angular/core';
import { Pomodoro } from './pomodoro.interface';
import { PomodoroMode } from './pomodoro-mode.enum';
import { PomodoroService } from './pomodoro.service';

@Component({
  selector: 'app-pomodoro',
  imports: [],
  templateUrl: './pomodoro.component.html',
  styleUrl: './pomodoro.component.css',
})
export class PomodoroComponent {
  pomodoroService: PomodoroService = new PomodoroService();

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
  secondsRemaining = signal(this.durationInMinutes() * 60);
  formattedRemaining = computed(() => this.formatTime(this.secondsRemaining()));
  isRunning = signal(false);
  workCount = signal(1);
  breakCount = signal(0);

  private intervalId: number | undefined;

  constructor() {
    this.setToWork();
  }

  public setToWork() {
    this.mode.set(PomodoroMode.Work);
    this.secondsRemaining.set(this.durationInMinutes() * 60);
  }

  public setToShortBreak() {
    this.mode.set(PomodoroMode.ShortBreak);
    this.secondsRemaining.set(this.durationInMinutes() * 60);
  }

  public setToLongBreak() {
    this.mode.set(PomodoroMode.LongBreak);
    this.secondsRemaining.set(this.durationInMinutes() * 60);
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

  private startTimer() {
    this.isRunning.set(true);

    this.intervalId = setInterval(() => {
      if (this.secondsRemaining() > 0) {
        this.secondsRemaining.update((value) => value - 1);
      } else {
        this.handleModeTransition();
      }
    }, 1000);
  }

  private stopTimer() {
    clearInterval(this.intervalId);
    this.isRunning.set(false);
  }

  private handleModeTransition() {
    this.stopTimer();

    if (this.mode() === PomodoroMode.Work) {
      if (this.breakCount() >= this.pomodoro.longBreakInterval) {
        this.setToLongBreak();
      } else {
        this.setToShortBreak();
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
    this.setToWork();
    this.workCount.update((value) => value + 1);
  }

  private formatTime(totalSeconds: number): string {
    return new Date(totalSeconds * 1000).toISOString().slice(14, 19);
  }
}

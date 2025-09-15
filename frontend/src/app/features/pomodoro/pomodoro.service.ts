import { Injectable } from '@angular/core';
import { Pomodoro } from './pomodoro.interface';

@Injectable({
  providedIn: 'root',
})
export class PomodoroService {
  public getPomodoroByUserId(id: string): Pomodoro {
    const pomodoro: Pomodoro = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
    };

    return pomodoro;
  }
}

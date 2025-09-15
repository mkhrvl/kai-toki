import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PomodoroComponent } from './features/pomodoro/pomodoro.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PomodoroComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('kai-toki');
}

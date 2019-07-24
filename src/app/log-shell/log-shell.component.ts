import { Component, OnInit } from '@angular/core';
import { AnsiUp } from 'ansi_up';
@Component({
  selector: 'app-log-shell',
  templateUrl: './log-shell.component.html',
  styleUrls: ['./log-shell.component.less']
})
export class LogShellComponent implements OnInit {
  ansiup;
  constructor() {}

  ngOnInit() {
    this.ansiup = new AnsiUp();
  }
}

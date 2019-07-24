import { Component, ElementRef, OnInit, HostListener } from '@angular/core';

import xTerminal from './Terminal';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  term;
  constructor(private el: ElementRef) {}
  ngOnInit(): void {
    this.term = new xTerminal(this.el.nativeElement);
  }

  @HostListener('window:resize')
  resize() {
    this.term.resize();
  }
}

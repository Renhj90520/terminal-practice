import {
  Component,
  OnInit,
  ElementRef,
  HostListener,
  AfterViewInit
} from '@angular/core';
import xTerminal from '../Terminal';

@Component({
  selector: 'app-command-shell',
  templateUrl: './command-shell.component.html',
  styleUrls: ['./command-shell.component.less']
})
export class CommandShellComponent implements OnInit, AfterViewInit {
  term;
  constructor(private el: ElementRef) {}
  ngOnInit(): void {}
  ngAfterViewInit(): void {
    this.term = new xTerminal(this.el.nativeElement);
  }
  @HostListener('window:resize')
  resize() {
    this.term.resize();
  }
}

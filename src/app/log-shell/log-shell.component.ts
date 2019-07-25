import { Component, OnInit, ElementRef } from '@angular/core';
import { default as AnsiUp } from 'ansi_up';
import * as moment from 'moment';
@Component({
  selector: 'app-log-shell',
  templateUrl: './log-shell.component.html',
  styleUrls: ['./log-shell.component.less']
})
export class LogShellComponent implements OnInit {
  ansiup;
  messages = [
    '2019-07-11T10:34:59.491596769Z  * Serving Flask app "apphost" (lazy loading)',
    '2019-07-11T10:34:59.491649964Z  * Environment: production',
    '2019-07-11T10:34:59.491655344Z [31m   WARNING: This is a development server. Do not use it in a production deployment.[0m',
    '2019-07-11T10:34:59.491661011Z [2m   Use a production WSGI server instead.[0m',
    '2019-07-11T10:34:59.491664499Z  * Debug mode: off',
    '2019-07-11T10:34:59.499640574Z  * Running on http://0.0.0.0:5000/ (Press CTRL+C to quit)'
  ];
  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.ansiup = new AnsiUp();

    let html = '';
    this.messages.forEach(msg => {
      const match = msg.match(/^\[?([^ \]]+)\]?\s/);
      let dateStr = '';
      let msgStr = '';
      if (match) {
        dateStr = `<span class="log-date">${moment(match[1]).format(
          'YYYY-MM-DD HH:mm:ss'
        )}</span>`;
        msgStr = msg.substr(match[0].length);
      } else {
        msgStr = msg;
      }

      html += `<div class="log-msg log-combined">${dateStr}${this.ansiup.ansi_to_html(
        msgStr
      )}</div>`;
    });

    this.el.nativeElement.insertAdjacentHTML('beforeend', html);
  }
}

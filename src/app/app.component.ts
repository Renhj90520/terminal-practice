import { Component, ElementRef, OnInit } from '@angular/core';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
Terminal.applyAddon(fit);
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  term;

  prompt = '';
  continuationPrompt = '';

  private onDataListener;
  private input = '';
  private cursor = 0;
  constructor(private el: ElementRef) {}
  ngOnInit(): void {
    this.term = new Terminal({
      cursorBlink: true,
      fontSize: 12,
      rightClickSelectsWord: true
    });

    this.onDataListener = this.term.onData(data => this.handleData(data));
    this.term.open(this.el.nativeElement);
    this.term.fit();
    this.term.focus();
    this.printPrompt();
  }
  handleData(data) {
    const ord = data.charCodeAt(0);
    let ofs;
    // handle ANSI escape sequence
    if (ord === 0x1b) {
      switch (data.substr(1)) {
        case '[A':
          // up arrow

          break;
        case '[B':
          // down arrow
          break;
        case '[D':
          // left arrow
          this.handleCursorMove(-1);
          break;
        case '[C':
          // right arrow
          this.handleCursorMove(1);
          break;
        case '[3~':
          // delete
          this.handleCursorErase(false);
          break;
        case '[F':
          // End
          this.setCursor(this.input.length);
          break;
        case '[H':
          // Home
          this.setCursor(0);
          break;
        case 'b':
        case 'f':
          // Alt + LEFT / RIGHT
          ofs = this.closestLeftBoundary(this.input, this.cursor);
          this.setCursor(ofs);
          break;
        case '\x7F': // CTRL + BACKSPACE
          ofs = this.closestLeftBoundary(this.input, this.cursor);
          this.setInput(
            this.input.substr(0, ofs) + this.input.substr(this.cursor)
          );
          this.setCursor(ofs);
          break;
      }
    } else if (ord < 32 || ord === 0x7f) {
      switch (data) {
        case '\r':
          // Enter
          if (this.isIncompleteInput(this.input)) {
            this.handleCursorInsert('\n');
          } else {
            this.handleReadComplete();
          }
          break;
        case '\x7F':
          // BACKSPACE
          this.handleCursorErase(true);
          break;
      }
    } else {
      this.handleCursorInsert(data);
    }
  }
  handleReadComplete() {
    // TODO history

    this.printPrompt();
  }
  handleCursorInsert(data) {
    const newInput =
      this.input.substr(0, this.cursor) + data + this.input.substr(this.cursor);

    this.cursor += data.length;
    this.setInput(newInput);
  }

  /**
   * Check if there is an incomplete input
   *
   * An incomplete input is considered:
   * - An input that contains unterminated single quotes
   * - An input that contains unterminated double quotes
   * - An input that ends with '\'
   * - An input that has an incomplete boolean shell expression (&& and ||)
   * - An incomplete pipe expression (|)
   * @param input
   */
  isIncompleteInput(input) {
    if (input.trim() === '') {
      return false;
    }

    // check for dangling single-quote strings
    if ((input.match(/'/g) || []).length % 2 !== 0) {
      return true;
    }

    // check for dangling double-quote strings
    if ((input.match(/"/g) || []).length % 2 !== 0) {
      return true;
    }

    // check for dangling boolean or pipe oerations
    if (
      input
        .split(/(\|\||\||&&)/g)
        .pop()
        .trim() == ''
    ) {
      return true;
    }

    // check for tailing slash
    if (input.endsWith('\\') && !input.endsWith('\\\\')) {
      return true;
    }

    return false;
  }
  closestLeftBoundary(input, offset) {
    const found = this.wordBoundaries(input, true)
      .reverse()
      .find(x => x < offset);

    return found == null ? 0 : found;
  }
  wordBoundaries(input, leftSide = true) {
    let match;
    const words = [];
    const rx = /\w+/g;
    while ((match = rx.exec(input))) {
      if (leftSide) {
        words.push(match.index);
      } else {
        words.push(match.index + match[0].length);
      }
    }

    return words;
  }
  handleCursorErase(backspace) {
    if (backspace) {
      if (this.cursor < 0) return;

      const newInput =
        this.input.substr(0, this.cursor - 1) + this.input.substr(this.cursor);

      this.clearInput();
      this.cursor -= 1;
      this.setInput(newInput, false);
    } else {
      const newInput =
        this.input.substr(0, this.cursor) + this.input.substr(this.cursor + 1);
      this.setInput(newInput);
    }
  }
  setInput(newInput, clearInput = true) {
    if (clearInput) {
      this.clearInput();
    }

    const newPrompt = this.applyPrompts(newInput);
    this.print(newPrompt);

    // trim cursor overflow
    if (this.cursor > newInput.length) {
      this.cursor = newInput.length;
    }

    // move the cursor to the appropriate row/col
    const newCursor = this.applyPromptOffset(newInput, this.cursor);
    const newLines = this.countLines(newPrompt, this.term.cols);
    const { col, row } = this.offsetToColRow(
      newPrompt,
      newCursor,
      this.term.cols
    );

    const moveUpRows = newLines - row - 1;

    this.term.write('\r');
    for (var i = 0; i < moveUpRows; ++i) this.term.write('\x1B[F');
    for (var i = 0; i < col; ++i) this.term.write('\x1B[C');

    this.input = newInput;
  }
  print(message) {
    const normalInput = message.replace(/[\r\n]+/g, '\n');
    this.term.write(normalInput.replace(/\n/g, '\r\n'));
  }
  clearInput() {
    const currentPrompt = this.applyPrompts(this.input);

    // get the overall number of lines to clear
    const allRows = this.countLines(currentPrompt, this.term.cols);

    // get the line we are currently in
    const promptCursor = this.applyPromptOffset(this.input, this.cursor);
    const { col, row } = this.offsetToColRow(
      currentPrompt,
      promptCursor,
      this.term.cols
    );

    // first move on the last line
    const moveRows = allRows - row - 1;
    for (let i = 0; i < moveRows; ++i) {
      this.term.write('\x1B[E');
    }

    // clear current input line(s)
    this.term.write('\r\x1B[K');
    for (let i = 1; i < allRows; ++i) {
      this.term.write('\x1B[F\x1B[K');
    }
  }
  countLines(input, maxCols) {
    return this.offsetToColRow(input, input.length, maxCols).row + 1;
  }

  handleCursorMove(direction) {
    let num;
    if (direction > 0) {
      num = Math.min(direction, this.input.length - this.cursor);
    } else if (direction < 0) {
      num = Math.max(direction, -this.cursor);
    }
    this.setCursor(this.cursor + num);
  }
  setCursor(newCursor) {
    if (newCursor < 0) {
      newCursor = 0;
    }

    if (newCursor > this.input.length) {
      newCursor = this.input.length;
    }

    // apply prompt formatting to get the visual status of the display
    const inputWithPrompt = this.applyPrompts(this.input);

    // estimate previous cursor position
    const prevPromptOffset = this.applyPromptOffset(this.input, this.cursor);
    const { col: prevCol, row: prevRow } = this.offsetToColRow(
      this.input,
      this.cursor,
      this.term.cols
    );

    // estimate next cursor position
    const newPromptOffset = this.applyPromptOffset(this.input, newCursor);
    const { col: newCol, row: newRow } = this.offsetToColRow(
      inputWithPrompt,
      newPromptOffset,
      this.term.cols
    );

    // adjust vertically
    if (newRow > prevRow) {
      for (let i = prevRow; i < newRow; ++i) {
        this.term.write('\x1B[B');
      }
    } else {
      for (let i = newRow; i < prevRow; ++i) {
        this.term.write('\x1B[A');
      }
    }

    // adjust horizontally
    if (newCol > prevCol) {
      for (let i = prevCol; i < newCol; ++i) {
        this.term.write('\x1B[C');
      }
    } else {
      for (let i = newCol; i < prevCol; ++i) {
        this.term.write('\x1B[D');
      }
    }

    this.cursor = newCursor;
  }
  offsetToColRow(input, offset, maxCols: any) {
    let row = 0,
      col = 0;
    for (let i = 0; i < offset; i++) {
      const chr = input.charAt(i);
      if (chr === '\n') {
        col = 0;
        row += 1;
      } else {
        col += 1;
        if (col > maxCols) {
          col = 0;
          row += 1;
        }
      }
    }

    return { row, col };
  }
  applyPromptOffset(input, offset) {
    const newInput = this.applyPrompts(input.substr(0, offset));
    return newInput.length;
  }
  applyPrompts(input) {
    return this.prompt + input.replace(/\n/g, '\n' + this.continuationPrompt);
  }

  printPrompt() {
    this.term.write('\r\n$ ');
  }
}

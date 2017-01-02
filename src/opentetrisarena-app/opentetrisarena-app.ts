///<reference path="../../bower_components/polymer-ts/polymer-ts.d.ts" />

import {BoardState} from '../boardstate';
import {TetrisEngine} from '../tetris-engine';

@component('opentetrisarena-app')
class OpenTetrisArena extends polymer.Base {
  private state: TetrisEngine = null;

  start() {
    this.state = new TetrisEngine();
    setInterval(() => {
      this.state.tick();
      this.notifyState();
    }, 300);
  }

  notifyState() {
    var state = this.state;
    this.state = null;
    this.state = state;
  }

  attached() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  detached() {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  handleKeyDown(e) {
    switch (e.key) {
      case 'ArrowLeft':
        this.state.left();
        break;

      case 'ArrowRight':
        this.state.right();
        break;

      case 'ArrowUp':
        this.state.rotate();
        break;

      case 'ArrowDown':
        this.state.down();
        break;

      case 'Shift':
        this.state.swap();
        break;

      case ' ':
        this.state.place();
        break;

      default:
        console.log('keydown', e);
        return;
    }

    this.notifyState();
  }
}

OpenTetrisArena.register();

///<reference path="../bower_components/polymer-ts/polymer-ts.d.ts" />

import {BoardState, Cell} from './boardstate';

const COLOR_MAP = {
  'cyan': '#2aa198',
  'yellow': '#b58900',
  'purple': '#d33682',
  'green': '#859900',
  'red': '#dc322f',
  'blue': '#268bd2',
  'orange': '#cb4b16',
  'black': '#073642',
  'gray': '#586e75',
};

@component('tetris-board')
class TetrisBoard extends polymer.Base {
  @property({type: Object}) state: BoardState;
  @property({type: Boolean, value: false}) small: boolean;
  @property({type: Boolean, value: false}) selected: boolean;
  @property({type: Number, value: 0}) progress: number;

  public _computeColor(item: Cell) {
    if (!item || !item.color) {
      return '';
    }
    return 'background-color: ' + COLOR_MAP[item.color];
  }

  public progressWidth(progress: number, selected: boolean): string {
    if (!selected) {
      return '';
    }
    return 'width: ' + (56 * progress) + 'px';
  }
}

TetrisBoard.register();

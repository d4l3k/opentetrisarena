///<reference path="../bower_components/polymer-ts/polymer-ts.d.ts" />

import {BoardState} from './boardstate';

const COLOR_MAP = {
  'cyan': '#2aa198',
  'yellow': '#b58900',
  'purple': '#d33682',
  'green': '#859900',
  'red': '#dc322f',
  'blue': '#268bd2',
  'orange': '#cb4b16',
}

@component('tetris-board') class TetrisBoard extends polymer.Base {
  @property({type: Object}) state: BoardState;
  @property({type: Array}) subStates: BoardState[];
  @property({type: Boolean, value: false}) small: boolean;

  public computeColor(item) {
    if (!item) {
      return '';
    }
    return 'background-color: ' + COLOR_MAP[item.color];
  }
}

TetrisBoard.register();

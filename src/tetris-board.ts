///<reference path="../bower_components/polymer-ts/polymer-ts.d.ts" />

import {BoardState, Cell} from './boardstate';
import {COLOR_MAP} from './colors';

@component('tetris-board')
class TetrisBoard extends polymer.Base {
  @property({type: Object}) state: BoardState;
  @property({type: Array}) subStates: BoardState[];
  @property({type: Boolean, value: false}) small: boolean;
  @property({type: Boolean, value: false}) selected: boolean;
  @property({type: Number, value: 0}) progress: number;

  public computeColor(item: Cell) {
    if (!item) {
      return '';
    }
    return 'background-color: ' + COLOR_MAP[item.color];
  }

  public progressWidth(progress: number, selected: boolean) {
    if (!selected) {
      return '';
    }
    return 'width: ' + (56 * progress) + 'px';
  }
}

TetrisBoard.register();

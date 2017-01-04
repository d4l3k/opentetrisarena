///<reference path="../bower_components/polymer-ts/polymer-ts.d.ts" />

import {Piece} from './boardstate';
import {COLOR_MAP} from './colors';

@component('tetris-piece')
class TetrisPiece extends polymer.Base {
  @property({type: Object}) piece: Piece;

  public computeColor(item, piece) {
    if (!item || !piece) {
      return '';
    }
    return 'background-color: ' + COLOR_MAP[piece.color];
  }
}

TetrisPiece.register();

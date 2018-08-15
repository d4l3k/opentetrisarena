///<reference path="../bower_components/polymer-ts/polymer-ts.d.ts" />

import {Piece} from './boardstate';
import {COLOR_MAP} from './colors';

@component('tetris-piece')
class TetrisPiece extends polymer.Base {
  @property({type: Object}) piece: Piece;

  public computeColor(block: number, piece: Piece): string {
    if (!block || !piece) {
      return '';
    }
    return 'background-color: ' + COLOR_MAP[piece.color];
  }

  public hideEmptyRows(row: number[]): boolean {
    return (row.indexOf(1) != -1);
  }
}

TetrisPiece.register();

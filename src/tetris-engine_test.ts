///<reference path="../node_modules/@types/chai/index.d.ts" />
///<reference path="../node_modules/@types/mocha/index.d.ts" />

import {expect} from 'chai';

import {matrix} from './tetris-engine';

describe('matrix', () => {
  it('should return correct heights', () => {
    expect(matrix.height([])).to.eql(0);
    expect(matrix.height([[1]])).to.eql(1);
    expect(matrix.height([[1, 2], [3, 4], [5, 6]])).to.eql(3);
  });
  it('should return correct widths', () => {
    expect(matrix.width([])).to.eql(0);
    expect(matrix.width([[1]])).to.eql(1);
    expect(matrix.width([[1, 2], [3, 4], [5, 6]])).to.eql(2);
  });
  it('should be able to rotate 2x2 0deg', () => {
    const m = [[1, 2], [3, 4]];
    const want = [[1, 2], [3, 4]];
    expect(matrix.rotate(m, 4)).to.eql(want);
  });
  it('should be able to rotate 2x2 90deg', () => {
    const m = [[1, 2], [3, 4]];
    const want = [[3, 1], [4, 2]];
    expect(matrix.rotate(m, 1)).to.eql(want);
  });
  it('should be able to rotate 2x2 180deg', () => {
    const m = [[1, 2], [3, 4]];
    const want = [[4, 3], [2, 1]];
    expect(matrix.rotate(m, 2)).to.eql(want);
  });
  it('should be able to rotate 2x2 270deg', () => {
    const m = [[1, 2], [3, 4]];
    const want = [[2, 4], [1, 3]];
    expect(matrix.rotate(m, 3)).to.eql(want);
  });
  it('should be able to rotate 3x3 90deg', () => {
    const m = [[1, 2, 3], [8, 0, 4], [7, 6, 5]];
    const want = [[7, 8, 1], [6, 0, 2], [5, 4, 3]];
    expect(matrix.rotate(m, 1)).to.eql(want);
  });
});

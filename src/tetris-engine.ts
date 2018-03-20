import {BoardState, Cell, Piece} from './boardstate';

interface Position {
  x: number
  y: number
  rotation?: number
}

const WIDTH = 10;
const HEIGHT = 22;
const PIECES: Piece[] = [
  {
    name: 'I',
    color: 'cyan',
    block: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  {
    name: 'O',
    color: 'yellow',
    block: [
      [1, 1],
      [1, 1],
    ],
  },
  {
    name: 'T',
    color: 'purple',
    block: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  {
    name: 'S',
    color: 'green',
    block: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
  },
  {
    name: 'Z',
    color: 'red',
    block: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
  },
  {
    name: 'J',
    color: 'blue',
    block: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  {
    name: 'L',
    color: 'orange',
    block: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
];

// matrixRotation returns a new matrix with the desired rotation applied.
// Rotation is specified as the number of clockwise 90deg increments.
// 0 = 0deg, 1 = 90deg, 2 = 180deg, 3 = 270deg.
function matrixRotate<T>(m: T[][], rotation: number): T[][] {
  rotation = rotation % 4;
  const w = matrixWidth(m), h = matrixHeight(m);
  let rw = w, rh = h;
  if (rotation == 1 || rotation == 3) {
    rw = h;
    rh = w;
  }
  const rm = matrixNew(rw, rh, null);
  const deg = rotation * Math.PI / 2;
  const rotationMatrix = [
    Math.cos(deg),
    -Math.sin(deg),
    Math.sin(deg),
    Math.cos(deg),
  ];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - (w - 1) / 2;
      const dy = y - (h - 1) / 2;
      const rx = Math.round(
          rotationMatrix[0] * dx + rotationMatrix[1] * dy + (rw - 1) / 2);
      const ry = Math.round(
          rotationMatrix[2] * dx + rotationMatrix[3] * dy + (rh - 1) / 2);
      rm[ry][rx] = m[y][x];
    }
  }

  return rm;
}

function matrixHeight<T>(m: T[][]): number {
  return m.length;
}

function matrixWidth<T>(m: T[][]): number {
  return m.length && m[0].length;
}

function matrixNew<T>(width: number, height: number, val: T): T[][] {
  const matrix = [];
  for (var y = 0; y < height; y++) {
    const row = [];
    for (var x = 0; x < width; x++) {
      row.push(val);
    }
    matrix.push(row);
  }
  return matrix;
}

export const matrix = {
  width: matrixWidth,
  height: matrixHeight,
  new: matrixNew,
  rotate: matrixRotate,
};

interface LineRequest {
  count: number
  solid: boolean
}

export class TetrisEngine implements BoardState {
  public grid: Cell[][];
  public savedPiece: Piece;
  public currentPiece: Piece;
  public upcomingPieces: Piece[] = [];
  public over: boolean = false;
  public lineRequests: LineRequest[] = [];
  public message: string;
  public onLineBreak: (count: number) => void;

  private position: Position;
  private bag: Piece[] = [];
  private hasSwapped: boolean = false;

  constructor() {
    const grid = [];
    for (let i = 0; i < HEIGHT; i++) {
      grid.push(this.row());
    }
    this.grid = grid;
  }

  public tick() {
    if (this.over) {
      return;
    }

    this.updatedUpcoming();
    const placePiece = !this.currentPiece;
    if (placePiece) {
      this.hasSwapped = false;
      this.processLineRequests();
      this.currentPiece = this.upcomingPieces.shift();
      this.resetPosition();
      this.updatedUpcoming();
    }
    if (!this.movePiece(0, 1, 0)) {
      if (placePiece) {
        this.over = true;
        this.message = 'Game Over';
        return;
      }
      this.currentPiece = null;
      this.checkSolved();
      this.tick();
    }
  }

  public swap() {
    if (this.hasSwapped) {
      return;
    }
    this.hasSwapped = true;

    this.clearPattern(this.position, this.currentPiece.block);
    const cur = this.currentPiece;
    this.currentPiece = this.savedPiece;
    this.savedPiece = cur;
    this.resetPosition();
    this.tick();
  }

  public left() {
    this.movePiece(-1, 0, 0);
  }

  public right() {
    this.movePiece(1, 0, 0);
  }

  public down() {
    this.movePiece(0, 1, 0);
  }

  public rotate() {
    this.movePiece(0, 0, 1);
  }

  public place() {
    while (this.movePiece(0, 1, 0)) {
    }
    this.tick();
  }

  public addLinesToBottom(count: number, solid: boolean) {
    this.lineRequests.push({count, solid});
  }

  private processLineRequests() {
    for (let req of this.lineRequests) {
      if (req.solid) {
        const row = this.row({color: 'black'});
        for (let c = 0; c < req.count; c++) {
          this.grid.shift();
          this.grid.push(row);
        }
      } else {
        const row = this.row({color: 'gray'});
        row[Math.floor(Math.random() * row.length)] = null;
        for (let c = 0; c < req.count; c++) {
          this.grid.shift();
        }
        for (let i = this.grid.length - 1; i >= 0; i--) {
          if (this.grid[i].indexOf(null) == -1) {
            continue;
          }

          for (let c = 0; c < req.count; c++) {
            this.grid.splice(i + 1, 0, row);
          }
          break;
        }
      }
    }
    this.lineRequests = [];
  }

  private clearPattern(pos: Position, m: number[][]) {
    this.applyPattern(pos, m, null);
  }

  private applyPattern(pos: Position, m: number[][], val: Cell) {
    m = matrix.rotate(m, pos.rotation);
    const w = matrix.width(m);
    const h = matrix.height(m);
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        if (!m[j][i]) {
          continue;
        }
        const x = pos.x + i;
        const y = pos.y + j;
        if (!this.inRenderBounds({x, y})) {
          continue;
        }
        this.grid[y][x] = val;
      }
    }
  }

  private patternFits(pos: Position, m: number[][]): boolean {
    m = matrix.rotate(m, pos.rotation);
    const w = matrix.width(m);
    const h = matrix.height(m);
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        if (!m[j][i]) {
          continue;
        }
        const x = pos.x + i;
        const y = pos.y + j;
        if (!this.inBounds({x, y})) {
          return false;
        }
        if (!this.inRenderBounds({x, y})) {
          continue;
        }
        const cell = this.grid[y][x];
        if (cell && cell.color !== 'ghost') {
          return false;
        }
      }
    }

    return true
  }

  private applyGhost(pos: Position, m: number[][]) {
    pos = {...pos};
    while (pos.y <= HEIGHT) {
      pos.y += 1
      const fits = this.patternFits(pos, m);
      if (!fits) {
        pos.y -= 1
        break;
      }
    }
    this.applyPattern(pos, m, {color: 'ghost'});
  }

  private clearGhost() {
    for (let j = 0; j < HEIGHT; j++) {
      for (let i = 0; i < WIDTH; i++) {
        const cell = this.grid[j][i];
        if (cell && cell.color === 'ghost') {
          this.grid[j][i] = null
        }
      }
    }
  }

  // inBounds returns if the position is a valid place for a block;
  private inBounds(p: Position): boolean {
    return p.x >= 0 && p.x < WIDTH && p.y < HEIGHT;
  }

  // inRenderBounds returns whether the point can be rendered on a board.
  private inRenderBounds(p: Position): boolean {
    return p.y >= 0 && this.inBounds(p);
  }

  private movePiece(dx: number, dy: number, drot: number): boolean {
    const {x, y, rotation} = this.position;
    const newPos = {x: x + dx, y: y + dy, rotation: (rotation + drot) % 4};
    this.clearPattern(this.position, this.currentPiece.block);
    const cell = {
      color: this.currentPiece.color,
    };
    const fits = this.patternFits(newPos, this.currentPiece.block);
    if (fits) {
      this.position = newPos;
    }
    this.clearGhost();
    this.applyGhost(this.position, this.currentPiece.block);
    this.applyPattern(this.position, this.currentPiece.block, cell);
    return fits;
  }

  private pieceCollides(pos: Position, piece: Piece) {}

  private row(cell: Cell = null): Cell[] {
    const row = [];
    for (let j = 0; j < WIDTH; j++) {
      row.push(cell);
    }
    return row;
  }

  private checkSolved() {
    let broken = 0;
    for (let y = 0; y < HEIGHT; y++) {
      let full = false;
      for (let x = 0; x < WIDTH; x++) {
        const cell = this.grid[y][x];
        if (cell && cell.color == 'black') {
          full = false;
          break;
        }
        full = !!cell;
        if (!full) {
          break;
        }
      }
      if (full) {
        this.grid.splice(y, 1);
        this.grid.unshift(this.row());
        broken++;
      }
    }
    if (broken > 0 && this.onLineBreak) {
      this.onLineBreak(broken);
    }
  }

  private resetPosition() {
    if (!this.currentPiece) {
      return;
    }

    const offset = Math.ceil(matrixWidth(this.currentPiece.block) / 2);
    this.position = {x: WIDTH / 2 - offset, y: -1, rotation: 0};
  }

  private updatedUpcoming() {
    while (this.upcomingPieces.length < 5) {
      this.upcomingPieces.push(this.randomPiece());
    }
  }

  private randomPiece() {
    if (this.bag.length == 0) {
      // Add pieces to bag.
      for (let piece of PIECES) {
        this.bag.push(piece);
      }

      // Randomize bag.
      for (let i = 0; i < this.bag.length; i++) {
        const j = Math.floor(Math.random() * this.bag.length);
        const p = this.bag[i];
        this.bag[i] = this.bag[j];
        this.bag[j] = p;
      }
    }
    return this.bag.pop();
  }
}

interface Cell {}
interface Piece {
  name: string
  color: string
  block: number[][]
}

interface Position {
  x: number
  y: number
  rotation: number
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

export class TetrisEngine {
  public grid: Cell[][];
  public savedPiece: Piece;
  public currentPiece: Piece;
  public upcomingPieces: Piece[];
  private position: Position;

  constructor() {
    const grid = [];
    for (let i = 0; i < HEIGHT; i++) {
      grid.push(this.emptyRow());
    }
    this.grid = grid;

    this.resetPosition();
  }

  public tick() {
    this.movePiece();
    this.updatedUpcoming();
  }

  public swap() {
    const cur = this.currentPiece;
    this.currentPiece = this.savedPiece;
    this.savedPiece = cur;
    this.resetPosition();
  }

  private movePiece() { this.position.y++; }

  private pieceCollides(pos: Position, piece: Piece) {}


  private emptyRow(): Cell[] {
    const row = [];
    for (let j = 0; j < WIDTH; j++) {
      row.push(null);
    }
    return row;
  }

  private checkSolved() {
    for (let y = 0; y < HEIGHT; y++) {
      let full = false;
      for (let x = 0; x < HEIGHT; x++) {
        full = !!this.grid[y][x];
        if (!full) {
          break;
        }
      }
      if (full) {
        this.grid.splice(y, 1);
        this.grid.unshift(this.emptyRow());
      }
    }
  }

  private resetPosition() { this.position = {x: WIDTH / 2, y: 0, rotation: 0}; }

  private updatedUpcoming() {
    while (this.upcomingPieces.length < 5) {
      this.upcomingPieces.push(this.nextPiece());
    }
  }

  private nextPiece() {
    return PIECES[Math.floor(Math.random() * PIECES.length)];
  }
}

export interface Cell { color: string }
export interface Piece {
  name: string
  color: string
  block: number[][]
}

export interface BoardState {
  id?: string
  savedPiece?: Piece
  currentPiece?: Piece
  upcomingPieces: Piece[]
  grid: Cell[][]
  over?: boolean
  message?: string
}
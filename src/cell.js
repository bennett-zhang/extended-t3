/*
Represents a single cell in the game board.
*/
export default class {
  constructor(position) {
    // The position of this cell represented by [rowIndex, colIndex].
    this.position = position

    // The character that this cell contains.
    this.char = ""

    // The lines that this cell is apart of.
    this.lines = []
  }
}

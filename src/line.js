/*
Represents a single line of cells.
*/
export default class {
  constructor() {
    // An array of cells that this line contains.
    this.cells = []

    // This line's score.
    this.score = 0

    // The winner of this line.
    this.winner = null
  }

  /*
  Adds the specified cell to this line.
  */
  addCell(cell) {
    this.cells.push(cell)

    // Lets the cell know that it's now apart of this line.
    cell.lines.push(this)
  }

  /*
  Count the number of Xs and the number of Os in the line.

  If both numXs and numOs equal zero or both are positive, the score is zero.

  Otherwise,
  If numXs is positive, the score is 16 ^ (numXs - 1).
  If numOs is positive, the score is -(16 ^ (numOs - 1)).
  */
  calculateScore() {
    let numXs = 0
    let numOs = 0

    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i]

      if (cell.char === "X") {
        numXs++
      } else if (cell.char === "O") {
        numOs++
      }
    }

    this.winner = null

    if (numXs && numOs) {
      this.score = 0
    } else if (numXs) {
      this.score = Math.pow(16, numXs - 1)

      if (numXs === this.cells.length) {
        this.winner = "X"
      }
    } else if (numOs) {
      this.score = -Math.pow(16, numOs - 1)

      if (numOs === this.cells.length) {
        this.winner = "O"
      }
    } else {
      this.score = 0
    }
  }
}

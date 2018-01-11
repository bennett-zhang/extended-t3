import Cell from "./cell.js"
import Line from "./line.js"

/*
Manages the game state.
*/
export default class {
  /*
  Creates a board with the specified number of rows and columns, populates that
  board with cells, and instantiates every line of length NUM_TO_WIN.

  @requires
  0 < NUM_ROWS
  0 < NUM_COLS
  0 < NUM_TO_WIN <= Math.max(NUM_ROWS, NUM_COLS)
  1 <= depth
  */
  constructor(NUM_ROWS, NUM_COLS, NUM_TO_WIN, playerGoesFirst, depth) {
    /*
    The dimensions of the board.

    @requires
    0 < NUM_ROWS
    0 < NUM_COLS
    */
    this.NUM_ROWS = NUM_ROWS
    this.NUM_COLS = NUM_COLS

    /*
    The number of characters you need to line up in order to win.

    @requires
    0 < NUM_TO_WIN <= Math.max(NUM_ROWS, NUM_COLS)
    */
    this.NUM_TO_WIN = NUM_TO_WIN

    // Whether the player or computer goes first.
    this.playerGoesFirst = playerGoesFirst

    // The initial depth of the minimax algorithm.
    this.depth = depth

    // An array of moves. Moves are represented by [rowIndex, columnIndex].
    this.history = []

    // This game's score.
    this.score = 0

    // The winner of this line.
    this.winner = null

    /*
    A 2D array that contains cells, with the specified number of rows and
    columns.
    */
    this.board = []

    // Populate the board with cells.
    for (let i = 0; i < NUM_ROWS; i++) {
      this.board.push([])

      for (let j = 0; j < NUM_COLS; j++) {
        this.board[i].push(new Cell([i, j]))
      }
    }

    // Instantiate every line in the board of length NUM_TO_WIN.
    for (let i = 0; i < NUM_ROWS; i++) {
      for (let j = 0; j < NUM_COLS; j++) {
        /*
        If there is space to create a vertical line starting with the cell at
        (i, j) and going down.
        */
        if (i + NUM_TO_WIN <= NUM_ROWS) {
          const vertLine = new Line()

          for (let k = 0; k < NUM_TO_WIN; k++) {
            vertLine.addCell(this.board[i + k][j])
          }
        }

        /*
        If there is space to create a horizontal line starting with the cell at
        (i, j) and going right.
        */
        if (j + NUM_TO_WIN <= NUM_COLS) {
          const horizLine = new Line()

          for (let k = 0; k < NUM_TO_WIN; k++) {
            horizLine.addCell(this.board[i][j + k])
          }
        }

        /*
        If there is space to create a diagonal line starting with the cell at
        (i, j) and going down and to the right.
        */
        if (i + NUM_TO_WIN <= NUM_ROWS && j + NUM_TO_WIN <= NUM_COLS) {
          const diagLine = new Line()

          for (let k = 0; k < NUM_TO_WIN; k++) {
            diagLine.addCell(this.board[i + k][j + k])
          }
        }

        /*
        If there is space to create a diagonal line starting with the cell at
        (i, j) and going down and to the left.
        */
        if (i + NUM_TO_WIN <= NUM_ROWS && NUM_TO_WIN - 1 <= j) {
          const diagLine = new Line()

          for (let k = 0; k < NUM_TO_WIN; k++) {
            diagLine.addCell(this.board[i + k][j - k])
          }
        }
      }
    }
  }

  /*
  Returns the character representing whose turn it is.
  */
  whoseTurn() {
    if (this.history.length % 2 === 0) {
      return "X"
    }

    return "O"
  }

  /*
  Returns whether or not a given move is legal.
  */
  isLegalMove(move) {
    const cell = this.board[move[0]][move[1]]

    return !this.winner && !cell.char
  }

  /*
  Returns an array of every legal move.
  Moves are represented by [rowIndex, columnIndex].
  */
  getLegalMoves() {
    const moves = []

    if (this.winner) {
      return moves
    }

    for (let i = 0; i < this.NUM_ROWS; i++) {
      for (let j = 0; j < this.NUM_COLS; j++) {
        if (!this.board[i][j].char) {
          moves.push([i, j])
        }
      }
    }

    return moves
  }

  /*
  Returns an array of legal moves that are likely to be chosen by the computer.

  If no previous moves have been made, move in the middle.

  If someone already won, don't move at all.

  Otherwise,
  Take a look at every cell that has previously been moved in. We'll call these
  special cells "past cells".

  Each of these past cells belongs to a set of lines. We'll call these special
  lines "shared lines".

  The only legal moves that we will return are the locations of cells that also
  belong to these shared lines. By narrowing the number of moves we return, the
  performance of the AI is dramatically increased.

  We can do even better by sorting the array of legal moves we return.

  Consider a single legal move that we return called "Move A". Move A has a
  corresponding cell called "Cell A". Cell A must belong to a set of shared
  lines. Each of Cell A's shared lines has a score. Take the absolute value of
  those scores and add them together. This sum is called "Move A's total score".

  Each of the legal moves we return must have its own total score. Sort the
  array of legal moves we return based on each move's total score, with larger
  total scores near the beginning and smaller total scores near the end. Moves
  that have larger total scores are more likely to be chosen by the AI, so
  letting the AI consider those moves first will force alpha beta cutoffs
  earlier, thereby boosting efficiency.
  */
  getSmartLegalMoves() {
    const movesAndScores = []

    if (!this.history.length) {
      return [[Math.floor(this.NUM_ROWS / 2), Math.floor(this.NUM_COLS / 2)]]
    }

    if (this.winner) {
      return []
    }

    for (let i = 0; i < this.history.length; i++) {
      const pastMove = this.history[i]
      const pastCell = this.board[pastMove[0]][pastMove[1]]

      for (let j = 0; j < pastCell.lines.length; j++) {
        const line = pastCell.lines[j]

        for (let k = 0; k < line.cells.length; k++) {
          const cell = line.cells[k]

          if (!cell.char) {
            const move = cell.position

            let alreadyThere = false

            for (let l = 0; l < movesAndScores.length; l++) {
              if (movesAndScores[l].move === move) {
                alreadyThere = true
                movesAndScores[l].score += Math.abs(line.score)
                break
              }
            }

            if (!alreadyThere) {
              movesAndScores.push({
                move,
                score: Math.abs(line.score)
              })
            }
          }
        }
      }
    }

    return movesAndScores.sort((moveAndScore1, moveAndScore2) => {
      return moveAndScore2.score - moveAndScore1.score
    }).map(moveAndScore => moveAndScore.move)
  }

  /*
  Make the specified move.
  Move is represented by [rowIndex, colIndex].

  @requires
  0 <= rowIndex < NUM_ROWS
  0 <= colIndex < NUM_COLS
  isLegalMove(move)
  */
  makeMove(move) {
    const cell = this.board[move[0]][move[1]]

    cell.char = this.whoseTurn()

    this.calculateScore(cell)

    this.history.push(move)
  }

  /*
  Undo the most recent move.

  @requires
  history.length > 0
  */
  undoMove() {
    const move = this.history.pop()
    const cell = this.board[move[0]][move[1]]

    cell.char = ""

    this.calculateScore(cell)

    this.winner = null
  }

  /*
  Calculate the game's score each time a specified cell changes.
  For each line that the cell is apart of, calculate that line's score and
  adjust the game's score based on how much the line's score changed.
  */
  calculateScore(cell) {
    for (let i = 0; i < cell.lines.length; i++) {
      const line = cell.lines[i]

      this.score -= line.score
      line.calculateScore()
      this.score += line.score

      if (line.winner) {
        this.winner = line.winner
      }
    }
  }

  /*
  Returns the move chosen by the AI.
  */
  getAIMove() {
    return this.minimax(this.depth, this.whoseTurn() === "X",
                        -Infinity, Infinity).move
  }

  /*
  Minimax algorithm with alpha beta pruning.

  @requires
  1 <= depth
  */
  minimax(depth, isMaximizing, alpha, beta) {
    const moves = this.getSmartLegalMoves()

    if (!moves.length || !depth) {
      return {
        score: this.score
      }
    }

    let bestMove

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i]

      this.makeMove(move)

      const score = this.minimax(depth - 1, !isMaximizing, alpha, beta).score

      if (isMaximizing) {
        if (score > alpha) {
          alpha = score
          bestMove = move
        }
      } else {
        if (score < beta) {
          beta = score
          bestMove = move
        }
      }

      this.undoMove()

      if (alpha >= beta) {
        break
      }
    }

    return {
      score: isMaximizing ? alpha : beta,
      move: bestMove
    }
  }
}

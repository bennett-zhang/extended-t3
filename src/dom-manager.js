const $board = $("#board")
const $aiMove = $("#ai-move")
const $undo = $("#undo")
const $aiDepth = $("#ai-depth")

/*
Contains helper functions that manipulate the DOM in order to reflect the
current game state.
*/
export default class {
  /*
  Appends the appropriate number of rows and cells to the board based on the
  game manager's specifications.

  Adds event listeners to the various UI elements.
  */
  constructor(gameManager) {
    this.gameManager = gameManager

    // Whether or not the AI is thinking
    this.thinking = false

    $board.empty()

    for (let i = 0; i < gameManager.NUM_ROWS; i++) {
      const $row = $("<tr></tr>").appendTo($board)

      for (let j = 0; j < gameManager.NUM_COLS; j++) {
        const $cell = $("<td></td>").appendTo($row)

        // Cell on mouse over callback function.
        $cell.mouseover(() => {
          if (gameManager.isLegalMove([i, j])) {
            $cell.addClass("hover")
          }
        })

        // Cell on mouse out callback function.
        $cell.mouseout(() => {
          $cell.removeClass("hover")
        })

        // Cell on click callback function.
        $cell.click(() => {
          if (!this.thinking && gameManager.isLegalMove([i, j])) {
            this.makeMove([i, j])

            $cell.removeClass("hover")
          }
        })
      }
    }

    $aiMove.click(() => {
      if (!this.thinking) {
        this.makeAIMove()
      }
    })

    $undo.click(() => {
      if (!this.thinking && gameManager.history.length > 0) {
        this.undoMove()
      }
    })

    $aiDepth.val(gameManager.depth)
      .change(() => {
        const val = Number.parseFloat($aiDepth.val())

        if (Number.isInteger(val) && val >= 1) {
          gameManager.depth = val
        } else {
          alert("AI depth must be an integer greater than or equal to 1.")
        }
      })
  }

  /*
  Returns the table cell at the specified location. Location is represented by
  [rowIndex, colIndex].

  @requires
  0 <= rowIndex < NUM_ROWS
  0 <= colIndex < NUM_COLS
  */
  getCell(location) {
    return $board.find(`tr:nth-child(${location[0] + 1})
                        td:nth-child(${location[1] + 1})`)
  }

  /*
  Returns the character in the table cell at the specified location. Location is
  represented by [rowIndex, colIndex].

  @requires
  0 <= rowIndex < NUM_ROWS
  0 <= colIndex < NUM_COLS
  */
  getCellChar(location) {
    return this.getCell(location).text()
  }

  /*
  Makes the specified move, repesented by [rowIndex, colIndex], by updating both
  the DOM and the game manager. Alerts if someone wins the game.

  @requires
  0 <= rowIndex < NUM_ROWS
  0 <= colIndex < NUM_COLS
  isLegalMove(move)
  */
  makeMove(move) {
    const turn = this.gameManager.whoseTurn()
    $(".recent").removeClass("recent")
    this.getCell(move).text(turn)
                      .addClass("recent")

    this.gameManager.makeMove(move)

    if (this.gameManager.winner) {
      alert(`${this.gameManager.winner} wins!`)
    }
  }

  /*
  AI makes a move.
  */
  makeAIMove() {
    this.thinking = true

    const aiMove = this.gameManager.minimax().move

    if (aiMove) {
      this.makeMove(aiMove)
    }

    setTimeout(() => {
      this.thinking = false
    }, 0)
  }

  /*
  Undoes the most recent move, represented by [rowIndex, colIndex], by updating
  both the DOM and the game manager.

  @requires
  0 <= rowIndex < NUM_ROWS
  0 <= colIndex < NUM_COLS
  history.length > 0
  */
  undoMove() {
    const history = this.gameManager.history

    let lastMove = history[history.length - 1]
    this.getCell(lastMove).empty()
                          .removeClass("recent")

    this.gameManager.undoMove()

    if (history.length > 0) {
      lastMove = history[history.length - 1]
      this.getCell(lastMove).addClass("recent")
    }
  }
}

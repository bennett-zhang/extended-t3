import GameManager from "./game-manager.js"
import DOMManager from "./dom-manager.js"

const gameManager = new GameManager(19, 19, 5, false, 4)
const domManager = new DOMManager(gameManager)

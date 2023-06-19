const section1: HTMLElement = document.querySelector("#section1")!;
const section2: HTMLElement = document.querySelector("#section2")!;
const board1: HTMLElement = section1.querySelector(".player-board")!;
const board2: HTMLElement = section2.querySelector(".player-board")!;
const textParagraph: HTMLElement = document.querySelector(".text-field > p")!;

export function init() {
  const gridSize = 10;
  board1.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
  board1.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  board2.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
  board2.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      board1.appendChild(cell);
    }
  }

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell", "cell--hidden");

      board2.appendChild(cell);
    }
  }
}

export function refreshBoard1(grid) {
  const htmlCells = board1.querySelectorAll(".cell");
  for (const cell of grid.cells) {
    if (cell.isHit && cell.ship !== null) {
      htmlCells[grid.cells.indexOf(cell)].classList.add("cell--hit-ship");
    } else if (cell.isHit) {
      htmlCells[grid.cells.indexOf(cell)].classList.add("cell--hit");
    } else if (cell.ship !== null) {
      htmlCells[grid.cells.indexOf(cell)].classList.add("cell--ship-part");
    }
  }
}

export function refreshBoard2(grid) {
  const htmlCells = board2.querySelectorAll(".cell");
  for (const cell of grid.cells) {
    if (cell.isHit && cell.ship !== null) {
      htmlCells[grid.cells.indexOf(cell)].classList.remove("cell--hidden");
      htmlCells[grid.cells.indexOf(cell)].classList.add("cell--hit-ship");
    } else if (cell.isHit) {
      htmlCells[grid.cells.indexOf(cell)].classList.remove("cell--hidden");
      htmlCells[grid.cells.indexOf(cell)].classList.add("cell--hit");
    }
  }
}

import { Ship, Player, AI } from "./game";
import { indexToCoordinates } from "./utility";
import { startGameToggle } from "..";
import {
  displayMessage,
  init as initDisplay,
  refreshBoard1,
  refreshBoard2,
  updateBoardReference,
} from "./display";

const board1: HTMLElement = document.querySelector("#section1 .player-board")!;
const board2: HTMLElement = document.querySelector("#section2 .player-board")!;
const board1Clone = board1.cloneNode(true);

let thePlayer: Player;
let theEnemy: AI;
let currentShipToPlace: Ship | null;
let currentShipDirection: "up" | "right" = "up";

let turn: 1 | 2 = 1;

function takeTurns() {
  if (turn === 1) {
    board2.classList.remove("turn");
    board1.classList.add("turn");
    return 2;
  } else {
    board1.classList.remove("turn");
    board2.classList.add("turn");
    return 1;
  }
}

export function updateCurrentShipToPlace(ship: Ship) {
  currentShipToPlace = ship;
}

export function setPlayer(player: Player) {
  thePlayer = player;
}

export function setEnemy(enemy: AI) {
  theEnemy = enemy;
}

export function bindBoard1() {
  board1.style.cursor = "pointer";
  const board1Cells = board1.querySelectorAll(".cell");
  board1Cells.forEach((cell) => {
    cell.addEventListener("mouseover", () => {
      renderShipProjection(cell);
    });
    cell.addEventListener("mouseout", () => {
      board1Cells.forEach((cell) => {
        cell.classList.remove("cell--hover");
      });
    });
    cell.addEventListener("click", () => {
      const shipsOnGameboardCount = thePlayer.gameboard.shipsOnGameboard.length;
      const clickResultSuccessful = handleOwnBoardClick(cell);
      refreshBoard1(thePlayer);
      if (shipsOnGameboardCount === thePlayer.ships.length - 1 && clickResultSuccessful) {
        board1.parentNode!.replaceChild(board1Clone, board1);
        updateBoardReference();
        initDisplay();
        refreshBoard1(thePlayer);
        startGameToggle();
      }
      if (shipsOnGameboardCount + 1 === thePlayer.gameboard.shipsOnGameboard.length) {
        currentShipToPlace = thePlayer.ships[thePlayer.ships.indexOf(currentShipToPlace!) + 1];
      }
    });
  });
}

export function bindBoard2() {
  board2.style.cursor = "pointer";
  board2.classList.add("turn");
  const board2Cells = board2.querySelectorAll(".cell");
  board2Cells.forEach((cell) => {
    cell.addEventListener("click", () => {
      if (turn === 2) return;
      const index = [...board2Cells].indexOf(cell);
      handleEnemyBoardClick(index);
      refreshBoard2(theEnemy);
    });
  });
}

function renderShipProjection(cell: Element) {
  const board1Cells = board1.querySelectorAll(".cell");
  const coords = indexToCoordinates([...board1Cells].indexOf(cell));
  const result: Array<any> = [];
  if (currentShipDirection === "up") {
    for (let i = 0; i < currentShipToPlace!.size; i++) {
      result.push({ x: coords.x, y: coords.y + i });
    }
  } else if (currentShipDirection === "right") {
    for (let i = 0; i < currentShipToPlace!.size; i++) {
      result.push({ x: coords.x - i, y: coords.y });
    }
  }
  const indexes: Array<number> = result.map((pos) => {
    if (pos.x < 1 || pos.y > 10) {
      return -1;
    }
    return 10 * (pos.y - 1) + pos.x - 1;
  });
  for (let i of indexes) {
    if (i === -1) continue;
    board1Cells[i].classList.add("cell--hover");
  }
}

function handleOwnBoardClick(cell) {
  const board1Cells = board1.querySelectorAll(".cell");
  const pos = indexToCoordinates([...board1Cells].indexOf(cell));
  return thePlayer.placeShipSuccessfully(currentShipToPlace!, pos, currentShipDirection);
}

function handleEnemyBoardClick(index: number) {
  let shipsAliveBefore = enemyShipsAliveCount();
  let shotResult = thePlayer.shoot(theEnemy, indexToCoordinates(index));
  while (shotResult === null) {
    shotResult = thePlayer.shoot(theEnemy, indexToCoordinates(index));
  }
  refreshBoard2(theEnemy);
  if (shotResult === "miss") {
    turn = takeTurns();
    setTimeout(enemyShoots, 500);
  } else if (shotResult === "hit") {
    if (enemyShipsAliveCount() === 0) {
      displayMessage(5);
      endGame();
    } else if (enemyShipsAliveCount() === shipsAliveBefore - 1) {
      displayMessage(4);
    } else {
      displayMessage(3);
    }
  }
}

function enemyShoots() {
  displayMessage(2);
  setTimeout(() => {
    let shotResult = theEnemy.shoot(thePlayer);
    while (!shotResult) {
      shotResult = theEnemy.shoot(thePlayer);
    }
    refreshBoard1(thePlayer);
    if (shotResult === "hit") {
      if (checkPlayerShips() === "AI WON") {
        displayMessage(6);
        endGame();
      } else {
        enemyShoots();
      }
    } else {
      displayMessage(1);
      turn = takeTurns();
    }
  }, 1000);
}

function checkPlayerShips() {
  const shipsAlive = thePlayer.ships.filter((ship) => {
    if (ship.isAlive) return ship;
  });
  if (shipsAlive.length === 0) return "AI WON";
}

function enemyShipsAliveCount() {
  const shipsAlive = theEnemy.ships.filter((ship) => {
    if (ship.isAlive) return ship;
  });
  return shipsAlive.length;
}

export function bindRMB() {
  const board1Cells = board1.querySelectorAll(".cell");
  board1Cells.forEach((cell) => {
    cell.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      toggleShipDirection();
      board1Cells.forEach((cell) => {
        cell.classList.remove("cell--hover");
      });
      renderShipProjection(cell);
    });
  });
}

function toggleShipDirection() {
  if (currentShipDirection === "up") {
    currentShipDirection = "right";
  } else {
    currentShipDirection = "up";
  }
}

function endGame() {
  alert("THE END!");
}

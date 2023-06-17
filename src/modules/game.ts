import { Coords, SquareGrid } from "./utility";

class Ship {
  size: number;
  health: number;
  isAlive: boolean;

  constructor(size: number) {
    this.size = size;
    this.health = size;
    this.isAlive = true;
  }

  getHit() {
    if (this.health <= 0 || !this.isAlive) return;
    this.health -= 1;
    if (this.health <= 0) {
      this.isAlive = false;
    }
  }
}

class BoardCell {
  isHit: boolean;
  ship: Ship | null;
  isOccupied: boolean;

  constructor() {
    this.isHit = false;
    this.ship = null;
    this.isOccupied = false;
  }
}

class Gameboard {
  grid: SquareGrid;
  boardSize: number;
  shipsOnGameboard: Array<Ship>;
  shotsCounter: number;
  shotsOnTargetCounter: number;

  constructor(boardSize: number) {
    this.grid = new SquareGrid(boardSize, BoardCell);
    this.boardSize = boardSize;
    this.shipsOnGameboard = [];
    this.shotsCounter = 0;
    this.shotsOnTargetCounter = 0;
  }

  calculateBodyCoords(size: number, frontPos: Coords, facing: "up" | "right") {
    const result: Array<Coords> = [];
    if (facing === "up") {
      for (let i = 0; i < size; i++) {
        result.push({ x: frontPos.x, y: frontPos.y + i });
      }
    } else if (facing === "right") {
      for (let i = 0; i < size; i++) {
        result.push({ x: frontPos.x - i, y: frontPos.y });
      }
    }
    return result;
  }

  blockAdjacentCoords(pos: Coords) {
    const deltas = [
      [-1, 1],
      [0, 1],
      [1, 1],
      [-1, 0],
      [1, 0],
      [-1, -1],
      [0, -1],
      [1, -1],
    ];
    for (const delta of deltas) {
      const cellCoords = { x: pos.x + delta[0], y: pos.y + delta[1] };
      if (cellCoords.x < 1 || cellCoords.x > this.boardSize) continue;
      if (cellCoords.y < 1 || cellCoords.y > this.boardSize) continue;
      if (this.grid.at(cellCoords).isOccupied) continue;
      this.grid.at(cellCoords).isOccupied = true;
    }
  }

  checkPositionLegal(size: number, frontPos: Coords, facing: "up" | "right") {
    const bodyCoords = this.calculateBodyCoords(size, frontPos, facing);
    for (const pos of bodyCoords) {
      if (pos.x < 1 || pos.x > this.boardSize) return false;
      if (pos.y < 1 || pos.y > this.boardSize) return false;
      if (this.grid.at(pos).isOccupied) return false;
    }
    return true;
  }

  placeShip(ship: Ship, frontPos: Coords, facing: "up" | "right") {
    if (this.shipsOnGameboard.includes(ship)) return;
    if (!this.checkPositionLegal(ship.size, frontPos, facing)) return;
    const bodyCoords = this.calculateBodyCoords(ship.size, frontPos, facing);
    for (const pos of bodyCoords) {
      this.grid.at(pos).ship = ship;
      this.grid.at(pos).isOccupied = true;
      this.blockAdjacentCoords(pos);
    }
    this.shipsOnGameboard.push(ship);
  }

  receiveShot(pos: Coords) {
    let cell = this.grid.at(pos);
    if (cell.isHit) return;
    cell.isHit = true;
    this.shotsCounter++;
    if (cell.ship) {
      cell.ship.getHit();
      this.shotsOnTargetCounter++;
    }
  }
}

class Player {
  constructor() {}
}

class AI extends Player {
  constructor() {
    super();
  }
}

module.exports = { Ship, BoardCell, Gameboard };

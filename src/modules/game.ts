import { Coords, SquareGrid } from "./utility";

class Ship {
  size: number;
  health: number;
  isAlive: boolean;
  bodyCoords: Array<Coords>;

  constructor(size: number) {
    this.size = size;
    this.health = size;
    this.isAlive = true;
    this.bodyCoords = [];
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
    ship.bodyCoords.push(...bodyCoords);
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

export class Player {
  gameboard: Gameboard;
  ships: Array<Ship>;

  constructor() {
    this.gameboard = new Gameboard(10);
    this.ships = [...this.initShips()];
  }

  initShips() {
    const result = [new Ship(5)];
    result.push(new Ship(4), new Ship(4));
    result.push(new Ship(3), new Ship(3), new Ship(3));
    result.push(new Ship(2), new Ship(2), new Ship(2));
    return result;
  }

  placeShipSuccessfully(ship: Ship, frontPos: Coords, facing: "up" | "right") {
    const currentShipsOnBoard = this.gameboard.shipsOnGameboard.length;
    this.gameboard.placeShip(ship, frontPos, facing);
    if (this.gameboard.shipsOnGameboard.length === currentShipsOnBoard + 1) return true;
    return false;
  }

  shoot(opponent: Player, pos: Coords): "hit" | "miss" | null {
    const currentShotsCounter = opponent.gameboard.shotsCounter; // to check if same shot was attempted before
    const currentShotsOnTarget = opponent.gameboard.shotsOnTargetCounter; // to check if it hit a ship
    opponent.gameboard.receiveShot(pos);
    if (opponent.gameboard.shotsCounter === currentShotsCounter) return null;
    if (opponent.gameboard.shotsOnTargetCounter > currentShotsOnTarget) return "hit";
    return "miss";
  }

  countShipsAlive() {
    return this.ships.filter((ship) => {
      if (ship.isAlive === true) return ship;
    }).length;
  }
}

export class AI extends Player {
  clue: Coords | null;
  clueDeltas: Array<any>;
  impossibleCoords: Set<string>;

  constructor() {
    super();
    this.clue = null;
    this.clueDeltas = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];
    this.impossibleCoords = new Set();
  }

  shoot(opponent: Player, pos?: Coords): "hit" | "miss" | null {
    if (pos) {
      const countOfShipsAlive = opponent.countShipsAlive();
      const shotResult = Player.prototype.shoot(opponent, pos);
      if (shotResult === "hit") {
        if (this.clue) {
          if (this.clue.x === pos.x + 1 || this.clue.x === pos.x - 1) {
            this.clueDeltas = [
              [1, 0],
              [-1, 0],
            ];
          } else {
            this.clueDeltas = [
              [0, 1],
              [0, -1],
            ];
          }
        }
        this.clue = pos; // update clues

        const newCountOfShipsAlive = opponent.countShipsAlive();

        if (countOfShipsAlive === newCountOfShipsAlive + 1) {
          this.clue = null; // forget all clues
          this.clueDeltas = [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0],
          ];

          const theShip = opponent.gameboard.grid.at(pos).ship;
          for (const cell of theShip.bodyCoords) {
            this.pushImpossibleCoords(cell);
          }
        }
      }
      return shotResult;
    } else if (this.clue === null) {
      return this.shootRandomly(opponent);
    } else {
      return this.shootWithClue(opponent);
    }
  }

  shootRandomly(opponent: Player) {
    const countOfShipsAlive = opponent.countShipsAlive();

    let randomPosition = this.getRandomPosition();
    let safeLoop = 0;
    while ([...this.impossibleCoords].includes(`${randomPosition.x}-${randomPosition.y}`)) {
      randomPosition = this.getRandomPosition();
      // (if impossible to hit anything, get another position)
      safeLoop++;
      if (safeLoop > 1499) throw new Error("Something went wrong");
    }
    safeLoop = 0;
    let shotResult = Player.prototype.shoot(opponent, randomPosition);
    while (shotResult === null) {
      randomPosition = this.getRandomPosition();
      shotResult = Player.prototype.shoot(opponent, randomPosition); // if mistake, try again
      safeLoop++;
      if (safeLoop > 1499) throw new Error("Something went wrong");
    }
    if (shotResult === "hit") {
      this.clue = randomPosition; // update clues

      const newCountOfShipsAlive = opponent.countShipsAlive();

      if (countOfShipsAlive === newCountOfShipsAlive + 1) {
        this.clue = null; // forget all clues

        const theShip = opponent.gameboard.grid.at(randomPosition).ship;
        for (const cell of theShip.bodyCoords) {
          this.pushImpossibleCoords(cell);
        }
      }
    }
    return shotResult;
  }

  shootWithClue(opponent: Player): "hit" | "miss" | null {
    const deltas = this.clueDeltas;
    const { x, y } = this.clue!;
    let randomDelta = deltas[Math.floor(Math.random() * deltas.length)];
    let possibleShot = { x: x + randomDelta[0], y: y + randomDelta[1] };
    let safeLoop = 0;
    while (
      [...this.impossibleCoords].includes(`${possibleShot.x}-${possibleShot.y}`) ||
      opponent.gameboard.grid.at(possibleShot).isHit === true ||
      possibleShot.x < 1 ||
      possibleShot.x > 10 ||
      possibleShot.y < 1 ||
      possibleShot.y > 10
    ) {
      randomDelta = deltas[Math.floor(Math.random() * deltas.length)];
      possibleShot = { x: x + randomDelta[0], y: y + randomDelta[1] };
      // (when shot invalid, try again)
      safeLoop++;
      if (safeLoop > 10) break;
    }
    if (safeLoop > 10) {
      this.clue = null; // if no result, forget clue
      return null;
    }
    return this.shoot(opponent, possibleShot);
  }

  getRandomPosition() {
    const randomX = Math.ceil(Math.random() * 10);
    const randomY = Math.ceil(Math.random() * 10);
    return { x: randomX, y: randomY };
  }

  pushImpossibleCoords(pos: Coords) {
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
      if (cellCoords.x < 1 || cellCoords.x > 10) continue;
      if (cellCoords.y < 1 || cellCoords.y > 10) continue;
      if ([...this.impossibleCoords].includes(`${cellCoords.x}-${cellCoords.y}`)) continue;
      this.impossibleCoords.add(`${cellCoords.x}-${cellCoords.y}`);
    }
  }
}

module.exports = { Ship, Gameboard, Player, AI };

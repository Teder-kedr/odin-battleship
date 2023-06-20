const { Ship, Gameboard, Player, AI } = require("../game");

describe("Ship class", () => {
  const s = new Ship(5);
  it("loses health when hit", () => {
    s.getHit();
    expect(s.health).toBe(4);
  });

  it("dies", () => {
    s.getHit();
    s.getHit();
    s.getHit();
    expect(s.isAlive).toBe(true);
    s.getHit();
    expect(s.health).toBe(0);
    expect(s.isAlive).toBe(false);
  });
});

describe("Gameboard class", () => {
  it("calculates position of a ship", () => {
    const g = new Gameboard(4);
    expect(g.calculateBodyCoords(2, { x: 1, y: 1 }, "up")).toEqual([
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ]);
    expect(g.calculateBodyCoords(2, { x: 3, y: 4 }, "right")).toEqual([
      { x: 3, y: 4 },
      { x: 2, y: 4 },
    ]);
    expect(g.calculateBodyCoords(4, { x: 4, y: 2 }, "right")).toEqual([
      { x: 4, y: 2 },
      { x: 3, y: 2 },
      { x: 2, y: 2 },
      { x: 1, y: 2 },
    ]);
  });

  it("checks that ship is placed inside of grid bounds", () => {
    const g = new Gameboard(4);
    expect(g.checkPositionLegal(5, { x: 1, y: 1 }, "up")).toBe(false);
    expect(g.checkPositionLegal(4, { x: 1, y: 1 }, "up")).toBe(true);
    expect(g.checkPositionLegal(5, { x: 1, y: 1 }, "right")).toBe(false);
    expect(g.checkPositionLegal(2, { x: -1, y: 1024 }, "right")).toBe(false);
    expect(g.checkPositionLegal(4, { x: 4, y: 4 }, "right")).toBe(true);
    expect(g.checkPositionLegal(3, { x: 2, y: 4 }, "right")).toBe(false);
  });

  it("puts the ship on the gameboard", () => {
    const g = new Gameboard(4);
    const s = new Ship(2);
    g.placeShip(s, { x: 3, y: 3 }, "right");
    expect(g.shipsOnGameboard.length).toBe(1);
    expect(g.grid.at({ x: 2, y: 3 }).ship).toBe(s);
    expect(g.grid.at({ x: 3, y: 3 }).ship).toBe(s);
    expect(g.grid.at({ x: 1, y: 3 }).ship).toBeNull();
    expect(g.grid.at({ x: 4, y: 3 }).ship).toBeNull();
  });

  it("puts multiple ships on the gameboard", () => {
    const g = new Gameboard(10);
    const s1 = new Ship(10);
    const s2 = new Ship(1);
    const s3 = new Ship(5);
    g.placeShip(s1, { x: 2, y: 1 }, "up");
    g.placeShip(s2, { x: 5, y: 5 }, "right");
    g.placeShip(s3, { x: 8, y: 3 }, "up");
    expect(g.shipsOnGameboard.length).toBe(3);
    expect(g.shipsOnGameboard).toContain(s1);
    expect(g.shipsOnGameboard).toContain(s2);
    expect(g.shipsOnGameboard).toContain(s3);
    const occupiedCells = g.grid.cells.filter((cell) => {
      if (cell.isOccupied) return cell;
    });
    expect(occupiedCells.length).toEqual(30 + 9 + 21);
  });

  it("doesn't put ships on top of each other", () => {
    const g = new Gameboard(5);
    g.placeShip(new Ship(2), { x: 2, y: 2 }, "up");
    expect(g.shipsOnGameboard.length).toBe(1);
    g.placeShip(new Ship(1), { x: 2, y: 2 }, "right");
    expect(g.shipsOnGameboard.length).toBe(1);
    g.placeShip(new Ship(3), { x: 4, y: 3 }, "right");
    expect(g.shipsOnGameboard.length).toBe(1);
  });

  it("doesn't put ships right next to each other", () => {
    const g = new Gameboard(10);
    g.placeShip(new Ship(2), { x: 10, y: 1 }, "up");
    expect(g.shipsOnGameboard.length).toBe(1);
    g.placeShip(new Ship(3), { x: 9, y: 1 }, "up");
    expect(g.shipsOnGameboard.length).toBe(1);
    g.placeShip(new Ship(7), { x: 9, y: 2 }, "up");
    expect(g.shipsOnGameboard.length).toBe(1);
  });

  it("is able to process shots", () => {
    const g = new Gameboard(4);
    g.receiveShot({ x: 1, y: 1 });
    g.receiveShot({ x: 1, y: 2 });
    g.receiveShot({ x: 2, y: 1 });
    const hitCells = g.grid.cells.filter((cell) => {
      if (cell.isHit) return cell;
    });
    expect(hitCells.length).toBe(3);
    expect(g.shotsCounter).toBe(3);

    const s = new Ship(1);
    g.placeShip(s, { x: 4, y: 4 }, "up");
    g.receiveShot({ x: 4, y: 4 });
    expect(g.shotsCounter).toBe(4);
    expect(s.isAlive).toBe(false);
    expect(g.shotsOnTargetCounter).toBe(1);
  });
});

describe("Player class", () => {
  it("starts with correct number of ships", () => {
    const p = new Player();
    expect(p.ships.length).toBe(1 + 2 + 2 + 3);
  });

  it("can place ships", () => {
    const p = new Player();
    expect(p.placeShipSuccessfully(p.ships[0], { x: 1, y: 1 }, "up")).toBe(true);
    expect(p.placeShipSuccessfully(p.ships.at(-1), { x: 10, y: 10 }, "right")).toBe(true);
  });

  it("can't place ships where it shouldn't", () => {
    const p = new Player();
    p.placeShipSuccessfully(p.ships[0], { x: 1, y: 1 }, "up");
    expect(p.placeShipSuccessfully(p.ships[1], { x: 2, y: 1 }, "up")).toBe(false);
    p.placeShipSuccessfully(p.ships.at(-1), { x: 5, y: 5 }, "up");
    expect(p.placeShipSuccessfully(p.ships.at(-2), { x: 5, y: 7 }, "up")).toBe(false);
    p.placeShipSuccessfully(p.ships.at(-2), { x: 8, y: 7 }, "up");
    p.placeShipSuccessfully(p.ships.at(-3), { x: 8, y: 7 }, "up");
    p.placeShipSuccessfully(p.ships.at(-4), { x: 8, y: 7 }, "up");
    expect(p.gameboard.shipsOnGameboard.length).toBe(3);
  });

  it("can shoot", () => {
    const p = new Player();
    const p2 = new Player();
    const result = p.shoot(p2, { x: 1, y: 1 });
    expect(result).toEqual("miss");
    const newResult = p.shoot(p2, { x: 1, y: 1 });
    expect(newResult).toBeNull();
  });

  it("can hit opponents boats", () => {
    const p = new Player();
    const p2 = new Player();
    p2.placeShipSuccessfully(p2.ships.at(-1), { x: 6, y: 5 }, "right");
    const shot = p.shoot(p2, { x: 6, y: 5 });
    expect(shot).toEqual("hit");
    const shot2 = p.shoot(p2, { x: 6, y: 5 });
    expect(shot2).toBeNull;
    p.shoot(p2, { x: 5, y: 5 });
    expect(p2.ships.at(-1).health).toBe(0);
  });
});

describe("AI class", () => {
  it("can shoot", () => {
    const p = new Player();
    const ai = new AI();
    ai.shoot(p);
    expect(p.gameboard.shotsCounter).toBe(1);
    const shot = ai.shoot(p);
    expect(shot).toEqual("miss");
    expect(p.gameboard.shotsCounter).toBe(2);
  });

  it("can hit a ship", () => {
    const p = new Player();
    const ai = new AI();
    p.placeShipSuccessfully(p.ships.at(-1), { x: 1, y: 1 }, "up");
    ai.shoot(p, { x: 1, y: 1 });
    expect(p.gameboard.shotsCounter).toBe(1);
    expect(p.gameboard.shotsOnTargetCounter).toBe(1);
    const shotResult = ai.shoot(p, { x: 1, y: 2 });
    expect(shotResult).toEqual("hit");
    expect(p.gameboard.shotsOnTargetCounter).toBe(2);
    expect(p.ships.at(-1).isAlive).toBe(false);
  });
});

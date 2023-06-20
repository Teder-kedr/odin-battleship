export type Coords = {
  x: number;
  y: number;
};

export class SquareGrid {
  size: number;
  cells: Array<any>;

  constructor(size: number, ItemClass) {
    this.size = size;
    this.cells = Array.from({ length: this.size * this.size }, () => new ItemClass());
  }

  at(pos: Coords) {
    if (pos.x < 1 || pos.x > this.size) return;
    if (pos.y < 1 || pos.y > this.size) return;
    const index = this.size * (pos.y - 1) + pos.x - 1;
    return this.cells[index];
  }

  atIndex(index: number) {
    return this.cells[index];
  }
}

export function indexToCoordinates(index: number): Coords {
  const gridSize = 10;
  const x = index % gridSize;
  const y = Math.floor(index / gridSize);

  return { x: x + 1, y: y + 1 };
}

export function getRandomShipDirection(): "up" | "right" {
  if (Math.random() > 0.5) return "up";
  return "right";
}

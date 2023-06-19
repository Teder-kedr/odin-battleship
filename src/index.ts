import { Player, AI } from "./modules/game";
import { init as initDisplay, refreshBoard1, refreshBoard2, changeText } from "./modules/display";

initDisplay();
const p = new Player();
const ai = new AI();
p.placeShipSuccessfully(p.ships[0], { x: 3, y: 3 }, "up");
ai.placeShipSuccessfully(ai.ships[0], { x: 3, y: 3 }, "up");
ai.shoot(p);
ai.shoot(p);
ai.shoot(p);
ai.shoot(p);
ai.shoot(p);
ai.shoot(p);
ai.shoot(p);

p.shoot(ai, { x: 1, y: 1 });
p.shoot(ai, { x: 2, y: 2 });
p.shoot(ai, { x: 3, y: 3 });
p.shoot(ai, { x: 3, y: 4 });
p.shoot(ai, { x: 3, y: 5 });
p.shoot(ai, { x: 3, y: 6 });
p.shoot(ai, { x: 3, y: 7 });
refreshBoard1(p);
refreshBoard2(ai);
console.log(ai.clue);
console.log(ai.clueDeltas);
console.log(ai.impossibleCoords);

import { Player, AI } from "./modules/game";
import {
  init as initDisplay,
  refreshBoard1,
  refreshBoard2,
  displayMessage,
} from "./modules/display";
import {
  bindBoard1,
  bindBoard2,
  bindRMB,
  updateCurrentShipToPlace,
  setPlayer,
  setEnemy,
} from "./modules/controller";
import { getRandomShipDirection } from "./modules/utility";

// On page load creation and rendering
initDisplay();
const p = new Player();
const ai = new AI();
setPlayer(p);
setEnemy(ai);
refreshBoard1(p);
refreshBoard2(ai);
updateCurrentShipToPlace(p.ships[0]);
bindBoard1();
bindRMB();
displayMessage(0);

export function startGameToggle() {
  startGame();
}

export function startGame() {
  aiPlaceShipsRandomly();
  bindBoard2();
  displayMessage(1);
}

function aiPlaceShipsRandomly() {
  for (const ship of ai.ships) {
    let shipIsPlaced = ai.placeShipSuccessfully(
      ship,
      ai.getRandomPosition(),
      getRandomShipDirection()
    );
    while (!shipIsPlaced) {
      shipIsPlaced = ai.placeShipSuccessfully(
        ship,
        ai.getRandomPosition(),
        getRandomShipDirection()
      );
    }
  }
}

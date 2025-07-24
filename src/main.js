// src/main.js

import Game from "./engine/Game.js";
import AssetLoader from "./engine/AssetLoader.js";
import Input from "./engine/Input.js";
import BootScene from "./scenes/BootScene.js";
import GameScene from "./scenes/GameScene.js";
import { generateRandomMap } from "./scenes/GameScene.js";

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const loader = new AssetLoader();
const input = new Input(canvas);

loader
  .loadAssets({
    player: "assets/sprites/lucile.png",
    enemy: "assets/sprites/bug_glitch.png",
    weapon: "assets/sprites/sword.png",
    computer: "assets/sprites/computer.png",
    tileset: "assets/tilesets/tiles.png",
  })
  .then((assets) => {
    const game = new Game({ canvas, ctx, assets, input });
    const cols = Math.ceil(canvas.width / 32);
    const rows = Math.ceil(canvas.height / 32);
    const simpleMap = generateRandomMap(cols, rows);
    // On passe map + tileset à la scène
    const gameScene = new GameScene(simpleMap, 32, assets.tileset);
    game.scene.add("Boot", new BootScene());
    game.scene.add("Game", gameScene);
    game.scene.start("Boot");
  });

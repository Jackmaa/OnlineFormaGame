// src/main.js
import Game from "./engine/Game.js";
import AssetLoader from "./engine/AssetLoader.js";
import Input from "./engine/Input.js";
import CharacterSelectScene from "./scenes/CharacterSelectScene.js";
import GameScene from "./scenes/GameScene.js";

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const loader = new AssetLoader();
const input = new Input(canvas);

// Liste des 16 personnages
const characters = [
  "vincent",
  "ahlem",
  "cedric",
  "christelle",
  "fabien",
  "illias",
  "leV",
  "lionel",
  "lucile",
  "marc",
  "mathieu",
  "sabah",
  "samy",
  "serge",
  "thomas",
  "valentin",
];

// Assets à charger
const assetsToLoad = {
  enemy: "assets/sprites/bug_glitch.png",
  weapon: "assets/sprites/sword.png",
  xpGem: "assets/sprites/xp_gem.png",
  tileset: "assets/tilesets/tiles.png",
};

// Ajouter les sprites des personnages
characters.forEach((char) => {
  assetsToLoad[char] = `assets/sprites/${char}.png`;
});

loader
  .loadAssets(assetsToLoad)
  .then((assets) => {
    // Masquer l'écran de chargement
    const loadingEl = document.getElementById("loading");
    if (loadingEl) loadingEl.style.display = "none";

    const game = new Game({ canvas, ctx, assets, input });

    // Stocker les sprites de personnages
    game.characterSprites = {};
    characters.forEach((char) => {
      game.characterSprites[char] = assets[char];
    });

    // Sprite par défaut
    game.assets.player = assets.vincent;

    // Générer la carte
    const cols = Math.ceil(canvas.width / 32);
    const rows = Math.ceil(canvas.height / 32);
    const simpleMap = generateRandomMap(cols, rows);

    const gameScene = new GameScene(simpleMap, 32, assets.tileset);

    game.scene.add("CharacterSelect", new CharacterSelectScene());
    game.scene.add("Game", gameScene);

    // Démarrer avec la sélection de personnage
    game.scene.start("CharacterSelect");
  })
  .catch((err) => {
    console.error("Erreur de chargement des assets:", err);
  });

// Générateur de carte aléatoire
export function generateRandomMap(cols, rows) {
  const map = [];
  for (let y = 0; y < rows; y++) {
    const row = [];
    for (let x = 0; x < cols; x++) {
      if (y === 0 || y === rows - 1 || x === 0 || x === cols - 1) {
        row.push(4); // Mur
      } else {
        const r = Math.random();
        row.push(r < 0.5 ? 0 : r < 0.7 ? 3 : r < 0.9 ? 2 : 4);
      }
    }
    map.push(row);
  }
  return map;
}

// src/engine/TileMap.js

export default class TileMap {
  /**
   * @param {number[][]} mapArray   Tableau 2D d’IDs (1, 2, …)
   * @param {number}     tileSize   Taille (px) de chaque tuile
   * @param {HTMLImageElement} tileset  Image tileset (chargée via AssetLoader)
   */
  constructor(mapArray, tileSize, tileset) {
    this.map = mapArray;
    this.tileSize = tileSize;
    this.tileset = tileset;
    // Nombre de colonnes dans l'image tileset
    this.columns = Math.floor(tileset.width / tileSize);
  }

  render(ctx) {
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        const id = this.map[y][x];

        const idx = id;
        const sx = (idx % this.columns) * this.tileSize;
        const sy = Math.floor(idx / this.columns) * this.tileSize;
        const dx = x * this.tileSize;
        const dy = y * this.tileSize;

        ctx.drawImage(
          this.tileset,
          sx,
          sy,
          this.tileSize,
          this.tileSize, // source
          dx,
          dy,
          this.tileSize,
          this.tileSize // destination
        );
      }
    }
  }
}

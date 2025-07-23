/* src/engine/AssetLoader.js */
export default class AssetLoader {
  constructor() {
    this.assets = {};
  }
  loadAssets(manifest) {
    return Promise.all(
      Object.entries(manifest).map(([k, src]) => {
        if (src.match(/\.(png|jpg)$/)) return this.loadImage(k, src);
        return Promise.resolve();
      })
    ).then(() => this.assets);
  }
  loadImage(key, src) {
    return new Promise((res) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.assets[key] = img;
        res();
      };
    });
  }
}

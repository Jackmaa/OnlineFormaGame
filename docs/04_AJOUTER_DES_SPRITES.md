# Guide : Ajouter des sprites/ressources

Ce guide explique comment ajouter de nouveaux sprites et ressources au jeu.

## Structure des assets

Les sprites sont chargés via le système `AssetLoader` et stockés dans `game.assets`.

## Étapes d'implémentation

### 1. Placer le fichier sprite

Placez votre fichier image dans le dossier approprié :

```
assets/
  sprites/
    mon_sprite.png    ← Votre nouveau sprite
    weapon_sprites/
      nouvelle_arme.png  ← Ou dans un sous-dossier
  tilesets/
    mon_tileset.png
```

**Formats supportés** : `.png`, `.jpg`

### 2. Déclarer dans le manifest

Dans `src/main.js`, ajoutez votre sprite dans `assetsToLoad` :

```javascript
// Assets à charger
const assetsToLoad = {
  enemy: "assets/sprites/bug_glitch.png",
  weapon: "assets/sprites/sword.png",
  xpGem: "assets/sprites/xp_gem.png",
  tileset: "assets/tilesets/tiles.png",
  
  // Nouveaux sprites
  monSprite: "assets/sprites/mon_sprite.png",
  nouvelleArme: "assets/sprites/weapon_sprites/nouvelle_arme.png",
  monEnnemi: "assets/sprites/mon_ennemi.png",
};
```

### 3. Utiliser le sprite dans le code

#### Dans une scène (GameScene, etc.)

```javascript
// Le sprite est disponible dans game.assets
const sprite = this.game.assets.monSprite;

// Utiliser pour créer une entité
const entity = new MaNouvelleEntite(x, y, sprite, 32);
```

#### Dans une arme

```javascript
// Dans GameScene.createWeapon()
case "nouvelleArme":
  return new MaNouvelleArme(player, this.game.assets.nouvelleArme);
```

#### Dans un ennemi

```javascript
// Dans WaveManager.createEnemy()
const enemy = new MonEnnemi(x, y, this.game.assets.monEnnemi, 40);
```

### 4. Exemple complet : Nouvelle arme avec sprite

#### Étape 1 : Ajouter le sprite dans main.js

```javascript
const assetsToLoad = {
  // ... autres assets
  lance: "assets/sprites/lance.png", // ← Nouveau sprite
};
```

#### Étape 2 : Créer l'arme

```javascript
// src/weapons/Lance.js
import BaseWeapon from "./BaseWeapon.js";

export default class Lance extends BaseWeapon {
  constructor(player, sprite) {
    super(player, sprite);
    // ... reste du code
  }
  
  render(ctx) {
    // Le sprite est déjà passé au constructeur
    ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
  }
}
```

#### Étape 3 : Intégrer dans GameScene

```javascript
// src/scenes/GameScene.js
import Lance from "../weapons/Lance.js";

createWeapon(weaponType, player, sprite) {
  switch (weaponType) {
    case "lance":
      return new Lance(player, this.game.assets.lance); // ← Utiliser le sprite chargé
    // ...
  }
}
```

## Sprites spéciaux

### Sprites de personnages

Les sprites de personnages sont chargés automatiquement :

```javascript
// Dans main.js
const characters = [
  "vincent",
  "ahlem",
  // ... autres personnages
];

// Chargement automatique
characters.forEach((char) => {
  assetsToLoad[char] = `assets/sprites/${char}.png`;
});

// Stockage séparé
game.characterSprites = {};
characters.forEach((char) => {
  game.characterSprites[char] = assets[char];
});
```

Pour ajouter un nouveau personnage avec sprite :

1. Placer le sprite : `assets/sprites/nouveau_personnage.png`
2. Ajouter dans `characters` array dans `main.js`
3. Le sprite sera chargé automatiquement

### Sprites animés (spritesheets)

Pour les sprites animés, vous devez gérer l'animation manuellement :

```javascript
class AnimatedSprite {
  constructor(spriteSheet, frameWidth, frameHeight, frameCount) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameCount = frameCount;
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.frameDuration = 0.1; // 10 FPS
  }

  update(dt) {
    this.frameTimer += dt;
    if (this.frameTimer >= this.frameDuration) {
      this.frameTimer = 0;
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
    }
  }

  render(ctx, x, y, width, height) {
    const sx = this.currentFrame * this.frameWidth;
    ctx.drawImage(
      this.spriteSheet,
      sx, 0, this.frameWidth, this.frameHeight, // Source
      x, y, width, height // Destination
    );
  }
}

// Utilisation
const spriteSheet = game.assets.monSpriteSheet;
const animation = new AnimatedSprite(spriteSheet, 32, 32, 4);

// Dans update()
animation.update(dt);

// Dans render()
animation.render(ctx, this.x, this.y, this.width, this.height);
```

### Tilesets

Pour les tilesets (cartes de jeu) :

```javascript
// Dans main.js
const assetsToLoad = {
  tileset: "assets/tilesets/tiles.png",
  monTileset: "assets/tilesets/mon_tileset.png",
};

// Utilisation dans TileMap
const tileMap = new TileMap(mapArray, tileSize, game.assets.monTileset);
```

## Organisation des sprites

### Structure recommandée

```
assets/
  sprites/
    characters/
      vincent.png
      ahlem.png
    weapons/
      sword.png
      lance.png
      bow.png
    enemies/
      bug.png
      goblin.png
      boss.png
    items/
      xp_gem.png
      power_up.png
    effects/
      explosion.png
      particles.png
  tilesets/
    tiles.png
    dungeon.png
```

### Conventions de nommage

- **Personnages** : `nom_personnage.png` (ex: `vincent.png`)
- **Armes** : `nom_arme.png` (ex: `sword.png`, `lance.png`)
- **Ennemis** : `nom_ennemi.png` (ex: `bug_glitch.png`, `goblin.png`)
- **Items** : `nom_item.png` (ex: `xp_gem.png`)
- **Tilesets** : `nom_tileset.png` (ex: `tiles.png`)

Utilisez des **minuscules** et des **underscores** (`_`) pour les espaces.

## Exemple complet : Nouveau personnage avec sprites multiples

Si votre personnage a plusieurs sprites (face, dos, gauche, droite) :

```javascript
// Dans main.js
const characters = [
  "vincent",
  "nouveau_personnage", // ← Nouveau
];

// Charger les sprites directionnels
const assetsToLoad = {
  // ... autres assets
  nouveau_personnage: "assets/sprites/nouveau_personnage.png",
  nouveau_personnage_dos: "assets/sprites/nouveau_personnage_dos.png",
  nouveau_personnage_gauche: "assets/sprites/nouveau_personnage_gauche.png",
  nouveau_personnage_droite: "assets/sprites/nouveau_personnage_droite.png",
};

// Dans Player.js ou GameScene
const characterId = "nouveau_personnage";
const sprites = {
  front: game.assets[characterId],
  back: game.assets[`${characterId}_dos`],
  left: game.assets[`${characterId}_gauche`],
  right: game.assets[`${characterId}_droite`],
};
```

## Optimisation

### Taille des sprites

- **Personnages/Ennemis** : 32x32, 64x64 pixels
- **Armes** : 24x24, 32x32, 48x48 pixels
- **Items** : 16x16, 32x32 pixels
- **Tilesets** : Multiples de 32 (32x32, 64x64 par tile)

### Formats

- **PNG** : Meilleur pour sprites avec transparence
- **JPG** : Pour backgrounds/images sans transparence

## Checklist

- [ ] Fichier sprite placé dans `assets/sprites/` (ou sous-dossier)
- [ ] Sprite déclaré dans `assetsToLoad` dans `main.js`
- [ ] Sprite utilisé dans le code (arme, ennemi, etc.)
- [ ] Testé dans le jeu
- [ ] Taille appropriée pour le rendu
- [ ] Format adapté (PNG pour transparence)

## Dépannage

### Le sprite ne s'affiche pas

1. Vérifier que le chemin dans `assetsToLoad` est correct
2. Vérifier que le fichier existe bien
3. Vérifier que `game.assets.nomSprite` n'est pas `undefined`
4. Vérifier la console pour les erreurs de chargement

### Le sprite est déformé

Ajuster les dimensions dans le code :

```javascript
// Si le sprite original est 64x64 mais vous voulez 32x32
const width = 32;
const height = 32;
ctx.drawImage(this.sprite, x, y, width, height);

// Pour conserver les proportions
const width = 32;
const height = (width / this.sprite.width) * this.sprite.height;
```

### Le sprite ne se charge pas

Vérifier que `AssetLoader` charge bien l'image :

```javascript
loader.loadAssets(assetsToLoad)
  .then((assets) => {
    console.log("Assets chargés:", assets); // Vérifier ici
    // ...
  })
  .catch((err) => {
    console.error("Erreur:", err); // Vérifier les erreurs
  });
```


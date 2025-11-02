# Guide : Ajouter une nouvelle arme

Ce guide explique comment ajouter une nouvelle arme au jeu.

## Structure d'une arme

Toutes les armes héritent de la classe `BaseWeapon` et doivent implémenter certaines méthodes.

## Étapes d'implémentation

### 1. Créer le fichier de l'arme

Créez un nouveau fichier dans `src/weapons/` (ex: `src/weapons/MaNouvelleArme.js`).

```javascript
// src/weapons/MaNouvelleArme.js
import BaseWeapon from "./BaseWeapon.js";

export default class MaNouvelleArme extends BaseWeapon {
  constructor(player, sprite) {
    super(player, sprite);

    // ✅ Définir le type de dégâts
    // false = Burst (dégâts par hit, comme l'épée)
    // true = DPS (dégâts par seconde, comme les orbitales)
    this.isDPS = false; // ou true

    // Stats de base
    this.damage = 15; // Dégâts par hit (si isDPS = false) ou par seconde (si isDPS = true)
    this.width = 32;  // Largeur du sprite
    this.height = 32; // Hauteur du sprite

    // Propriétés spécifiques à votre arme
    this.range = 100;        // Portée (si applicable)
    this.attackSpeed = 1.5;   // Attaques par seconde (si applicable)
    this.projectileSpeed = 400; // Vitesse des projectiles (si applicable)
    
    // État interne
    this.timer = 0;
    this.isAttacking = false;
    
    // Référence aux ennemis (sera passée par GameScene)
    this.enemies = [];
  }

  update(dt) {
    // ✅ Toujours appeler super.update() pour le système de reset des hits
    super.update(dt);

    // Votre logique de mise à jour ici
    // Ex: décrémenter les timers, gérer les cooldowns, etc.
    this.timer -= dt;
    
    if (this.timer <= 0) {
      this.attack();
      this.timer = 1.0 / this.attackSpeed;
    }
  }

  getHitboxes() {
    // ✅ CRITIQUE: Retourner un tableau d'hitboxes
    // Chaque hitbox doit avoir : x, y, width, height, damage, angle
    const hitboxes = [];
    
    // Calculer les positions et retourner les hitboxes
    // Exemple simple:
    hitboxes.push({
      x: this.player.x,
      y: this.player.y,
      width: this.width,
      height: this.height,
      damage: this.damage, // Ne PAS multiplier par damageMultiplier ici
      angle: 0 // Angle en radians
    });

    return hitboxes;
  }

  render(ctx) {
    // Dessiner l'arme sur le canvas
    // Utiliser ctx.drawImage() pour le sprite
    const hitboxes = this.getHitboxes();
    
    hitboxes.forEach((hb) => {
      ctx.save();
      ctx.translate(hb.x + hb.width / 2, hb.y + hb.height / 2);
      ctx.rotate(hb.angle + Math.PI / 2);
      
      ctx.drawImage(
        this.sprite,
        -hb.width / 2,
        -hb.height / 2,
        hb.width,
        hb.height
      );
      
      ctx.restore();
    });
  }

  upgrade() {
    // Améliorer l'arme quand le niveau augmente
    this.level++;
    
    switch (this.level) {
      case 2:
        this.damage += 5;
        break;
      case 3:
        this.attackSpeed += 0.3;
        break;
      // ... autres niveaux
    }
  }

  /**
   * Met à jour la liste des ennemis pour le ciblage automatique
   * @param {Array} enemies - Tableau des ennemis
   */
  setEnemies(enemies) {
    this.enemies = enemies;
  }
}
```

### 2. Implémenter les méthodes obligatoires

#### `getHitboxes()`
- **Doit retourner** un tableau d'objets avec les propriétés :
  - `x`, `y` : Position de l'hitbox
  - `width`, `height` : Taille de l'hitbox
  - `damage` : Dégâts (sans multiplier par `damageMultiplier`, c'est fait dans `GameScene`)
  - `angle` : Angle en radians (optionnel mais recommandé)

#### `update(dt)`
- Appeler `super.update(dt)` pour le système de reset des hits
- Mettre à jour la logique de l'arme (timers, cooldowns, etc.)

#### `render(ctx)`
- Dessiner l'arme sur le canvas
- Utiliser `ctx.drawImage()` pour afficher le sprite

#### `upgrade()`
- Augmenter `this.level++`
- Ajouter des améliorations selon le niveau

### 3. Intégrer dans GameScene

Ajoutez votre arme dans `src/scenes/GameScene.js` :

```javascript
// Importer l'arme
import MaNouvelleArme from "../weapons/MaNouvelleArme.js";

// Dans la méthode createWeapon(), ajouter un cas :
createWeapon(weaponType, player, sprite) {
  switch (weaponType) {
    case "sword":
      return new Sword(player, sprite);
    case "orbital":
      return new OrbitalWeapon(player, sprite);
    case "projectile":
      return new ProjectileWeapon(player, sprite);
    case "maNouvelleArme": // ← Nouveau cas
      return new MaNouvelleArme(player, sprite);
    default:
      return new Sword(player, sprite);
  }
}
```

### 4. Ajouter comme arme de départ (optionnel)

Pour qu'un personnage puisse démarrer avec cette arme, modifiez `src/data/Characters.js` :

```javascript
export const CHARACTERS = {
  monPersonnage: {
    name: "Mon Personnage",
    sprite: "monPersonnage.png",
    description: "Description",
    startWeapon: "maNouvelleArme", // ← Utiliser votre nouveau type d'arme
    stats: {
      // ... stats
    },
  },
};
```

### 5. Charger le sprite (optionnel)

Si vous utilisez un sprite spécifique pour cette arme, ajoutez-le dans `src/main.js` :

```javascript
const assetsToLoad = {
  enemy: "assets/sprites/bug_glitch.png",
  weapon: "assets/sprites/sword.png",
  maNouvelleArme: "assets/sprites/ma_nouvelle_arme.png", // ← Nouveau sprite
  xpGem: "assets/sprites/xp_gem.png",
  tileset: "assets/tilesets/tiles.png",
};
```

Puis dans `GameScene.createWeapon()` :

```javascript
case "maNouvelleArme":
  return new MaNouvelleArme(player, assets.maNouvelleArme);
```

## Exemples de types d'armes

### Arme Burst (comme Sword)
- `isDPS = false`
- Dégâts appliqués à chaque hit
- Système de cooldown entre les attaques
- Exemple : épée, lance, hache

### Arme DPS (comme OrbitalWeapon)
- `isDPS = true`
- Dégâts appliqués en continu
- Pas de cooldown, dégâts constants
- Exemple : orbitales, aura, zone autour du joueur

### Arme Projectile (comme ProjectileWeapon)
- `isDPS = false`
- Tir de projectiles qui se déplacent
- Gestion de la portée et de la trajectoire
- Exemple : flèches, boules de feu, lasers

## Notes importantes

1. **Multiplicateurs du joueur** : Ne pas multiplier les dégâts dans `getHitboxes()`. `GameScene` applique automatiquement :
   - `damageMultiplier`
   - `areaMultiplier` (pour la portée/taille)
   - `cooldownMultiplier` (pour la vitesse d'attaque)

2. **Système de reset des hits** : `BaseWeapon` gère automatiquement le reset des hits pour éviter les dégâts multiples. Pour les armes burst, implémentez `shouldResetHits()` si nécessaire.

3. **Ciblage automatique** : Utilisez `this.enemies` (passé via `setEnemies()`) pour trouver les cibles les plus proches.

4. **Performance** : Évitez de créer trop d'objets dans `update()`. Réutilisez les structures existantes.

## Checklist

- [ ] Fichier créé dans `src/weapons/`
- [ ] Hérite de `BaseWeapon`
- [ ] Implémente `update(dt)`, `getHitboxes()`, `render(ctx)`, `upgrade()`
- [ ] Appelle `super.update(dt)` dans `update()`
- [ ] Ajouté dans `GameScene.createWeapon()`
- [ ] Sprite chargé (si nécessaire)
- [ ] Testé dans le jeu


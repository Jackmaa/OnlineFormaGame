# Guide : Ajouter un nouveau power-up

Ce guide explique comment ajouter un nouveau power-up au jeu.

## Structure d'un power-up

Tous les power-ups héritent de la classe `PowerUp` de base.

## Étapes d'implémentation

### 1. Créer la classe du power-up

Ajoutez votre classe dans `src/powerups/PowerUpRegistry.js` :

```javascript
// Dans PowerUpRegistry.js, ajoutez votre classe

class MonNouveauPowerUp extends PowerUp {
  constructor() {
    super({
      id: "monPowerUp",           // ID unique (en minuscules, pas d'espaces)
      name: "Mon Power-Up",       // Nom affiché
      description: "Description de l'effet",
      icon: "🎮",                  // Emoji ou icône
      maxLevel: 5,                 // Niveau maximum (1 = one-time use)
    });
  }

  apply(player) {
    // Appliquer l'effet au joueur
    // Cette méthode est appelée à chaque levelUp du power-up
    
    // Exemples d'effets :

    // Augmenter un multiplicateur
    if (!player.damageBonus) player.damageBonus = 1;
    player.damageBonus += 0.2; // +20% par niveau
    player.damageMultiplier = player.damageBonus;

    // Ajouter un bonus statique
    if (!player.projectileCount) player.projectileCount = 1;
    player.projectileCount += 1;

    // Activer une capacité spéciale
    if (!player.hasSpecialAbility) {
      player.hasSpecialAbility = true;
    }

    // Augmenter une stat de base
    player.maxHp += 2;
    if (player.setHp) {
      player.setHp(player.hp + 2);
    } else {
      player.hp += 2;
    }
  }
}
```

### 2. Enregistrer le power-up

Dans `PowerUpRegistry._initPowerUps()`, ajoutez votre power-up :

```javascript
_initPowerUps() {
  // Offensifs
  this.register(new DamagePowerUp());
  this.register(new CooldownPowerUp());
  this.register(new MonNouveauPowerUp()); // ← Ajouter ici

  // Défensifs
  this.register(new MaxHpPowerUp());
  // ...

  // Utilitaires
  this.register(new SpeedPowerUp());
  // ...
}
```

### 3. Catégoriser le power-up (optionnel)

Dans `PowerUpRegistry.getByCategory()`, ajoutez votre power-up dans la catégorie appropriée :

```javascript
getByCategory(category) {
  const categories = {
    offensive: [
      "damage",
      "cooldown",
      "area",
      "projectile",
      "monPowerUp", // ← Ajouter ici si offensif
      "luck",
      "ricochet",
      "pierce",
    ],
    defensive: ["maxhp", "heal", "regen"],
    utility: ["speed", "xpboost", "magnet"],
  };

  const ids = categories[category] || [];
  return ids.map((id) => this.get(id)).filter(Boolean);
}
```

## Types de power-ups

### Offensifs
- Augmentent les dégâts, vitesse d'attaque, portée, etc.
- Exemples : `DamagePowerUp`, `CooldownPowerUp`, `AreaPowerUp`, `ProjectilePowerUp`

### Défensifs
- Améliorent la survie
- Exemples : `MaxHpPowerUp`, `HealPowerUp`, `RegenPowerUp`

### Utilitaires
- Améliorent le gameplay général
- Exemples : `SpeedPowerUp`, `XpBoostPowerUp`, `MagnetPowerUp`, `LuckPowerUp`

## Exemples complets

### Power-up offensif simple

```javascript
class FirePowerUp extends PowerUp {
  constructor() {
    super({
      id: "fire",
      name: "Feu",
      description: "Ajoute des dégâts de feu de +5",
      icon: "🔥",
      maxLevel: 3,
    });
  }

  apply(player) {
    if (!player.fireDamage) player.fireDamage = 0;
    player.fireDamage += 5;
  }
}
```

### Power-up avec activation unique

```javascript
class ShieldPowerUp extends PowerUp {
  constructor() {
    super({
      id: "shield",
      name: "Bouclier",
      description: "Bloque 50% des dégâts pendant 10s",
      icon: "🛡️",
      maxLevel: 1, // One-time use
    });
  }

  apply(player) {
    if (!player.hasShield) {
      player.hasShield = true;
      player.shieldTimer = 10.0; // 10 secondes
      player.shieldMultiplier = 0.5; // 50% de dégâts
    }
  }
}
```

### Power-up qui augmente une capacité

```javascript
class RicochetPowerUp extends PowerUp {
  constructor() {
    super({
      id: "ricochet",
      name: "Ricochet",
      description: "Les projectiles rebondissent +1 fois",
      icon: "🔄",
      maxLevel: 3,
    });
  }

  apply(player) {
    // Augmenter le compteur
    if (!player.ricochetCount) player.ricochetCount = 0;
    player.ricochetCount += 1;

    // Activer le système de ricochet
    if (!player.hasRicochet) {
      player.hasRicochet = true;
    }
  }
}
```

## Propriétés du joueur disponibles

Voici les propriétés que vous pouvez modifier sur le `player` :

### Multiplicateurs
- `damageMultiplier` : Multiplicateur de dégâts
- `cooldownMultiplier` : Multiplicateur de cooldown (1.0 = normal, <1.0 = plus rapide)
- `xpMultiplier` : Multiplicateur d'XP gagnée
- `areaMultiplier` : Multiplicateur de portée/taille des armes
- `luckMultiplier` : Multiplicateur de chance de drop
- `bossDamageMultiplier` : Multiplicateur de dégâts vs bosses

### Stats de base
- `maxHp` : Points de vie maximum
- `hp` : Points de vie actuels (utiliser `setHp()` si disponible)
- `speed` : Vitesse de déplacement

### Capacités spéciales
- `critChance` : Chance de coup critique (0.0 à 1.0)
- `dodgeChance` : Chance d'esquive (0.0 à 1.0)
- `projectileCount` : Nombre de projectiles par tir
- `pierceCount` : Nombre d'ennemis traversés par projectile
- `ricochetCount` : Nombre de ricochets par projectile
- `magnetRange` : Portée de collecte d'XP
- `hasRegen` : Active la régénération
- `regenRate` : Temps entre chaque regen
- `regenAmount` : HP régénérés

### Système de bonus
Vous pouvez aussi créer vos propres propriétés :

```javascript
apply(player) {
  if (!player.fireDamage) player.fireDamage = 0;
  player.fireDamage += 10;
  
  // Le système de jeu devra ensuite utiliser player.fireDamage
}
```

## Système de rareté

Le système de rareté est automatiquement appliqué. Les power-ups peuvent apparaître avec différentes raretés :

- **Commun** (⚪) : Multiplicateur ×1.0
- **Peu commun** (🟢) : Multiplicateur ×1.5
- **Rare** (🔵) : Multiplicateur ×2.0
- **Épique** (🟣) : Multiplicateur ×3.0
- **Légendaire** (🟠) : Multiplicateur ×5.0
- **Mythique** (🔴) : Multiplicateur ×10.0

Le multiplicateur affecte l'effet du power-up. Le système `RarePowerUp` applique automatiquement le multiplicateur.

## Intégration dans le système de jeu

Si votre power-up ajoute une mécanique spéciale, vous devrez l'intégrer dans :

### GameScene
Pour les effets qui modifient le gameplay en temps réel :
- Dégâts bonus
- Projectiles supplémentaires
- Effets visuels

### Player
Pour les effets passifs :
- Stats de base
- Multiplicateurs
- Capacités spéciales

### Weapons
Pour les effets liés aux armes :
- Ricochet (dans `ProjectileWeapon`)
- Pierce (dans `ProjectileWeapon`)
- Nombre de projectiles

## Exemple d'intégration complète

### 1. Power-up simple

```javascript
class VampirePowerUp extends PowerUp {
  constructor() {
    super({
      id: "vampire",
      name: "Vampire",
      description: "Régénère 1 HP par ennemi tué",
      icon: "🧛",
      maxLevel: 3,
    });
  }

  apply(player) {
    if (!player.vampireHeal) player.vampireHeal = 0;
    player.vampireHeal += 1; // +1 HP par kill par niveau
  }
}
```

### 2. Utiliser dans GameScene

Dans `GameScene.update()`, quand un ennemi meurt :

```javascript
// Remove dead enemies and drop XP
for (let i = enemies.length - 1; i >= 0; i--) {
  const enemy = enemies[i];
  if (enemy.hp <= 0) {
    // Vampire heal
    if (this.player.vampireHeal) {
      this.player.setHp(this.player.hp + this.player.vampireHeal);
    }
    
    const xpAmount = enemy.isBoss ? 50 : 5;
    // ... reste du code
  }
}
```

## Checklist

- [ ] Classe créée dans `PowerUpRegistry.js`
- [ ] Hérite de `PowerUp`
- [ ] `constructor()` avec config (id, name, description, icon, maxLevel)
- [ ] `apply(player)` implémenté
- [ ] Enregistré dans `_initPowerUps()`
- [ ] Ajouté dans `getByCategory()` (si nécessaire)
- [ ] Intégré dans le système de jeu (si mécanique spéciale)
- [ ] Testé dans le jeu

## Notes importantes

1. **Initialisation des propriétés** : Toujours vérifier si la propriété existe avant de l'utiliser :
   ```javascript
   if (!player.monBonus) player.monBonus = 0;
   player.monBonus += valeur;
   ```

2. **HP** : Utiliser `player.setHp()` si disponible, sinon `player.hp` directement.

3. **Multiplicateurs** : Après avoir modifié un bonus, mettre à jour le multiplicateur :
   ```javascript
   player.damageBonus += 0.2;
   player.damageMultiplier = player.damageBonus;
   ```

4. **Capacités spéciales** : Pour activer une capacité, utiliser un flag booléen :
   ```javascript
   if (!player.hasSpecialAbility) {
     player.hasSpecialAbility = true;
   }
   ```


# OnlineFormaGame 🎮

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/fr/docs/Web/JavaScript)
[![Vite](https://img.shields.io/badge/Vite-4.x-blue.svg)](https://vitejs.dev/)
[![Platform: Web](https://img.shields.io/badge/Platform-Web-brightgreen.svg)](https://developer.mozilla.org/)

Un jeu de formation en ligne développé en JavaScript vanilla avec Vite, mettant en scène des personnages et artworks créés par **@_Mel00w_**.

## 🎨 Artwork & Crédits

Toutes les œuvres d'art (sprites, personnages, arrière-plans, etc.) ont été créées par **[@_Mel00w_](https://github.com/Mel00w)**.

**Artiste :** [@_Mel00w_](https://github.com/Mel00w)  
**Contact :** [LinkedIn](https://www.linkedin.com/in/lucile-chardard-b26b021a5/)

## 🚀 À propos du jeu

OnlineFormaGame est un jeu éducatif interactif en JavaScript qui combine mécaniques de jeu engageantes et contenu de formation. Plongez dans un univers visuel unique créé par @_Mel00w_ tout en acquérant de nouvelles compétences.

### ✨ Fonctionnalités

- ✅ **Moteur de jeu JavaScript** - Développé en vanilla JS
- ✅ **Système de combat** - Armes et compétences variées
- ✅ **Sélection de personnages** - 15+ personnages jouables
- ✅ **Système de vagues** - Gestion des vagues d'ennemis
- ✅ **Système de niveaux** - Progression et améliorations
- ✅ **Design visuel unique** - Artwork par @_Mel00w_
- ✅ **Optimisé pour le web** - Build avec Vite

## 🛠️ Technologies utilisées

- **JavaScript ES6+** - Langage principal
- **Vite 4.x** - Build tool et dev server
- **HTML5 Canvas** - Rendu graphique
- **CSS3** - Styles et interface
- **Node.js** - Environnement de développement

## 📚 Documentation

Une documentation complète est disponible dans le dossier `docs/` pour vous aider à ajouter du contenu au jeu :

- 📖 [Guide Complet](./docs/00_INDEX.md) - Index de toute la documentation
- ⚔️ [Ajouter une arme](./docs/01_AJOUTER_UNE_ARME.md) - Créer et intégrer une nouvelle arme
- 👾 [Ajouter un ennemi](./docs/02_AJOUTER_UN_ENNEMI.md) - Créer de nouveaux types d'ennemis
- ⭐ [Ajouter un power-up](./docs/03_AJOUTER_UN_POWERUP.md) - Créer de nouveaux power-ups
- 🎨 [Ajouter des sprites](./docs/04_AJOUTER_DES_SPRITES.md) - Gérer les ressources graphiques
- 👤 [Ajouter un personnage](./docs/05_AJOUTER_UN_PERSONNAGE.md) - Créer un nouveau personnage jouable

## 📦 Installation et Démarrage

### Prérequis

- **Node.js** (version 16 ou supérieure)
- **npm** ou **yarn**

### Installation

1. **Cloner le repository**

```bash
git clone https://github.com/Jackmaa/OnlineFormaGame.git
cd OnlineFormaGame
```

2. **Installer les dépendances**

```bash
npm install

```

3. **Lancer en mode développement**

```bash
npm run dev
Le jeu sera accessible à l'adresse http://localhost:5173
```

## 🎯 Comment jouer

### Contrôles

- **ZQSD** ou **Flèches directionnelles** : Déplacer le personnage

## Mécaniques de jeu

- Combattre les bugs : Éliminez les ennemis pour gagner de l'XP

- Collecter les gemmes : Ramassez les gemmes d'XP pour monter de niveau

- Choisir des améliorations : Sélectionnez de nouvelles compétences à chaque niveau

- Survivre aux vagues : Affrontez des vagues d'ennemis de plus en plus difficiles

## 🗂️ Structure du projet

```text
OnlineFormaGame/
├── src/
│ ├── engine/ # Moteur de jeu principal
│ │ ├── Game.js # Classe principale du jeu
│ │ ├── AssetLoader.js # Chargement des assets
│ │ ├── Input.js # Gestion des inputs
│ │ ├── SceneManager.js # Gestion des scènes
│ │ └── TileMap.js # Système de cartes
│ ├── entities/ # Entités du jeu
│ │ ├── Player.js # Joueur principal
│ │ ├── Bug.js # Ennemis
│ │ └── XPGem.js # Gemmes d'XP
│ ├── weapons/ # Système d'armes
│ │ ├── BaseWeapon.js # Arme de base
│ │ ├── Sword.js # Épée
│ │ ├── Boomerang.js # Boomerang
│ │ ├── ProjectileWeapon.js # Armes à projectiles
│ │ └── OrbitalWeapon.js # Armes orbitales
│ ├── systems/ # Systèmes de jeu
│ │ ├── AutoWeapon.js # Armes automatiques
│ │ ├── LevelUpSystem.js # Système de niveaux
│ │ ├── WaveManager.js # Gestion des vagues
│ │ └── Characters.js # Données des personnages
│ ├── scenes/ # Scènes du jeu
│ │ ├── GameScene.js # Scène de jeu principale
│ │ └── CharacterSelectScene.js # Sélection de perso
│ ├── powerups/ # Améliorations
│ │ └── PowerUpRegistry.js # Registre des power-ups
│ ├── data/ # Données du jeu
│ │ └── Characters.js # Configurations des personnages
│ ├── UI.js # Interface utilisateur
│ └── main.js # Point d'entrée
├── assets/ # Ressources
│ ├── sprites/ # Sprites des personnages
│ │ ├── \*.png # Sprites des 15+ personnages
│ │ ├── bug_glitch.png # Ennemi "bug"
│ │ ├── computer.png # Ordinateur
│ │ ├── sword.png # Épée
│ │ └── xp_gem.png # Gemme d'XP
│ └── tilesets/ # Tilesets
│ └── tiles.png # Tiles de la carte
├── package.json # Configuration npm
├── vite.config.js # Configuration Vite
└── index.html # Page principale
```

## 👥 Personnages jouables

- Le jeu propose 15+ personnages jouables avec leurs sprites dans les 4 directions :

Ahlem, Cédric, Christelle, Fabien, Illias, Le V, Lionel, Lucile, Marc, Mathieu, Sabah, Samy, Serge, Thomas, Valentin, Vincent

- Chaque personnage possède :

- Sprites dans les 4 directions (face, dos, gauche, droite)

- Statistiques uniques

- Styles de gameplay différents

## 🎮 Systèmes de jeu

### Système d'armes

- Épée : Arme de mêlée de base

- Boomerang : Arme à distance qui revient

- Armes orbitales : Armes qui tournent autour du joueur

- Armes à projectiles : Tirs directs

### Système de progression

- Niveaux : Montez de niveau en collectant des gemmes d'XP

- Améliorations : Choisissez de nouvelles compétences à chaque niveau

- Vagues : Système de vagues d'ennemis de plus en plus difficiles

### Gestion des ennemis

- Bugs/Glitches : Ennemis principaux

- Vagues progressives : Difficulté croissante

- Comportements IA : Patterns de déplacement et d'attaque

## 👥 Développement

### Développeur Principal

- Jackmaa - Développement JavaScript & Game Design

### Artiste

- @Mel00w - Création de tous les assets visuels

## Scripts disponibles

```bash
npm run dev          # Serveur de développement
```

## 🐛 Débogage et Développement

Le projet utilise Vite pour le hot-reload en développement. Les modifications sont rechargées automatiquement.

## Structure des assets

Les sprites sont organisés par personnage avec des conventions de nommage cohérentes :

nom.png - Face avant

nomdos.png - Dos

nomdroite.png - Droite

nomgauche.png - Gauche

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

- Fork le projet

- Créer une branche feature (git checkout -b feature/AmazingFeature)

- Commit vos changements (git commit -m 'Add some AmazingFeature')

- Push sur la branche (git push origin feature/AmazingFeature)

- Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.

## 🙏 Remerciements

Un remerciement spécial à @Mel00w pour son travail artistique exceptionnel qui donne vie à ce projet.

Note : Ce projet est en développement actif. Les fonctionnalités peuvent évoluer.

Dernière mise à jour : 2024

<div align="center">
Développé avec ❤️ en JavaScript vanilla

📧 Contact | 🐛 Bug Report | 💡 Feature Request

</div>
Si vous utilisez les artworks de ce projet, merci de créditer @Mel00w.

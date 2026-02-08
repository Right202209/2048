# 2048 Game

A classic 2048 puzzle game clone inspired by [simonaking.com/2048](https://simonaking.com/2048/).

## Features

- Classic 2048 gameplay with smooth animations
- Keyboard (arrow keys) and touch/swipe controls
- Score tracking with persistent high score (saved in localStorage)
- Responsive design - works on desktop and mobile devices
- Tile merging animations
- Game over detection
- New game button

## How to Play

1. Use **arrow keys** on desktop or **swipe** on mobile to move tiles
2. Tiles with the same number merge into one when they collide
3. Each merge adds to your score
4. Goal: Create a tile with the number 2048
5. Game over when no more moves are possible

## Controls

- **Arrow Up/Down/Left/Right** - Move tiles in that direction
- **Touch/Swipe** - Swipe in the direction you want to move tiles
- **New Game Button** - Start a fresh game

## File Structure

```
2048/
├── index.html    # Main HTML structure
├── style.css     # Game styling and animations
├── script.js     # Game logic and event handling
└── README.md     # This file
```

## Getting Started

Simply open `index.html` in any modern web browser to play the game.

No build process or dependencies required - it's pure HTML, CSS, and JavaScript.

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript
- CSS Grid
- CSS Animations
- Touch events (for mobile)

## Customization

### Colors
Modify tile colors in `style.css` by editing the `.tile-*` classes.

### Grid Size
Change `this.gridSize = 4` in `script.js` (Game2048 constructor) to create larger/smaller grids.

### Winning Number
The game can continue past 2048 - just change the tile classes in `script.js` to support higher numbers.

## Credits

Inspired by the original 2048 game by Gabriele Cirulli and the implementation at [simonaking.com/2048](https://simonaking.com/2048/).
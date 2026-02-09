# Project Context: 2048 Game

## Overview
This is a vanilla JavaScript implementation of the classic 2048 puzzle game. It is a static web application requiring no build process or backend.

## Tech Stack
*   **Core:** HTML5, CSS3, JavaScript (ES6+)
*   **Frameworks:** None (Vanilla DOM manipulation)
*   **Storage:** `localStorage` (for High Score persistence)

## Architecture

### File Structure
*   `index.html`: Main entry point. Contains the game container `div#grid-container`, UI controls (buttons), and imports `style.css` and `script.js`.
*   `script.js`: Contains the core game logic encapsulated in the `Game2048` class.
    *   **State Management:** Manages a 4x4 2D array (`this.grid`), score, and move history.
    *   **Rendering:** Directly manipulates DOM nodes (`.tile`) within the grid container.
    *   **Input:** Handles `keydown` (Arrow keys, WASD) and `touchstart`/`touchend` (Swipe gestures).
    *   **Loop:** Event-driven updates (no continuous game loop).
*   `style.css`: Handles all visual styling, responsive design (breakpoints at 600px and 500px), and animations (tile merging, appearing, background effects).

### Key Classes & Logic
*   **`Game2048` Class:**
    *   `init()`: Sets up event listeners and starts a new game.
    *   `move(direction)`: Core logic for sliding and merging tiles. Returns boolean indicating if board changed.
    *   `renderTiles()`: Clears and rebuilds DOM elements based on the grid state.
    *   `undo()`: Restores state from `this.history` stack (max 10 moves).

## Development & Usage

### Running the Project
Since this is a static site, simply open `index.html` in a modern web browser.
```bash
# Example if using a simple http server (optional, not required)
python3 -m http.server
```

### Conventions
*   **Styling:** Hardcoded hex values are used (no CSS variables). Responsive adjustments are made via media queries.
*   **Code Style:** Standard ES6 classes. `this` binding is handled via arrow functions in event listeners.
*   **Assets:** No external image assets; all visuals are CSS-generated (including the GitHub corner SVG).

## Feature Details
*   **Responsiveness:** adapts grid size and tile font sizes for screens under 600px.
*   **Animations:**
    *   `@keyframes pop`: New tile appearance.
    *   `@keyframes merge`: Tile combination pulse.
    *   `@keyframes breatheGradient`: Background ambient animation.
*   **Game Over:** Overlay `div.game-over-overlay` toggles visibility via `.visible` class.

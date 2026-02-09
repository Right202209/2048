class Game2048 {
    constructor() {
        this.gridSize = 4;
        this.grid = [];
        this.score = 0;
        this.maxScore = parseInt(localStorage.getItem('maxScore')) || 0;
        this.gameOver = false;
        this.history = [];
        this.maxHistory = 10;
        this.isAnimating = false;
        this.container = document.getElementById('grid-container');
        this.scoreElement = document.getElementById('score');
        this.maxScoreElement = document.getElementById('maxscore');
        this.init();
    }

    init() {
        this.maxScoreElement.textContent = this.maxScore;
        this.setupEventListeners();
        this.newGame();
    }

    newGame() {
        this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.history = [];
        this.clearTiles();
        this.hideGameOver();
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
    }

    clearTiles() {
        const existingTiles = this.container.querySelectorAll('.tile');
        existingTiles.forEach(tile => tile.remove());
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            this.grid[randomCell.row][randomCell.col] = value;
            this.createTile(randomCell.row, randomCell.col, value);
        }
    }

    createTile(row, col, value) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value > 2048 ? 'super' : value}`;
        tile.textContent = value;

        const styles = window.getComputedStyle(this.container);
        const padding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
        const gap = parseFloat(styles.gap) || 15;
        
        const containerWidth = this.container.clientWidth - padding;
        const tileSize = (containerWidth - (this.gridSize - 1) * gap) / this.gridSize;
        const paddingOffset = parseFloat(styles.paddingLeft);
        
        tile.style.width = `${tileSize}px`;
        tile.style.height = `${tileSize}px`;
        tile.style.left = `${col * (tileSize + gap) + paddingOffset}px`;
        tile.style.top = `${row * (tileSize + gap) + paddingOffset}px`;
        
        this.container.appendChild(tile);
    }

    renderTiles() {
        this.clearTiles();
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] !== 0) {
                    this.createTile(i, j, this.grid[i][j]);
                }
            }
        }
    }

    updateDisplay() {
        this.renderTiles();
        this.scoreElement.textContent = this.score;
        
        if (this.score > this.maxScore) {
            this.maxScore = this.score;
            localStorage.setItem('maxScore', this.maxScore);
            this.maxScoreElement.textContent = this.maxScore;
        }
    }

    saveState() {
        const state = {
            grid: JSON.parse(JSON.stringify(this.grid)),
            score: this.score
        };
        this.history.push(state);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }

    undo() {
        if (this.history.length > 0 && !this.gameOver) {
            const prevState = this.history.pop();
            this.grid = prevState.grid;
            this.score = prevState.score;
            this.updateDisplay();
        }
    }

    move(direction) {
        if (this.gameOver || this.isAnimating) return;

        let moved = false;
        let scoreGained = 0;
        this.isAnimating = true;

        this.saveState();

        const processLine = (line) => {
            let filtered = line.filter(x => x !== 0);
            let merged = [];
            let i = 0;
            
            while (i < filtered.length) {
                if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
                    merged.push(filtered[i] * 2);
                    scoreGained += filtered[i] * 2;
                    i += 2;
                } else {
                    merged.push(filtered[i]);
                    i++;
                }
            }
            
            while (merged.length < this.gridSize) {
                merged.push(0);
            }
            
            return merged;
        };

        const getLine = (index, direction) => {
            let line = [];
            for (let i = 0; i < this.gridSize; i++) {
                switch (direction) {
                    case 'left':
                        line.push(this.grid[index][i]);
                        break;
                    case 'right':
                        line.push(this.grid[index][this.gridSize - 1 - i]);
                        break;
                    case 'up':
                        line.push(this.grid[i][index]);
                        break;
                    case 'down':
                        line.push(this.grid[this.gridSize - 1 - i][index]);
                        break;
                }
            }
            return line;
        };

        const setLine = (index, line, direction) => {
            for (let i = 0; i < this.gridSize; i++) {
                switch (direction) {
                    case 'left':
                        this.grid[index][i] = line[i];
                        break;
                    case 'right':
                        this.grid[index][this.gridSize - 1 - i] = line[i];
                        break;
                    case 'up':
                        this.grid[i][index] = line[i];
                        break;
                    case 'down':
                        this.grid[this.gridSize - 1 - i][index] = line[i];
                        break;
                }
            }
        };

        for (let i = 0; i < this.gridSize; i++) {
            const oldLine = getLine(i, direction);
            const newLine = processLine(oldLine);
            setLine(i, newLine, direction);

            for (let j = 0; j < this.gridSize; j++) {
                if (oldLine[j] !== newLine[j]) {
                    moved = true;
                }
            }
        }

        if (moved) {
            this.score += scoreGained;
            this.addRandomTile();
            this.updateDisplay();

            setTimeout(() => {
                this.isAnimating = false;
                if (!this.canMove()) {
                    this.gameOver = true;
                    this.showGameOver();
                }
            }, 150);
        } else {
            this.history.pop();
            this.isAnimating = false;
        }
    }

    canMove() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) {
                    return true;
                }
                
                if (i < this.gridSize - 1 && this.grid[i][j] === this.grid[i + 1][j]) {
                    return true;
                }
                
                if (j < this.gridSize - 1 && this.grid[i][j] === this.grid[i][j + 1]) {
                    return true;
                }
            }
        }
        return false;
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            
            if ((e.ctrlKey || e.metaKey) && key === 'z') {
                e.preventDefault();
                this.undo();
                return;
            }
            
            switch (key) {
                case 'arrowup':
                case 'w':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'arrowdown':
                case 's':
                    e.preventDefault();
                    this.move('down');
                    break;
                case 'arrowleft':
                case 'a':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'arrowright':
                case 'd':
                    e.preventDefault();
                    this.move('right');
                    break;
            }
        });

        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.newGame();
        });

        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undo();
        });

        document.getElementById('tryAgainBtn').addEventListener('click', () => {
            this.newGame();
        });

        // 防抖 resize 处理
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateDisplay();
            }, 100);
        });

        let touchStartX, touchStartY;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const minSwipeDistance = 50;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        this.move('right');
                    } else {
                        this.move('left');
                    }
                }
            } else {
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        this.move('down');
                    } else {
                        this.move('up');
                    }
                }
            }

            touchStartX = null;
            touchStartY = null;
        });
    }

    showGameOver() {
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverOverlay').classList.add('visible');
    }

    hideGameOver() {
        document.getElementById('gameOverOverlay').classList.remove('visible');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
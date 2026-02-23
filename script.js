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
        
        // 存储实际的 DOM 元素
        this.tileElements = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(null));
        
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
        this.tileElements = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(null));
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
            this.tileElements[randomCell.row][randomCell.col] = this.createTile(randomCell.row, randomCell.col, value);
        }
    }

    createTile(row, col, value) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value > 2048 ? 'super' : value}`;
        tile.textContent = value;
        this.positionTile(tile, row, col);
        this.container.appendChild(tile);
        return tile;
    }

    positionTile(tile, row, col) {
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
    }

    updateDisplay() {
        // 更新分数
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
            this.clearTiles();
            for (let i = 0; i < this.gridSize; i++) {
                for (let j = 0; j < this.gridSize; j++) {
                    if (this.grid[i][j] !== 0) {
                        this.tileElements[i][j] = this.createTile(i, j, this.grid[i][j]);
                    }
                }
            }
            this.updateDisplay();
        }
    }

    move(direction) {
        if (this.gameOver || this.isAnimating) return;

        let moved = false;
        let scoreGained = 0;
        this.isAnimating = true;

        this.saveState();

        // 记录移动前的元素
        const oldTileElements = this.tileElements.map(row => [...row]);
        this.tileElements = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(null));

        for (let i = 0; i < this.gridSize; i++) {
            let line = [];
            let elements = [];
            
            // 获取当前行的值和元素
            for (let j = 0; j < this.gridSize; j++) {
                let r, c;
                if (direction === 'left') { r = i; c = j; }
                else if (direction === 'right') { r = i; c = this.gridSize - 1 - j; }
                else if (direction === 'up') { r = j; c = i; }
                else if (direction === 'down') { r = this.gridSize - 1 - j; c = i; }
                
                if (this.grid[r][c] !== 0) {
                    line.push(this.grid[r][c]);
                    elements.push(oldTileElements[r][c]);
                }
            }

            let mergedLine = [];
            let mergedElements = [];
            let k = 0;
            while (k < line.length) {
                if (k + 1 < line.length && line[k] === line[k + 1]) {
                    const newValue = line[k] * 2;
                    mergedLine.push(newValue);
                    scoreGained += newValue;
                    
                    const tile1 = elements[k];
                    const tile2 = elements[k + 1];
                    
                    // 记录合并后的元素（稍后处理）
                    mergedElements.push({ tile: tile1, mergeWith: tile2, value: newValue });
                    k += 2;
                    moved = true;
                } else {
                    mergedLine.push(line[k]);
                    mergedElements.push({ tile: elements[k], value: line[k] });
                    k++;
                }
            }

            // 更新 grid 和执行移动动画
            for (let j = 0; j < this.gridSize; j++) {
                let r, c;
                if (direction === 'left') { r = i; c = j; }
                else if (direction === 'right') { r = i; c = this.gridSize - 1 - j; }
                else if (direction === 'up') { r = j; c = i; }
                else if (direction === 'down') { r = this.gridSize - 1 - j; c = i; }

                const targetValue = j < mergedLine.length ? mergedLine[j] : 0;
                if (this.grid[r][c] !== targetValue || (j < mergedLine.length && elements[j] !== mergedElements[j].tile)) {
                    // 即使值没变，如果元素位置变了也算 moved
                    if (targetValue !== 0) moved = true;
                }

                this.grid[r][c] = targetValue;

                if (j < mergedElements.length) {
                    const entry = mergedElements[j];
                    const tile = entry.tile;
                    
                    // 移动主方块
                    this.positionTile(tile, r, c);
                    
                    if (entry.mergeWith) {
                        // 移动被合并的方块
                        this.positionTile(entry.mergeWith, r, c);
                        const secondTile = entry.mergeWith;
                        
                        // 动画结束后合并
                        setTimeout(() => {
                            tile.className = `tile tile-${entry.value > 2048 ? 'super' : entry.value} merged`;
                            tile.textContent = entry.value;
                            secondTile.remove();
                        }, 100);
                    }
                    this.tileElements[r][c] = tile;
                }
            }
        }

        if (moved) {
            this.score += scoreGained;
            setTimeout(() => {
                this.addRandomTile();
                this.updateDisplay();
                this.isAnimating = false;
                if (!this.canMove()) {
                    this.gameOver = true;
                    this.showGameOver();
                }
            }, 150);
        } else {
            this.history.pop();
            this.tileElements = oldTileElements; // 恢复元素引用
            this.isAnimating = false;
        }
    }

    canMove() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) return true;
                if (i < this.gridSize - 1 && this.grid[i][j] === this.grid[i + 1][j]) return true;
                if (j < this.gridSize - 1 && this.grid[i][j] === this.grid[i][j + 1]) return true;
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
                case 'arrowup': case 'w': e.preventDefault(); this.move('up'); break;
                case 'arrowdown': case 's': e.preventDefault(); this.move('down'); break;
                case 'arrowleft': case 'a': e.preventDefault(); this.move('left'); break;
                case 'arrowright': case 'd': e.preventDefault(); this.move('right'); break;
            }
        });

        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('tryAgainBtn').addEventListener('click', () => this.newGame());

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                for (let i = 0; i < this.gridSize; i++) {
                    for (let j = 0; j < this.gridSize; j++) {
                        if (this.tileElements[i][j]) {
                            this.positionTile(this.tileElements[i][j], i, j);
                        }
                    }
                }
            }, 100);
        });

        let touchStartX, touchStartY;
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;
            const deltaX = e.changedTouches[0].clientX - touchStartX;
            const deltaY = e.changedTouches[0].clientY - touchStartY;
            if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) > 50) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    this.move(deltaX > 0 ? 'right' : 'left');
                } else {
                    this.move(deltaY > 0 ? 'down' : 'up');
                }
            }
            touchStartX = null; touchStartY = null;
        });
    }

    showGameOver() {
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverOverlay').classList.add('visible');

        // 延迟显示提交分数弹窗
        setTimeout(() => {
            this.showSubmitScoreDialog();
        }, 500);
    }

    hideGameOver() {
        document.getElementById('gameOverOverlay').classList.remove('visible');
    }

    showSubmitScoreDialog() {
        if (this.score === 0) return;

        const overlay = document.getElementById('submitScoreOverlay');
        const scoreSpan = document.getElementById('submitScore');
        const input = document.getElementById('playerNameInput');

        scoreSpan.textContent = this.score;
        input.value = '';
        overlay.classList.add('visible');

        // 自动聚焦输入框
        setTimeout(() => input.focus(), 100);
    }

    hideSubmitScoreDialog() {
        document.getElementById('submitScoreOverlay').classList.remove('visible');
    }

    async submitScore(playerName, score) {
        try {
            const response = await fetch('/api/score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ playerName, score })
            });

            if (response.ok) {
                console.log('Score submitted successfully');
                return true;
            }

            const errorData = await response.json().catch(() => ({}));
            alert(errorData.error || '提交失败，请稍后重试');
            return false;
        } catch (error) {
            console.error('Error submitting score:', error);
            alert('网络错误，请检查服务器是否运行');
            return false;
        }
    }

    setupSubmitScoreListeners() {
        const submitBtn = document.getElementById('submitScoreBtn');
        const skipBtn = document.getElementById('skipSubmitBtn');
        const input = document.getElementById('playerNameInput');

        submitBtn.addEventListener('click', async () => {
            const playerName = input.value.trim();
            if (playerName) {
                const ok = await this.submitScore(playerName, this.score);
                if (ok) {
                    this.hideSubmitScoreDialog();
                    window.location.href = 'leaderboard.html';
                }
            } else {
                input.focus();
                input.style.borderColor = '#f67c5f';
                setTimeout(() => {
                    input.style.borderColor = '#bbada0';
                }, 500);
            }
        });

        skipBtn.addEventListener('click', () => {
            this.hideSubmitScoreDialog();
        });

        // 按 Enter 键提交
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitBtn.click();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game2048();
    game.setupSubmitScoreListeners();
});

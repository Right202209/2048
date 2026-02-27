class Game2048 {
    constructor() {
        this.gridSize = 4;
        this.grid = [];
        this.score = 0;
        this.maxScore = this.safeGetMaxScore();
        this.gameOver = false;
        this.history = [];
        this.maxHistory = 10;
        this.isAnimating = false;

        // 缓存关键 DOM 引用：缺失时记录错误，避免后续直接崩溃。
        this.container = this.getRequiredElement('grid-container');
        this.scoreElement = this.getRequiredElement('score');
        this.maxScoreElement = this.getRequiredElement('maxscore');
        this.newGameButton = this.getRequiredElement('newGameBtn');
        this.undoButton = this.getRequiredElement('undoBtn');
        this.tryAgainButton = this.getRequiredElement('tryAgainBtn');
        this.gameOverOverlay = this.getRequiredElement('gameOverOverlay');
        this.finalScoreElement = this.getRequiredElement('finalScore');

        // 存储每个格子对应的 tile DOM 引用。
        this.tileElements = this.createTileMatrix();

        this.init();
    }

    createTileMatrix() {
        return Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(null));
    }

    logError(context, error) {
        console.error(`[Game2048] ${context}`, error);
    }

    safeSetTimeout(callback, delay, context = 'Timer callback failed') {
        return window.setTimeout(() => {
            try {
                callback();
            } catch (error) {
                this.logError(context, error);
            }
        }, delay);
    }

    safeEventHandler(context, handler) {
        return (event) => {
            try {
                handler(event);
            } catch (error) {
                this.logError(context, error);
            }
        };
    }

    getRequiredElement(id) {
        // 统一 DOM 查询入口，便于集中空值保护与日志。
        const element = document.getElementById(id);
        if (!element) {
            this.logError(`Missing required element: #${id}`, new Error('Element not found'));
        }
        return element;
    }

    safeGetMaxScore() {
        // 某些环境（隐私模式/禁用存储）会抛出异常，这里兜底为 0。
        try {
            const rawValue = localStorage.getItem('maxScore');
            const parsedValue = parseInt(rawValue, 10);
            return Number.isNaN(parsedValue) ? 0 : parsedValue;
        } catch (error) {
            this.logError('Failed to read maxScore from localStorage', error);
            return 0;
        }
    }

    safeSetMaxScore(value) {
        // 持久化失败不影响游戏流程，只记录错误。
        try {
            localStorage.setItem('maxScore', String(value));
        } catch (error) {
            this.logError('Failed to persist maxScore to localStorage', error);
        }
    }

    init() {
        try {
            if (this.maxScoreElement) {
                this.maxScoreElement.textContent = this.maxScore;
            }

            this.setupEventListeners();
            this.newGame();
        } catch (error) {
            this.logError('Failed to initialize game', error);
        }
    }

    newGame() {
        try {
            this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(0));
            this.score = 0;
            this.gameOver = false;
            this.history = [];
            this.clearTiles();
            this.hideGameOver();
            this.addRandomTile();
            this.addRandomTile();
            this.updateDisplay();
        } catch (error) {
            this.logError('Failed to start new game', error);
        }
    }

    clearTiles() {
        if (!this.container) {
            this.logError('Cannot clear tiles because container is missing', new Error('Missing container'));
            this.tileElements = this.createTileMatrix();
            return;
        }

        try {
            const existingTiles = this.container.querySelectorAll('.tile');
            existingTiles.forEach(tile => tile.remove());
        } catch (error) {
            this.logError('Failed to clear tile elements', error);
        }

        this.tileElements = this.createTileMatrix();
    }

    addRandomTile() {
        try {
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
        } catch (error) {
            this.logError('Failed to add random tile', error);
        }
    }

    createTile(row, col, value) {
        if (!this.container) {
            return null;
        }

        try {
            const tile = document.createElement('div');
            tile.className = `tile tile-${value > 2048 ? 'super' : value}`;
            tile.textContent = value;
            this.positionTile(tile, row, col);
            this.container.appendChild(tile);
            return tile;
        } catch (error) {
            this.logError(`Failed to create tile at (${row}, ${col})`, error);
            return null;
        }
    }

    positionTile(tile, row, col) {
        if (!tile || !this.container) {
            return;
        }

        try {
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
        } catch (error) {
            this.logError(`Failed to position tile at (${row}, ${col})`, error);
        }
    }

    updateDisplay() {
        try {
            if (this.scoreElement) {
                this.scoreElement.textContent = this.score;
            }

            if (this.score > this.maxScore) {
                this.maxScore = this.score;
                this.safeSetMaxScore(this.maxScore);
                if (this.maxScoreElement) {
                    this.maxScoreElement.textContent = this.maxScore;
                }
            }
        } catch (error) {
            this.logError('Failed to update score display', error);
        }
    }

    saveState() {
        try {
            const state = {
                grid: JSON.parse(JSON.stringify(this.grid)),
                score: this.score
            };
            this.history.push(state);
            if (this.history.length > this.maxHistory) {
                this.history.shift();
            }
        } catch (error) {
            this.logError('Failed to save history state', error);
        }
    }

    undo() {
        try {
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
        } catch (error) {
            this.logError('Failed to undo move', error);
        }
    }

    getCoordinatesForDirection(lineIndex, offset, direction) {
        const lastIndex = this.gridSize - 1;

        if (direction === 'left') {
            return { row: lineIndex, col: offset };
        }

        if (direction === 'right') {
            return { row: lineIndex, col: lastIndex - offset };
        }

        if (direction === 'up') {
            return { row: offset, col: lineIndex };
        }

        return { row: lastIndex - offset, col: lineIndex };
    }

    collectLineData(lineIndex, direction, oldTileElements) {
        const line = [];
        const elements = [];

        for (let offset = 0; offset < this.gridSize; offset++) {
            const { row, col } = this.getCoordinatesForDirection(lineIndex, offset, direction);
            if (this.grid[row][col] !== 0) {
                line.push(this.grid[row][col]);
                elements.push(oldTileElements[row][col]);
            }
        }

        return { line, elements };
    }

    mergeLineData(lineData) {
        // 只计算一条线的“压缩+合并”结果，不直接写回棋盘。
        const mergedLine = [];
        const mergedElements = [];

        let scoreGained = 0;
        let moved = false;
        let index = 0;

        while (index < lineData.line.length) {
            const currentValue = lineData.line[index];

            if (
                index + 1 < lineData.line.length
                && currentValue === lineData.line[index + 1]
            ) {
                const newValue = currentValue * 2;
                mergedLine.push(newValue);
                scoreGained += newValue;

                mergedElements.push({
                    tile: lineData.elements[index],
                    mergeWith: lineData.elements[index + 1],
                    value: newValue
                });

                moved = true;
                index += 2;
                continue;
            }

            mergedLine.push(currentValue);
            mergedElements.push({
                tile: lineData.elements[index],
                value: currentValue
            });
            index++;
        }

        return {
            mergedLine,
            mergedElements,
            scoreGained,
            moved
        };
    }

    applyLineResult(lineIndex, direction, lineData, mergeResult) {
        // 将单线结果写回 grid，并触发位移动画/合并动画。
        let moved = false;

        for (let offset = 0; offset < this.gridSize; offset++) {
            const { row, col } = this.getCoordinatesForDirection(lineIndex, offset, direction);
            const targetValue = offset < mergeResult.mergedLine.length ? mergeResult.mergedLine[offset] : 0;
            const tileMoved = (
                offset < mergeResult.mergedLine.length
                && lineData.elements[offset] !== mergeResult.mergedElements[offset].tile
            );

            if (this.grid[row][col] !== targetValue || tileMoved) {
                if (targetValue !== 0) {
                    moved = true;
                }
            }

            this.grid[row][col] = targetValue;

            if (offset < mergeResult.mergedElements.length) {
                const entry = mergeResult.mergedElements[offset];
                const tile = entry.tile;

                this.positionTile(tile, row, col);

                if (entry.mergeWith) {
                    this.positionTile(entry.mergeWith, row, col);
                    const secondTile = entry.mergeWith;

                    this.safeSetTimeout(() => {
                        if (!tile || !secondTile) {
                            return;
                        }

                        tile.className = `tile tile-${entry.value > 2048 ? 'super' : entry.value} merged`;
                        tile.textContent = entry.value;
                        secondTile.remove();
                    }, 100, 'Merge animation callback failed');
                }

                this.tileElements[row][col] = tile;
            }
        }

        return moved;
    }

    finishMove(moved, scoreGained, oldTileElements) {
        // 保持原始时序：有效移动后 150ms 再补随机块与结算。
        if (moved) {
            this.score += scoreGained;
            this.safeSetTimeout(() => {
                this.addRandomTile();
                this.updateDisplay();
                this.isAnimating = false;
                if (!this.canMove()) {
                    this.gameOver = true;
                    this.showGameOver();
                }
            }, 150, 'Move finalization callback failed');
            return;
        }

        // 无效移动：撤回 saveState，且恢复旧 DOM 引用。
        this.history.pop();
        this.tileElements = oldTileElements;
        this.isAnimating = false;
    }

    move(direction) {
        if (this.gameOver || this.isAnimating) return;

        let moved = false;
        let scoreGained = 0;

        this.isAnimating = true;
        this.saveState();

        const oldTileElements = this.tileElements.map(row => [...row]);
        this.tileElements = this.createTileMatrix();

        for (let lineIndex = 0; lineIndex < this.gridSize; lineIndex++) {
            const lineData = this.collectLineData(lineIndex, direction, oldTileElements);
            const mergeResult = this.mergeLineData(lineData);

            scoreGained += mergeResult.scoreGained;
            if (mergeResult.moved) {
                moved = true;
            }

            if (this.applyLineResult(lineIndex, direction, lineData, mergeResult)) {
                moved = true;
            }
        }

        this.finishMove(moved, scoreGained, oldTileElements);
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

    getDirectionFromKey(key) {
        switch (key) {
            case 'arrowup':
            case 'w':
                return 'up';
            case 'arrowdown':
            case 's':
                return 'down';
            case 'arrowleft':
            case 'a':
                return 'left';
            case 'arrowright':
            case 'd':
                return 'right';
            default:
                return null;
        }
    }

    getSwipeDirection(deltaX, deltaY) {
        if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) <= 50) {
            return null;
        }

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            return deltaX > 0 ? 'right' : 'left';
        }

        return deltaY > 0 ? 'down' : 'up';
    }

    repositionTiles() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.tileElements[i][j]) {
                    this.positionTile(this.tileElements[i][j], i, j);
                }
            }
        }
    }

    bindKeyboardEvents() {
        // 键盘：方向键/WASD 移动，Ctrl/Cmd+Z 撤销。
        document.addEventListener('keydown', this.safeEventHandler('Keyboard handler failed', (e) => {
            const key = e.key.toLowerCase();

            if ((e.ctrlKey || e.metaKey) && key === 'z') {
                e.preventDefault();
                this.undo();
                return;
            }

            const direction = this.getDirectionFromKey(key);
            if (!direction) {
                return;
            }

            e.preventDefault();
            this.move(direction);
        }));
    }

    bindButtonEvents() {
        if (this.newGameButton) {
            this.newGameButton.addEventListener('click', this.safeEventHandler('New game click handler failed', () => {
                this.newGame();
            }));
        }

        if (this.undoButton) {
            this.undoButton.addEventListener('click', this.safeEventHandler('Undo click handler failed', () => {
                this.undo();
            }));
        }

        if (this.tryAgainButton) {
            this.tryAgainButton.addEventListener('click', this.safeEventHandler('Try again click handler failed', () => {
                this.newGame();
            }));
        }
    }

    bindResizeEvents() {
        let resizeTimeout;

        window.addEventListener('resize', this.safeEventHandler('Resize handler failed', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = this.safeSetTimeout(() => {
                this.repositionTiles();
            }, 100, 'Resize reposition callback failed');
        }));
    }

    bindTouchEvents() {
        // 触控：记录起点并在 touchend 解析滑动方向。
        let touchStartX;
        let touchStartY;

        document.addEventListener('touchstart', this.safeEventHandler('Touchstart handler failed', (e) => {
            if (!e.touches || e.touches.length === 0) {
                this.logError('touchstart missing touch point', new Error('Missing touch point'));
                touchStartX = null;
                touchStartY = null;
                return;
            }

            const firstTouch = e.touches[0];
            touchStartX = firstTouch.clientX;
            touchStartY = firstTouch.clientY;
        }));

        document.addEventListener('touchend', this.safeEventHandler('Touchend handler failed', (e) => {
            if (touchStartX == null || touchStartY == null) return;

            if (!e.changedTouches || e.changedTouches.length === 0) {
                this.logError('touchend missing changed touch point', new Error('Missing changed touch point'));
                touchStartX = null;
                touchStartY = null;
                return;
            }

            const endTouch = e.changedTouches[0];
            const deltaX = endTouch.clientX - touchStartX;
            const deltaY = endTouch.clientY - touchStartY;
            const direction = this.getSwipeDirection(deltaX, deltaY);

            if (direction) {
                this.move(direction);
            }

            touchStartX = null;
            touchStartY = null;
        }));
    }

    setupEventListeners() {
        this.bindKeyboardEvents();
        this.bindButtonEvents();
        this.bindResizeEvents();
        this.bindTouchEvents();
    }

    showGameOver() {
        try {
            if (this.finalScoreElement) {
                this.finalScoreElement.textContent = this.score;
            }

            if (this.gameOverOverlay) {
                this.gameOverOverlay.classList.add('visible');
            }

            // 延迟显示提交分数弹窗
            this.safeSetTimeout(() => {
                this.showSubmitScoreDialog();
            }, 500, 'Show submit-score dialog callback failed');
        } catch (error) {
            this.logError('Failed to show game over overlay', error);
        }
    }

    hideGameOver() {
        try {
            if (this.gameOverOverlay) {
                this.gameOverOverlay.classList.remove('visible');
            }
        } catch (error) {
            this.logError('Failed to hide game over overlay', error);
        }
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
    try {
        const game = new Game2048();
        game.setupSubmitScoreListeners();
    } catch (error) {
        console.error('[Game2048] Failed to bootstrap game', error);
    }
});

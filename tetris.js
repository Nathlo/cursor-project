class Tetris {
    constructor() {
        this.grid = Array(20).fill().map(() => Array(10).fill(0));
        this.score = 0;
        this.level = 1;
        this.gameBoard = document.querySelector('.game-board');
        this.currentPiece = null;
        this.nextPiece = null;
        this.nextPieceDisplay = document.querySelector('.next-piece-display');
        this.gameInterval = null;
        this.isGameOver = false;

        // Définition des pièces Tetris (format GameBoy)
        this.pieces = [
            [[1, 1, 1, 1]], // I
            [[1, 1], [1, 1]], // O
            [[1, 1, 1], [0, 1, 0]], // T
            [[1, 1, 1], [1, 0, 0]], // L
            [[1, 1, 1], [0, 0, 1]], // J
            [[1, 1, 0], [0, 1, 1]], // S
            [[0, 1, 1], [1, 1, 0]]  // Z
        ];

        this.initializeBoard();
        this.setupControls();
    }

    initializeBoard() {
        this.gameBoard.innerHTML = '';
        for (let i = 0; i < 200; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            this.gameBoard.appendChild(cell);
        }
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (this.isGameOver) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.movePiece(-1);
                    break;
                case 'ArrowRight':
                    this.movePiece(1);
                    break;
                case 'ArrowDown':
                    this.movePieceDown();
                    break;
                case 'ArrowUp':
                    this.rotatePiece();
                    break;
            }
        });

        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
    }

    startGame() {
        this.isGameOver = false;
        this.score = 0;
        this.level = 1;
        this.grid = Array(20).fill().map(() => Array(10).fill(0));
        this.initializeBoard();
        this.nextPiece = this.generatePiece();
        this.spawnPiece();
        
        if (this.gameInterval) clearInterval(this.gameInterval);
        this.gameInterval = setInterval(() => {
            this.movePieceDown();
        }, 1000 - (this.level * 50));
    }

    generatePiece() {
        const pieceIndex = Math.floor(Math.random() * this.pieces.length);
        return {
            shape: this.pieces[pieceIndex],
            x: Math.floor((10 - this.pieces[pieceIndex][0].length) / 2),
            y: 0
        };
    }

    spawnPiece() {
        if (!this.nextPiece) {
            this.nextPiece = this.generatePiece();
        }
        
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.generatePiece();
        this.renderNextPiece();

        if (this.checkCollision()) {
            this.gameOver();
        } else {
            this.renderPiece();
        }
    }

    movePiece(direction) {
        const oldX = this.currentPiece.x;
        this.currentPiece.x += direction;

        if (this.checkCollision()) {
            this.currentPiece.x = oldX;
            return false;
        }

        this.renderPiece();
        return true;
    }

    movePieceDown() {
        const oldY = this.currentPiece.y;
        this.currentPiece.y++;

        if (this.checkCollision()) {
            this.currentPiece.y = oldY;
            this.freezePiece();
            this.clearLines();
            this.spawnPiece();
            return false;
        }

        this.renderPiece();
        return true;
    }

    rotatePiece() {
        const oldShape = this.currentPiece.shape;
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        
        this.currentPiece.shape = rotated;
        
        if (this.checkCollision()) {
            this.currentPiece.shape = oldShape;
            return false;
        }

        this.renderPiece();
        return true;
    }

    checkCollision() {
        return this.currentPiece.shape.some((row, dy) =>
            row.some((cell, dx) => {
                if (!cell) return false;
                const newX = this.currentPiece.x + dx;
                const newY = this.currentPiece.y + dy;
                return (
                    newX < 0 ||
                    newX >= 10 ||
                    newY >= 20 ||
                    (newY >= 0 && this.grid[newY][newX])
                );
            })
        );
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let y = 19; y >= 0; y--) {
            if (this.grid[y].every(cell => cell === 1)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(10).fill(0));
                linesCleared++;
                y++; // Vérifier la même ligne après avoir décalé
            }
        }

        if (linesCleared > 0) {
            this.updateScore(linesCleared);
        }
    }

    updateScore(linesCleared) {
        const points = [0, 40, 100, 300, 1200]; // Points selon le nombre de lignes
        this.score += points[linesCleared] * this.level;
        document.getElementById('score').textContent = this.score;
        
        // Mise à jour du niveau tous les 10 lignes
        const newLevel = Math.floor(this.score / 1000) + 1;
        if (newLevel !== this.level) {
            this.level = newLevel;
            document.getElementById('level').textContent = this.level;
            clearInterval(this.gameInterval);
            this.gameInterval = setInterval(() => {
                this.movePieceDown();
            }, 1000 - (this.level * 50));
        }
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameInterval);
        alert(`Game Over! Score final : ${this.score}`);
    }

    renderPiece() {
        // Effacer l'ancienne position
        const cells = this.gameBoard.getElementsByClassName('cell');
        Array.from(cells).forEach(cell => cell.classList.remove('filled'));

        // Afficher la grille fixe
        this.grid.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    cells[y * 10 + x].classList.add('filled');
                }
            });
        });

        // Afficher la pièce courante
        this.currentPiece.shape.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell && 
                    this.currentPiece.y + y >= 0 && 
                    this.currentPiece.y + y < 20 && 
                    this.currentPiece.x + x >= 0 && 
                    this.currentPiece.x + x < 10) {
                    cells[(this.currentPiece.y + y) * 10 + this.currentPiece.x + x].classList.add('filled');
                }
            });
        });
    }

    renderNextPiece() {
        // Nettoyer l'affichage
        this.nextPieceDisplay.innerHTML = '';
        
        // Créer une grille 4x4 pour l'affichage
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            this.nextPieceDisplay.appendChild(cell);
        }

        // Centrer la pièce dans l'affichage
        const cells = this.nextPieceDisplay.getElementsByClassName('cell');
        const offsetY = Math.floor((4 - this.nextPiece.shape.length) / 2);
        const offsetX = Math.floor((4 - this.nextPiece.shape[0].length) / 2);

        this.nextPiece.shape.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    const index = (y + offsetY) * 4 + (x + offsetX);
                    if (index >= 0 && index < cells.length) {
                        cells[index].classList.add('filled');
                    }
                }
            });
        });
    }

    freezePiece() {
        this.currentPiece.shape.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    const newY = this.currentPiece.y + y;
                    const newX = this.currentPiece.x + x;
                    if (newY >= 0 && newY < 20 && newX >= 0 && newX < 10) {
                        this.grid[newY][newX] = 1;
                    }
                }
            });
        });
    }
}

// Initialisation du jeu
const game = new Tetris(); 
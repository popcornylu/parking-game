class ParkingGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        this.currentLevel = 0;
        this.gameState = 'menu'; // menu, playing, paused, completed, failed
        this.score = 0;
        this.startTime = 0;
        this.levelTime = 0;
        
        this.keys = {};
        this.setupControls();
        
        this.car = {
            x: 100,
            y: 300,
            width: 40,
            height: 20,
            angle: 0,
            speed: 0,
            maxSpeed: 3,
            acceleration: 0.3,
            friction: 0.1,
            turnSpeed: 0.05
        };
        
        this.obstacles = [];
        this.parkingSpaces = [];
        this.otherCars = [];
        
        this.gameLoop();
        this.showInstructions();
    }
    
    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            e.preventDefault();
        });
    }
    
    showInstructions() {
        document.getElementById('instructions').style.display = 'block';
    }
    
    hideInstructions() {
        document.getElementById('instructions').style.display = 'none';
        this.gameState = 'menu';
    }
    
    startLevel(levelNum) {
        this.currentLevel = levelNum;
        this.gameState = 'playing';
        this.startTime = Date.now();
        this.setupLevel(levelNum);
        this.updateUI();
    }
    
    setupLevel(levelNum) {
        this.obstacles = [];
        this.parkingSpaces = [];
        this.otherCars = [];
        
        if (levelNum === 1) {
            // 第一關：倒車入庫
            this.setupReverseParking();
        } else if (levelNum === 2) {
            // 第二關：路邊停車
            this.setupParallelParking();
        }
    }
    
    setupReverseParking() {
        // 重置車輛位置
        this.car.x = this.canvas.width / 2;
        this.car.y = this.canvas.height - 100;
        this.car.angle = -Math.PI / 2; // 面向上方
        this.car.speed = 0;
        
        // 創建停車格（在上方）
        const spaceWidth = 80;
        const spaceHeight = 120;
        const spaceX = this.canvas.width / 2 - spaceWidth / 2;
        const spaceY = 50;
        
        this.parkingSpaces.push({
            x: spaceX,
            y: spaceY,
            width: spaceWidth,
            height: spaceHeight,
            type: 'target'
        });
        
        // 創建障礙物（停車格周圍的柱子）
        const pillarSize = 20;
        this.obstacles.push(
            // 左側柱子
            { x: spaceX - pillarSize, y: spaceY - pillarSize, width: pillarSize, height: spaceHeight + pillarSize * 2 },
            // 右側柱子
            { x: spaceX + spaceWidth, y: spaceY - pillarSize, width: pillarSize, height: spaceHeight + pillarSize * 2 },
            // 後方牆壁
            { x: spaceX - pillarSize, y: spaceY - pillarSize, width: spaceWidth + pillarSize * 2, height: pillarSize }
        );
        
        // 添加一些其他障礙物增加難度
        this.obstacles.push(
            { x: 50, y: 200, width: 100, height: 20 },
            { x: this.canvas.width - 150, y: 200, width: 100, height: 20 }
        );
    }
    
    setupParallelParking() {
        // 重置車輛位置
        this.car.x = 100;
        this.car.y = this.canvas.height / 2;
        this.car.angle = 0; // 面向右方
        this.car.speed = 0;
        
        // 創建路邊停車空間
        const spaceWidth = 100;
        const spaceHeight = 40;
        const spaceX = this.canvas.width / 2 - spaceWidth / 2;
        const spaceY = 100;
        
        this.parkingSpaces.push({
            x: spaceX,
            y: spaceY,
            width: spaceWidth,
            height: spaceHeight,
            type: 'target'
        });
        
        // 創建路邊的其他車輛
        this.otherCars.push(
            // 停車空間前面的車
            { x: spaceX - 110, y: spaceY, width: 80, height: 35, color: '#e74c3c' },
            // 停車空間後面的車
            { x: spaceX + spaceWidth + 30, y: spaceY, width: 80, height: 35, color: '#9b59b6' }
        );
        
        // 創建路邊線
        this.obstacles.push(
            // 人行道
            { x: 0, y: 0, width: this.canvas.width, height: 80 }
        );
    }
    
    updateCar() {
        if (this.gameState !== 'playing') return;
        
        // 處理輸入
        let acceleration = 0;
        let turning = 0;
        
        if (this.keys['ArrowUp']) {
            acceleration = this.car.acceleration;
        }
        if (this.keys['ArrowDown']) {
            acceleration = -this.car.acceleration;
        }
        if (this.keys['ArrowLeft']) {
            turning = -this.car.turnSpeed;
        }
        if (this.keys['ArrowRight']) {
            turning = this.car.turnSpeed;
        }
        
        // 更新速度
        this.car.speed += acceleration;
        this.car.speed *= (1 - this.car.friction);
        
        // 限制最大速度
        if (Math.abs(this.car.speed) > this.car.maxSpeed) {
            this.car.speed = this.car.maxSpeed * Math.sign(this.car.speed);
        }
        
        // 只有在移動時才能轉向
        if (Math.abs(this.car.speed) > 0.1) {
            this.car.angle += turning * Math.sign(this.car.speed);
        }
        
        // 更新位置
        this.car.x += Math.cos(this.car.angle) * this.car.speed;
        this.car.y += Math.sin(this.car.angle) * this.car.speed;
        
        // 邊界檢查
        this.car.x = Math.max(this.car.width/2, Math.min(this.canvas.width - this.car.width/2, this.car.x));
        this.car.y = Math.max(this.car.height/2, Math.min(this.canvas.height - this.car.height/2, this.car.y));
    }
    
    checkCollisions() {
        const carRect = this.getCarBounds();
        
        // 檢查與障礙物的碰撞
        for (let obstacle of this.obstacles) {
            if (this.isColliding(carRect, obstacle)) {
                this.gameState = 'failed';
                return;
            }
        }
        
        // 檢查與其他車輛的碰撞
        for (let otherCar of this.otherCars) {
            if (this.isColliding(carRect, otherCar)) {
                this.gameState = 'failed';
                return;
            }
        }
        
        // 檢查是否成功停車
        for (let space of this.parkingSpaces) {
            if (space.type === 'target' && this.isInParkingSpace(carRect, space)) {
                if (Math.abs(this.car.speed) < 0.1) { // 車輛需要靜止
                    this.gameState = 'completed';
                    this.score += this.calculateScore();
                }
            }
        }
    }
    
    getCarBounds() {
        return {
            x: this.car.x - this.car.width / 2,
            y: this.car.y - this.car.height / 2,
            width: this.car.width,
            height: this.car.height
        };
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    isInParkingSpace(carRect, space) {
        return carRect.x >= space.x + 5 &&
               carRect.x + carRect.width <= space.x + space.width - 5 &&
               carRect.y >= space.y + 5 &&
               carRect.y + carRect.height <= space.y + space.height - 5;
    }
    
    calculateScore() {
        const timeBonus = Math.max(0, 10000 - this.levelTime);
        return 1000 + timeBonus;
    }
    
    resetLevel() {
        if (this.currentLevel > 0) {
            this.startLevel(this.currentLevel);
        }
    }
    
    render() {
        // 清空畫布
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製停車空間
        for (let space of this.parkingSpaces) {
            this.ctx.strokeStyle = '#f1c40f';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([10, 5]);
            this.ctx.strokeRect(space.x, space.y, space.width, space.height);
            this.ctx.setLineDash([]);
            
            if (space.type === 'target') {
                this.ctx.fillStyle = 'rgba(241, 196, 15, 0.3)';
                this.ctx.fillRect(space.x, space.y, space.width, space.height);
            }
        }
        
        // 繪製障礙物
        this.ctx.fillStyle = '#95a5a6';
        for (let obstacle of this.obstacles) {
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
        
        // 繪製其他車輛
        for (let otherCar of this.otherCars) {
            this.ctx.fillStyle = otherCar.color || '#34495e';
            this.ctx.fillRect(otherCar.x, otherCar.y, otherCar.width, otherCar.height);
            
            // 車輛細節
            this.ctx.fillStyle = '#2c3e50';
            this.ctx.fillRect(otherCar.x + 5, otherCar.y + 5, otherCar.width - 10, otherCar.height - 10);
        }
        
        // 繪製玩家車輛
        this.ctx.save();
        this.ctx.translate(this.car.x, this.car.y);
        this.ctx.rotate(this.car.angle);
        
        // 車身
        this.ctx.fillStyle = '#3498db';
        this.ctx.fillRect(-this.car.width/2, -this.car.height/2, this.car.width, this.car.height);
        
        // 車窗
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.fillRect(-this.car.width/2 + 5, -this.car.height/2 + 3, this.car.width - 10, this.car.height - 6);
        
        // 車頭指示
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(this.car.width/2 - 3, -this.car.height/4, 6, this.car.height/2);
        
        this.ctx.restore();
        
        // 繪製遊戲狀態
        if (this.gameState === 'failed') {
            this.drawGameOverScreen('挑戰失敗！', '#e74c3c');
        } else if (this.gameState === 'completed') {
            this.drawGameOverScreen('恭喜過關！', '#27ae60');
        }
    }
    
    drawGameOverScreen(message, color) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = color;
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(message, this.canvas.width/2, this.canvas.height/2);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('按重新開始按鈕再試一次', this.canvas.width/2, this.canvas.height/2 + 50);
    }
    
    updateUI() {
        if (this.gameState === 'playing') {
            this.levelTime = Date.now() - this.startTime;
        }
        
        const minutes = Math.floor(this.levelTime / 60000);
        const seconds = Math.floor((this.levelTime % 60000) / 1000);
        
        document.getElementById('score').textContent = this.score;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (this.currentLevel === 1) {
            document.getElementById('levelTitle').textContent = '第一關：倒車入庫';
            document.getElementById('levelDesc').textContent = '將車輛倒車停入黃色區域';
        } else if (this.currentLevel === 2) {
            document.getElementById('levelTitle').textContent = '第二關：路邊停車';
            document.getElementById('levelDesc').textContent = '在兩台車之間平行停車';
        }
    }
    
    gameLoop() {
        this.updateCar();
        this.checkCollisions();
        this.render();
        this.updateUI();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 全域函數
function hideInstructions() {
    game.hideInstructions();
}

// 啟動遊戲
const game = new ParkingGame();
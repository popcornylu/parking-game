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
        
        this.currentLevelType = null;
        this.currentLevelNum = null;
        
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
        
        // 只在遊戲畫布上防止觸控事件的預設行為
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
    
    // 手機觸控控制方法
    mobileControlStart(direction) {
        switch(direction) {
            case 'forward':
                this.keys['ArrowUp'] = true;
                break;
            case 'reverse':
                this.keys['ArrowDown'] = true;
                break;
            case 'left':
                this.keys['ArrowLeft'] = true;
                break;
            case 'right':
                this.keys['ArrowRight'] = true;
                break;
        }
    }
    
    mobileControlEnd(direction) {
        switch(direction) {
            case 'forward':
                this.keys['ArrowUp'] = false;
                break;
            case 'reverse':
                this.keys['ArrowDown'] = false;
                break;
            case 'left':
                this.keys['ArrowLeft'] = false;
                break;
            case 'right':
                this.keys['ArrowRight'] = false;
                break;
        }
    }
    
    showInstructions() {
        document.getElementById('instructions').style.display = 'block';
    }
    
    hideInstructions() {
        document.getElementById('instructions').style.display = 'none';
        this.gameState = 'menu';
    }
    
    startLevel(levelType, levelNum = 1) {
        if (typeof levelType === 'number') {
            // 兼容舊版本調用方式
            this.currentLevelType = levelType;
            this.currentLevelNum = 1;
        } else {
            this.currentLevelType = levelType;
            this.currentLevelNum = levelNum;
        }
        this.gameState = 'playing';
        this.startTime = Date.now();
        this.setupLevel();
        this.updateUI();
    }
    
    setupLevel() {
        this.obstacles = [];
        this.parkingSpaces = [];
        this.otherCars = [];
        
        console.log('設定關卡:', this.currentLevelType, this.currentLevelNum);
        
        if (this.currentLevelType === 1 || this.currentLevelType === 'reverse') {
            this.setupReverseParking(this.currentLevelNum);
        } else if (this.currentLevelType === 2 || this.currentLevelType === 'parallel') {
            this.setupParallelParking(this.currentLevelNum);
        }
        
        console.log('關卡設定完成 - 障礙物:', this.obstacles.length, '停車格:', this.parkingSpaces.length, '其他車輛:', this.otherCars.length);
    }
    
    setupReverseParking(level = 1) {
        // 基礎設定
        this.car.speed = 0;
        
        const configs = {
            1: { // 第一關：基礎倒車入庫
                carX: this.canvas.width / 2,
                carY: this.canvas.height - 100,
                carAngle: -Math.PI / 2,
                spaceWidth: 80,
                spaceHeight: 120,
                spaceX: this.canvas.width / 2 - 40,
                spaceY: 50,
                obstacles: [
                    { x: this.canvas.width / 2 - 60, y: 30, width: 20, height: 140 },
                    { x: this.canvas.width / 2 + 40, y: 30, width: 20, height: 140 },
                    { x: this.canvas.width / 2 - 60, y: 30, width: 120, height: 20 }
                ]
            },
            2: { // 第二關：稍小停車格
                carX: this.canvas.width / 2,
                carY: this.canvas.height - 100,
                carAngle: -Math.PI / 2,
                spaceWidth: 70,
                spaceHeight: 110,
                spaceX: this.canvas.width / 2 - 35,
                spaceY: 60,
                obstacles: [
                    { x: this.canvas.width / 2 - 55, y: 40, width: 20, height: 130 },
                    { x: this.canvas.width / 2 + 35, y: 40, width: 20, height: 130 },
                    { x: this.canvas.width / 2 - 55, y: 40, width: 110, height: 20 },
                    { x: 100, y: 250, width: 80, height: 20 }
                ]
            },
            3: { // 第三關：L型停車格
                carX: this.canvas.width / 2 + 50,
                carY: this.canvas.height - 120,
                carAngle: Math.PI,
                spaceWidth: 75,
                spaceHeight: 100,
                spaceX: this.canvas.width / 2 - 37,
                spaceY: 50,
                obstacles: [
                    { x: this.canvas.width / 2 - 57, y: 30, width: 20, height: 120 },
                    { x: this.canvas.width / 2 + 38, y: 30, width: 20, height: 80 },
                    { x: this.canvas.width / 2 - 57, y: 30, width: 115, height: 20 },
                    { x: this.canvas.width / 2 - 100, y: 200, width: 60, height: 20 },
                    { x: this.canvas.width / 2 + 80, y: 180, width: 60, height: 20 }
                ]
            },
            4: { // 第四關：有其他車輛
                carX: this.canvas.width / 2,
                carY: this.canvas.height - 100,
                carAngle: -Math.PI / 2,
                spaceWidth: 75,
                spaceHeight: 100,
                spaceX: this.canvas.width / 2 - 37,
                spaceY: 60,
                obstacles: [
                    { x: this.canvas.width / 2 - 57, y: 40, width: 20, height: 120 },
                    { x: this.canvas.width / 2 + 38, y: 40, width: 20, height: 120 },
                    { x: this.canvas.width / 2 - 57, y: 40, width: 115, height: 20 }
                ],
                otherCars: [
                    { x: this.canvas.width / 2 - 120, y: 250, width: 80, height: 35, color: '#e74c3c' },
                    { x: this.canvas.width / 2 + 60, y: 220, width: 80, height: 35, color: '#9b59b6' }
                ]
            },
            5: { // 第五關：窄通道
                carX: this.canvas.width / 2 + 80,
                carY: this.canvas.height - 150,
                carAngle: Math.PI,
                spaceWidth: 70,
                spaceHeight: 95,
                spaceX: this.canvas.width / 2 - 35,
                spaceY: 70,
                obstacles: [
                    { x: this.canvas.width / 2 - 55, y: 50, width: 20, height: 115 },
                    { x: this.canvas.width / 2 + 35, y: 50, width: 20, height: 115 },
                    { x: this.canvas.width / 2 - 55, y: 50, width: 110, height: 20 },
                    { x: this.canvas.width / 2 - 180, y: 200, width: 120, height: 25 },
                    { x: this.canvas.width / 2 + 80, y: 200, width: 120, height: 25 }
                ]
            },
            6: { // 第六關：斜角停車
                carX: this.canvas.width / 2 - 80,
                carY: this.canvas.height - 120,
                carAngle: Math.PI / 4,
                spaceWidth: 85,
                spaceHeight: 90,
                spaceX: this.canvas.width / 2 - 42,
                spaceY: 80,
                obstacles: [
                    { x: this.canvas.width / 2 - 62, y: 60, width: 20, height: 110 },
                    { x: this.canvas.width / 2 + 43, y: 60, width: 20, height: 110 },
                    { x: this.canvas.width / 2 - 62, y: 60, width: 125, height: 20 },
                    { x: 80, y: 180, width: 40, height: 40 },
                    { x: this.canvas.width - 120, y: 200, width: 40, height: 40 }
                ]
            },
            7: { // 第七關：多障礙物
                carX: this.canvas.width / 2,
                carY: this.canvas.height - 100,
                carAngle: -Math.PI / 2,
                spaceWidth: 65,
                spaceHeight: 85,
                spaceX: this.canvas.width / 2 - 32,
                spaceY: 90,
                obstacles: [
                    { x: this.canvas.width / 2 - 52, y: 70, width: 20, height: 105 },
                    { x: this.canvas.width / 2 + 33, y: 70, width: 20, height: 105 },
                    { x: this.canvas.width / 2 - 52, y: 70, width: 105, height: 20 },
                    { x: 60, y: 200, width: 30, height: 30 },
                    { x: 150, y: 250, width: 30, height: 30 },
                    { x: this.canvas.width - 90, y: 180, width: 30, height: 30 },
                    { x: this.canvas.width - 180, y: 230, width: 30, height: 30 }
                ]
            },
            8: { // 第八關：極窄停車格
                carX: this.canvas.width / 2 + 60,
                carY: this.canvas.height - 130,
                carAngle: -Math.PI / 3,
                spaceWidth: 55,
                spaceHeight: 80,
                spaceX: this.canvas.width / 2 - 27,
                spaceY: 100,
                obstacles: [
                    { x: this.canvas.width / 2 - 47, y: 80, width: 20, height: 100 },
                    { x: this.canvas.width / 2 + 28, y: 80, width: 20, height: 100 },
                    { x: this.canvas.width / 2 - 47, y: 80, width: 95, height: 20 }
                ],
                otherCars: [
                    { x: this.canvas.width / 2 - 140, y: 220, width: 75, height: 30, color: '#e74c3c' },
                    { x: this.canvas.width / 2 + 80, y: 200, width: 75, height: 30, color: '#9b59b6' },
                    { x: this.canvas.width / 2 - 60, y: 260, width: 75, height: 30, color: '#f39c12' }
                ]
            },
            9: { // 第九關：複雜環境
                carX: this.canvas.width / 2 - 100,
                carY: this.canvas.height - 140,
                carAngle: Math.PI / 6,
                spaceWidth: 60,
                spaceHeight: 75,
                spaceX: this.canvas.width / 2 - 30,
                spaceY: 110,
                obstacles: [
                    { x: this.canvas.width / 2 - 50, y: 90, width: 20, height: 95 },
                    { x: this.canvas.width / 2 + 30, y: 90, width: 20, height: 95 },
                    { x: this.canvas.width / 2 - 50, y: 90, width: 100, height: 20 },
                    { x: 40, y: 160, width: 25, height: 25 },
                    { x: 90, y: 210, width: 25, height: 25 },
                    { x: 140, y: 180, width: 25, height: 25 },
                    { x: this.canvas.width - 65, y: 150, width: 25, height: 25 },
                    { x: this.canvas.width - 115, y: 200, width: 25, height: 25 },
                    { x: this.canvas.width - 165, y: 230, width: 25, height: 25 }
                ]
            },
            10: { // 第十關：終極挑戰
                carX: this.canvas.width / 2 + 120,
                carY: this.canvas.height - 160,
                carAngle: -Math.PI / 4,
                spaceWidth: 50,
                spaceHeight: 70,
                spaceX: this.canvas.width / 2 - 25,
                spaceY: 120,
                obstacles: [
                    { x: this.canvas.width / 2 - 45, y: 100, width: 20, height: 90 },
                    { x: this.canvas.width / 2 + 25, y: 100, width: 20, height: 90 },
                    { x: this.canvas.width / 2 - 45, y: 100, width: 90, height: 20 },
                    { x: 30, y: 140, width: 20, height: 20 },
                    { x: 70, y: 180, width: 20, height: 20 },
                    { x: 110, y: 160, width: 20, height: 20 },
                    { x: 150, y: 200, width: 20, height: 20 },
                    { x: this.canvas.width - 50, y: 130, width: 20, height: 20 },
                    { x: this.canvas.width - 90, y: 170, width: 20, height: 20 },
                    { x: this.canvas.width - 130, y: 150, width: 20, height: 20 },
                    { x: this.canvas.width - 170, y: 190, width: 20, height: 20 }
                ],
                otherCars: [
                    { x: this.canvas.width / 2 - 150, y: 240, width: 70, height: 25, color: '#e74c3c' },
                    { x: this.canvas.width / 2 + 90, y: 220, width: 70, height: 25, color: '#9b59b6' },
                    { x: this.canvas.width / 2 - 80, y: 280, width: 70, height: 25, color: '#f39c12' },
                    { x: this.canvas.width / 2 + 30, y: 260, width: 70, height: 25, color: '#27ae60' }
                ]
            }
        };
        
        const config = configs[level] || configs[1];
        
        // 設定車輛位置
        this.car.x = config.carX;
        this.car.y = config.carY;
        this.car.angle = config.carAngle;
        
        // 創建停車格
        this.parkingSpaces.push({
            x: config.spaceX,
            y: config.spaceY,
            width: config.spaceWidth,
            height: config.spaceHeight,
            type: 'target'
        });
        
        // 添加障礙物
        this.obstacles.push(...config.obstacles);
        
        // 添加其他車輛
        if (config.otherCars) {
            this.otherCars.push(...config.otherCars);
        }
    }
    
    setupParallelParking(level = 1) {
        // 基礎設定
        this.car.speed = 0;
        
        const configs = {
            1: { // 第一關：基礎路邊停車
                carX: 150,
                carY: this.canvas.height / 2 + 50,
                carAngle: 0,
                spaceWidth: 100,
                spaceHeight: 40,
                spaceX: this.canvas.width / 2 - 50,
                spaceY: 120,
                obstacles: [
                    { x: 0, y: 0, width: this.canvas.width, height: 80 }
                ],
                otherCars: [
                    { x: this.canvas.width / 2 - 170, y: 120, width: 80, height: 35, color: '#e74c3c' },
                    { x: this.canvas.width / 2 + 70, y: 120, width: 80, height: 35, color: '#9b59b6' }
                ]
            },
            2: { // 第二關：較小停車空間
                carX: 120,
                carY: this.canvas.height / 2 + 60,
                carAngle: 0,
                spaceWidth: 85,
                spaceHeight: 38,
                spaceX: this.canvas.width / 2 - 42,
                spaceY: 130,
                obstacles: [
                    { x: 0, y: 0, width: this.canvas.width, height: 90 }
                ],
                otherCars: [
                    { x: this.canvas.width / 2 - 147, y: 130, width: 75, height: 33, color: '#e74c3c' },
                    { x: this.canvas.width / 2 + 53, y: 130, width: 75, height: 33, color: '#9b59b6' }
                ]
            },
            3: { // 第三關：斜角進入
                carX: 180,
                carY: this.canvas.height / 2 + 30,
                carAngle: Math.PI / 6,
                spaceWidth: 90,
                spaceHeight: 36,
                spaceX: this.canvas.width / 2 - 45,
                spaceY: 140,
                obstacles: [
                    { x: 0, y: 0, width: this.canvas.width, height: 100 },
                    { x: 50, y: 250, width: 60, height: 30 }
                ],
                otherCars: [
                    { x: this.canvas.width / 2 - 155, y: 140, width: 80, height: 32, color: '#e74c3c' },
                    { x: this.canvas.width / 2 + 55, y: 140, width: 80, height: 32, color: '#9b59b6' }
                ]
            },
            4: { // 第四關：窄空間
                carX: 100,
                carY: this.canvas.height / 2 + 80,
                carAngle: 0,
                spaceWidth: 75,
                spaceHeight: 35,
                spaceX: this.canvas.width / 2 - 37,
                spaceY: 150,
                obstacles: [
                    { x: 0, y: 0, width: this.canvas.width, height: 110 }
                ],
                otherCars: [
                    { x: this.canvas.width / 2 - 127, y: 150, width: 70, height: 30, color: '#e74c3c' },
                    { x: this.canvas.width / 2 + 48, y: 150, width: 70, height: 30, color: '#9b59b6' },
                    { x: this.canvas.width / 2 - 200, y: 220, width: 75, height: 30, color: '#f39c12' }
                ]
            },
            5: { // 第五關：多車道環境
                carX: 200,
                carY: this.canvas.height / 2 + 20,
                carAngle: -Math.PI / 8,
                spaceWidth: 80,
                spaceHeight: 34,
                spaceX: this.canvas.width / 2 - 40,
                spaceY: 160,
                obstacles: [
                    { x: 0, y: 0, width: this.canvas.width, height: 120 },
                    { x: 0, y: 280, width: this.canvas.width, height: 50 }
                ],
                otherCars: [
                    { x: this.canvas.width / 2 - 140, y: 160, width: 70, height: 28, color: '#e74c3c' },
                    { x: this.canvas.width / 2 + 50, y: 160, width: 70, height: 28, color: '#9b59b6' },
                    { x: 80, y: 200, width: 75, height: 30, color: '#f39c12' },
                    { x: this.canvas.width - 155, y: 220, width: 75, height: 30, color: '#27ae60' }
                ]
            },
            6: { // 第六關：T字路口停車
                carX: 250,
                carY: this.canvas.height / 2 - 20,
                carAngle: Math.PI / 4,
                spaceWidth: 70,
                spaceHeight: 32,
                spaceX: this.canvas.width / 2 - 35,
                spaceY: 170,
                obstacles: [
                    { x: 0, y: 0, width: this.canvas.width, height: 130 },
                    { x: 0, y: 250, width: 200, height: 30 },
                    { x: this.canvas.width - 200, y: 250, width: 200, height: 30 }
                ],
                otherCars: [
                    { x: this.canvas.width / 2 - 125, y: 170, width: 65, height: 28, color: '#e74c3c' },
                    { x: this.canvas.width / 2 + 45, y: 170, width: 65, height: 28, color: '#9b59b6' },
                    { x: 50, y: 210, width: 70, height: 25, color: '#f39c12' }
                ]
            },
            7: { // 第七關：極窄空間
                carX: 120,
                carY: this.canvas.height / 2 + 100,
                carAngle: 0,
                spaceWidth: 60,
                spaceHeight: 30,
                spaceX: this.canvas.width / 2 - 30,
                spaceY: 180,
                obstacles: [
                    { x: 0, y: 0, width: this.canvas.width, height: 140 }
                ],
                otherCars: [
                    { x: this.canvas.width / 2 - 105, y: 180, width: 55, height: 25, color: '#e74c3c' },
                    { x: this.canvas.width / 2 + 40, y: 180, width: 55, height: 25, color: '#9b59b6' },
                    { x: this.canvas.width / 2 - 180, y: 230, width: 65, height: 25, color: '#f39c12' },
                    { x: this.canvas.width / 2 + 120, y: 250, width: 65, height: 25, color: '#27ae60' }
                ]
            },
            8: { // 第八關：複雜路況
                carX: 300,
                carY: this.canvas.height / 2 - 50,
                carAngle: -Math.PI / 3,
                spaceWidth: 65,
                spaceHeight: 28,
                spaceX: this.canvas.width / 2 - 32,
                spaceY: 190,
                obstacles: [
                    { x: 0, y: 0, width: this.canvas.width, height: 150 },
                    { x: 40, y: 240, width: 30, height: 20 },
                    { x: 120, y: 260, width: 30, height: 20 },
                    { x: this.canvas.width - 70, y: 230, width: 30, height: 20 },
                    { x: this.canvas.width - 150, y: 270, width: 30, height: 20 }
                ],
                otherCars: [
                    { x: this.canvas.width / 2 - 112, y: 190, width: 50, height: 23, color: '#e74c3c' },
                    { x: this.canvas.width / 2 + 43, y: 190, width: 50, height: 23, color: '#9b59b6' },
                    { x: 200, y: 230, width: 60, height: 23, color: '#f39c12' }
                ]
            },
            9: { // 第九關：超難停車
                carX: 80,
                carY: this.canvas.height / 2 + 120,
                carAngle: Math.PI / 8,
                spaceWidth: 55,
                spaceHeight: 26,
                spaceX: this.canvas.width / 2 - 27,
                spaceY: 200,
                obstacles: [
                    { x: 0, y: 0, width: this.canvas.width, height: 160 },
                    { x: 30, y: 240, width: 25, height: 15 },
                    { x: 80, y: 250, width: 25, height: 15 },
                    { x: 130, y: 260, width: 25, height: 15 },
                    { x: this.canvas.width - 55, y: 235, width: 25, height: 15 },
                    { x: this.canvas.width - 105, y: 255, width: 25, height: 15 },
                    { x: this.canvas.width - 155, y: 265, width: 25, height: 15 }
                ],
                otherCars: [
                    { x: this.canvas.width / 2 - 92, y: 200, width: 45, height: 21, color: '#e74c3c' },
                    { x: this.canvas.width / 2 + 37, y: 200, width: 45, height: 21, color: '#9b59b6' },
                    { x: this.canvas.width / 2 - 150, y: 240, width: 50, height: 21, color: '#f39c12' },
                    { x: this.canvas.width / 2 + 100, y: 250, width: 50, height: 21, color: '#27ae60' }
                ]
            },
            10: { // 第十關：終極挑戰
                carX: 350,
                carY: this.canvas.height / 2 - 100,
                carAngle: -Math.PI / 2,
                spaceWidth: 50,
                spaceHeight: 24,
                spaceX: this.canvas.width / 2 - 25,
                spaceY: 210,
                obstacles: [
                    { x: 0, y: 0, width: this.canvas.width, height: 170 },
                    { x: 20, y: 250, width: 20, height: 12 },
                    { x: 50, y: 240, width: 20, height: 12 },
                    { x: 80, y: 260, width: 20, height: 12 },
                    { x: 110, y: 250, width: 20, height: 12 },
                    { x: 140, y: 270, width: 20, height: 12 },
                    { x: this.canvas.width - 40, y: 245, width: 20, height: 12 },
                    { x: this.canvas.width - 70, y: 235, width: 20, height: 12 },
                    { x: this.canvas.width - 100, y: 265, width: 20, height: 12 },
                    { x: this.canvas.width - 130, y: 255, width: 20, height: 12 },
                    { x: this.canvas.width - 160, y: 275, width: 20, height: 12 }
                ],
                otherCars: [
                    { x: this.canvas.width / 2 - 85, y: 210, width: 40, height: 19, color: '#e74c3c' },
                    { x: this.canvas.width / 2 + 35, y: 210, width: 40, height: 19, color: '#9b59b6' },
                    { x: this.canvas.width / 2 - 140, y: 250, width: 45, height: 19, color: '#f39c12' },
                    { x: this.canvas.width / 2 + 80, y: 260, width: 45, height: 19, color: '#27ae60' },
                    { x: this.canvas.width / 2 - 200, y: 280, width: 40, height: 19, color: '#e67e22' }
                ]
            }
        };
        
        const config = configs[level] || configs[1];
        
        // 設定車輛位置
        this.car.x = config.carX;
        this.car.y = config.carY;
        this.car.angle = config.carAngle;
        
        // 創建停車格
        this.parkingSpaces.push({
            x: config.spaceX,
            y: config.spaceY,
            width: config.spaceWidth,
            height: config.spaceHeight,
            type: 'target'
        });
        
        // 添加障礙物
        this.obstacles.push(...config.obstacles);
        
        // 添加其他車輛
        if (config.otherCars) {
            this.otherCars.push(...config.otherCars);
        }
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
        
        if (this.gameState === 'completed' && this.currentLevelNum < 10) {
            this.ctx.fillText('恭喜過關！點擊下一關繼續挑戰', this.canvas.width/2, this.canvas.height/2 + 50);
        } else if (this.gameState === 'completed' && this.currentLevelNum === 10) {
            this.ctx.fillText('恭喜完成所有關卡！', this.canvas.width/2, this.canvas.height/2 + 50);
        } else {
            this.ctx.fillText('按重新開始按鈕再試一次', this.canvas.width/2, this.canvas.height/2 + 50);
        }
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
        
        // 更新關卡資訊
        if (this.currentLevelType === 1 || this.currentLevelType === 'reverse') {
            document.getElementById('levelTitle').textContent = `倒車入庫 - 第 ${this.currentLevelNum || 1} 關`;
            document.getElementById('levelDesc').textContent = '將車輛倒車停入黃色區域';
        } else if (this.currentLevelType === 2 || this.currentLevelType === 'parallel') {
            document.getElementById('levelTitle').textContent = `路邊停車 - 第 ${this.currentLevelNum || 1} 關`;
            document.getElementById('levelDesc').textContent = '在指定空間內平行停車';
        } else {
            document.getElementById('levelTitle').textContent = '路邊停車挑戰';
            document.getElementById('levelDesc').textContent = '選擇挑戰模式開始遊戲';
        }
    }
    
    resetLevel() {
        if (this.currentLevelType && this.currentLevelNum) {
            this.startLevel(this.currentLevelType, this.currentLevelNum);
        }
    }
    
    nextLevel() {
        if (this.currentLevelType && this.currentLevelNum < 10) {
            this.startLevel(this.currentLevelType, this.currentLevelNum + 1);
        }
    }
    
    gameLoop() {
        this.updateCar();
        this.checkCollisions();
        this.render();
        this.updateUI();
        updateNextLevelButton();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 全域函數
function hideInstructions() {
    game.hideInstructions();
}

let currentLevelType = '';

function showLevelSelect(levelType) {
    currentLevelType = levelType;
    const title = levelType === 'reverse' ? '倒車入庫挑戰' : '路邊停車挑戰';
    document.getElementById('levelSelectTitle').textContent = title;
    
    const levelGrid = document.getElementById('levelGrid');
    levelGrid.innerHTML = '';
    
    // 生成10個關卡按鈕
    for (let i = 1; i <= 10; i++) {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        btn.textContent = `第${i}關`;
        btn.addEventListener('click', () => startSelectedLevel(levelType, i));
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            startSelectedLevel(levelType, i);
        });
        levelGrid.appendChild(btn);
    }
    
    document.getElementById('levelSelect').style.display = 'block';
}

function hideLevelSelect() {
    document.getElementById('levelSelect').style.display = 'none';
}

function startSelectedLevel(levelType, levelNum) {
    hideLevelSelect();
    game.startLevel(levelType, levelNum);
}

// 監聽遊戲狀態變化來顯示/隱藏下一關按鈕
function updateNextLevelButton() {
    const nextBtn = document.getElementById('nextLevelBtn');
    if (!nextBtn) return;
    
    if (game.gameState === 'completed' && game.currentLevelNum && game.currentLevelNum < 10) {
        nextBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'none';
    }
}

// 啟動遊戲
const game = new ParkingGame();
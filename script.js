const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏配置
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const COIN_VALUE = 100;

// 游戏状态
let gameState = {
    score: 0,
    coins: 0,
    gameOver: false
};

// 马里奥
const mario = {
    x: 50,
    y: 300,
    width: 40,
    height: 50,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
    direction: 'right',
    frameIndex: 0,
    frameTimer: 0
};

// 平台
const platforms = [
    { x: 0, y: 360, width: 800, height: 40, color: '#8B4513' }, // 地面
    { x: 150, y: 280, width: 120, height: 20, color: '#DEB887' },
    { x: 350, y: 220, width: 120, height: 20, color: '#DEB887' },
    { x: 550, y: 280, width: 120, height: 20, color: '#DEB887' },
    { x: 200, y: 150, width: 100, height: 20, color: '#DEB887' },
    { x: 500, y: 120, width: 100, height: 20, color: '#DEB887' },
];

// 金币
let coins = [
    { x: 200, y: 250, width: 20, height: 20, collected: false },
    { x: 400, y: 190, width: 20, height: 20, collected: false },
    { x: 600, y: 250, width: 20, height: 20, collected: false },
    { x: 250, y: 120, width: 20, height: 20, collected: false },
    { x: 550, y: 90, width: 20, height: 20, collected: false },
    { x: 100, y: 320, width: 20, height: 20, collected: false },
    { x: 700, y: 320, width: 20, height: 20, collected: false },
];

// 敌人
let enemies = [
    { x: 300, y: 320, width: 35, height: 30, velocityX: -2, color: '#e74c3c' },
    { x: 500, y: 320, width: 35, height: 30, velocityX: 2, color: '#e74c3c' },
    { x: 650, y: 240, width: 35, height: 30, velocityX: -1.5, color: '#e74c3c' },
];

// 键盘输入
const keys = {
    left: false,
    right: false,
    space: false
};

// 键盘事件
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
    if (e.code === 'Space') {
        e.preventDefault();
        if (mario.onGround && !keys.space) {
            mario.velocityY = JUMP_FORCE;
            mario.onGround = false;
        }
        keys.space = true;
    }
    if (e.code === 'KeyR') restartGame();
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
    if (e.code === 'Space') keys.space = false;
});

// 绘制马里奥
function drawMario() {
    ctx.save();
    ctx.translate(mario.x + mario.width / 2, mario.y + mario.height / 2);
    ctx.scale(mario.direction === 'left' ? -1 : 1, 1);

    // 身体
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(-15, -15, 30, 20);

    // 衣服
    ctx.fillStyle = '#3498db';
    ctx.fillRect(-15, 5, 30, 15);

    // 背带裤
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(-15, 5, 30, 8);

    // 头
    ctx.fillStyle = '#f4d03f';
    ctx.beginPath();
    ctx.arc(0, -20, 10, 0, Math.PI * 2);
    ctx.fill();

    // 帽子
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(-12, -28, 24, 6);
    ctx.fillRect(-8, -32, 16, 6);

    // M 标志
    ctx.fillStyle = 'white';
    ctx.font = 'bold 6px Arial';
    ctx.fillText('M', -3, -26);

    // 眼睛
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(4, -22, 2, 0, Math.PI * 2);
    ctx.fill();

    // 胡子
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(5, -17, 6, 2);

    ctx.restore();
}

// 绘制平台
function drawPlatforms() {
    platforms.forEach(platform => {
        // 平台主体
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

        // 顶部草地装饰（如果是地面）
        if (platform.y >= 350) {
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(platform.x, platform.y, platform.width, 5);
        }

        // 砖块纹理
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 1;
        for (let i = 0; i < platform.width; i += 20) {
            ctx.strokeRect(platform.x + i, platform.y, 20, platform.height);
        }
    });
}

// 绘制金币
function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.save();
            ctx.translate(coin.x + coin.width / 2, coin.y + coin.height / 2);

            // 金币外圈
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();

            // 金币内圈
            ctx.fillStyle = '#f4d03f';
            ctx.beginPath();
            ctx.arc(0, 0, 7, 0, Math.PI * 2);
            ctx.fill();

            // 金币光泽
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-3, -3, 2, 0, Math.PI * 2);
            ctx.fill();

            // $ 符号
            ctx.fillStyle = '#b7950b';
            ctx.font = 'bold 10px Arial';
            ctx.fillText('$', -3, 3);

            ctx.restore();
        }
    });
}

// 绘制敌人
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.save();
        ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

        // 身体
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(0, -5, 15, Math.PI, 0);
        ctx.lineTo(15, 10);
        ctx.lineTo(-15, 10);
        ctx.closePath();
        ctx.fill();

        // 眼睛
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-5, -5, 5, 0, Math.PI * 2);
        ctx.arc(5, -5, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-4, -5, 2, 0, Math.PI * 2);
        ctx.arc(6, -5, 2, 0, Math.PI * 2);
        ctx.fill();

        // 嘴巴
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(-8, 0, 16, 3);

        // 腿
        ctx.fillStyle = enemy.color;
        ctx.fillRect(-12, 10, 8, 8);
        ctx.fillRect(4, 10, 8, 8);

        ctx.restore();
    });
}

// 绘制背景
function drawBackground() {
    // 天空
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#5BA3C6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 云朵
    drawCloud(100, 50, 60);
    drawCloud(300, 80, 50);
    drawCloud(550, 40, 70);
    drawCloud(700, 100, 45);
}

function drawCloud(x, y, size) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x + size * 0.4, y - size * 0.1, size * 0.4, 0, Math.PI * 2);
    ctx.arc(x + size * 0.8, y, size * 0.45, 0, Math.PI * 2);
    ctx.fill();
}

// 更新游戏
function update() {
    if (gameState.gameOver) return;

    // 马里奥移动
    if (keys.left) {
        mario.velocityX = -MOVE_SPEED;
        mario.direction = 'left';
    } else if (keys.right) {
        mario.velocityX = MOVE_SPEED;
        mario.direction = 'right';
    } else {
        mario.velocityX = 0;
    }

    // 重力
    mario.velocityY += GRAVITY;

    // 更新位置
    mario.x += mario.velocityX;
    mario.y += mario.velocityY;

    // 边界检查
    if (mario.x < 0) mario.x = 0;
    if (mario.x > canvas.width - mario.width) mario.x = canvas.width - mario.width;

    // 平台碰撞检测
    mario.onGround = false;
    platforms.forEach(platform => {
        if (mario.x < platform.x + platform.width &&
            mario.x + mario.width > platform.x &&
            mario.y + mario.height > platform.y &&
            mario.y + mario.height < platform.y + platform.height + mario.velocityY + 1 &&
            mario.velocityY >= 0) {
            mario.y = platform.y - mario.height;
            mario.velocityY = 0;
            mario.onGround = true;
        }
    });

    // 更新敌人位置
    enemies.forEach(enemy => {
        enemy.x += enemy.velocityX;

        // 边界反弹
        if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) {
            enemy.velocityX *= -1;
        }

        // 与马里奥碰撞
        if (mario.x < enemy.x + enemy.width &&
            mario.x + mario.width > enemy.x &&
            mario.y < enemy.y + enemy.height &&
            mario.y + mario.height > enemy.y) {

            // 如果马里奥在上方跳跃攻击
            if (mario.velocityY > 0 && mario.y + mario.height < enemy.y + enemy.height / 2) {
                // 击败敌人
                enemy.x = -100;
                gameState.score += 200;
                updateScore();
                mario.velocityY = JUMP_FORCE / 2; // 反弹
            } else {
                // 马里奥死亡
                endGame();
            }
        }
    });

    // 金币收集
    coins.forEach(coin => {
        if (!coin.collected) {
            if (mario.x < coin.x + coin.width &&
                mario.x + mario.width > coin.x &&
                mario.y < coin.y + coin.height &&
                mario.y + mario.height > coin.y) {
                coin.collected = true;
                gameState.coins++;
                gameState.score += COIN_VALUE;
                updateScore();
            }
        }
    });

    // 危险区域检测
    if (mario.y > canvas.height) {
        endGame();
    }
}

// 更新分数显示
function updateScore() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('coins').textContent = gameState.coins;
}

// 结束游戏
function endGame() {
    gameState.gameOver = true;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOver').classList.remove('hidden');
}

// 重新开始游戏
function restartGame() {
    gameState = {
        score: 0,
        coins: 0,
        gameOver: false
    };

    mario.x = 50;
    mario.y = 300;
    mario.velocityX = 0;
    mario.velocityY = 0;
    mario.direction = 'right';

    // 重置金币
    coins.forEach(coin => {
        coin.collected = false;
    });

    // 重置敌人
    enemies = [
        { x: 300, y: 320, width: 35, height: 30, velocityX: -2, color: '#e74c3c' },
        { x: 500, y: 320, width: 35, height: 30, velocityX: 2, color: '#e74c3c' },
        { x: 650, y: 240, width: 35, height: 30, velocityX: -1.5, color: '#e74c3c' },
    ];

    updateScore();
    document.getElementById('gameOver').classList.add('hidden');
}

// 游戏主循环
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// 绘制游戏
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawPlatforms();
    drawCoins();
    drawEnemies();
    drawMario();
}

// 初始化游戏
updateScore();
gameLoop();

// 导出重新开始函数到全局作用域
window.restartGame = restartGame;

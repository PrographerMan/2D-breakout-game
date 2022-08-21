class Shape {
    constructor(x = 0, y = 0) {
        this.context = ctx;
        this.x = x;
        this.y = y;
    }

    draw(context) {
        
    }
}

class Brick extends Shape {
    static brickWidth = 75;
    static brickHeight = 20;
    static brickPadding = 10;
    static brickOffsetTop = 30;
    static brickOffsetLeft = 30;

    constructor(x = 0, y = 0, exists = true) {
        super(x, y);

        this.exists = exists;
    }

    draw() {
        this.context.beginPath();
        this.context.rect(this.x, this.y, Brick.brickWidth, Brick.brickHeight);
        this.context.fillStyle = primaryColor;
        this.context.fill();
        this.context.closePath();
    }

    destroy() {
        this.exists = false;
    }
}

class Ball extends Shape {
    constructor(x, y) {
        super(x, y);

        this.radius = 10;
        this.dx = 1;
        this.dy = 1;
    }

    draw() {
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.context.fillStyle = primaryColor;
        this.context.fill();
        this.context.closePath();
    }

    collidedWithBrick(brick) {
        if (this.x > brick.x && this.x < brick.x + Brick.brickWidth
            && this.y > brick.y && this.y < brick.y + Brick.brickHeight) return true;
        
        return false;
    }

    restorePosition() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 30;
        this.dx = 1;
        this.dy = -1;
    }

    move() {
        this.x += this.dx;
        this.y += this.dy;
    }
}

class Paddle extends Shape {
    constructor(x) {
        super(x, canvas.height - 10);
        
        this.width = 75;
        this.height = 10;
    }

    draw() {
        this.context.beginPath();
        this.context.rect(this.x, this.y, this.width, this.height);
        this.context.fillStyle = primaryColor;
        this.context.fill();
        this.context.closePath();
    }
    
    restorePosition() {
        this.x = (canvas.width - this.width) / 2;
    }
}

function setLevel() {
    if (level == levelsMaps.length - 1) {
        gameOver();
    } else {
        level++;
        reloadGame();
    }
}

function gameOver() {
    level = 0;
    alert(`Your score: ${score}`);
    
    if (confirm('Would you like to restart the game?')) {
        reloadGame();
    }
}

function initBricks(level) {
    bricks = levelsMaps[level].map((levelsMapsRow, levelsMapsIndex) => {
        return levelsMapsRow.map((isBrickExist, brickIndex) => {
            if (isBrickExist) bricksAmount++;

            const brickX = (brickIndex * (Brick.brickWidth + Brick.brickPadding)) + Brick.brickOffsetLeft;
            const brickY = (levelsMapsIndex * (Brick.brickHeight + Brick.brickPadding)) + Brick.brickOffsetTop;
    
            return new Brick(brickX, brickY, isBrickExist);
        });
    });
}

function collisionDetection() {
    bricks.map((bricksRow) => {
        bricksRow.map((brick) => {
            if (brick.exists) {
                balls.forEach((ball) => {
                    const leftWallTouched = ball.x + ball.dx > canvas.width - ball.radius;
                    const rightWallTouched = ball.x + ball.dx < ball.radius;
                    const topWallTouched = ball.y + ball.dy < ball.radius;
                    const bottomWallTouched = ball.y + ball.dy > canvas.height - ball.radius;
                    const paddleTouched = ball.x > paddle.x && ball.x < paddle.x + paddle.width;

                    // bricks
                    if (ball.collidedWithBrick(brick)) {
                        ball.dy = -ball.dy;
                        brick.destroy();
                        score++;
                        
                        if (score == bricksAmount) {
                            alert("YOU WIN, CONGRATS!");
                            
                            setLevel();
                        }
                    }

                    // walls
                    if (leftWallTouched || rightWallTouched) {
                        ball.dx = -ball.dx;
                    }
                    
                    if (topWallTouched) {
                        ball.dy = -ball.dy;
                    } else if (bottomWallTouched) {
                        if (paddleTouched) {
                            ball.dy = -ball.dy;
                        } else {
                            loose();
                            ball.restorePosition();
                            paddle.restorePosition();
                        }
                    }
                });
            }
        });
    });
}

function reloadGame() {
    score = 0;
    lives = 3;
    bricksAmount = 0;
    initBricks(level);
}

function loose() {
    lives--;
    if (!lives) {
        alert("GAME OVER");
        reloadGame();
    }
}

function drawBalls() {
    balls.forEach(ball => ball.draw());
}

function drawBricks() {
    bricks.forEach(bricksRow => {
        bricksRow.forEach(brick => {
            if (brick.exists) brick.draw();
        });
    });
}

function drawScore() {
    ctx.font = primaryFontStyle;
    ctx.fillStyle = primaryColor;
    ctx.fillText(`Score: ${score}`, 8, 20);
}

function drawLives() {
    ctx.font = primaryFontStyle;
    ctx.fillStyle = primaryColor;
    ctx.fillText(`Lives: ${lives}`, canvas.width - 65, 20);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBalls();
    paddle.draw();
    drawScore();
    drawLives();
    collisionDetection();

    balls.forEach((ball) => {
        if (rightPressed && paddle.x < canvas.width - paddle.width) {
            paddle.x += 1;
        }
        else if (leftPressed && paddle.x > 0) {
            paddle.x -= 1;
        }

        ball.move();
    });

    requestAnimationFrame(draw);
}

function keyDownHandler(e) {
    if (e.keyCode == 39) {
        rightPressed = true;
    } else if (e.keyCode == 37) {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.keyCode == 39) {
        rightPressed = false;
    } else if (e.keyCode == 37) {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    
    if (paddle.x > 0 && paddle.x < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
    }
}


const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

let balls = [
    new Ball(canvas.width / 2, canvas.height - 30),
    new Ball(canvas.width / 2, canvas.height - 70)
];

let paddle = new Paddle((canvas.width - this.width) / 2)

let rightPressed = false;
let leftPressed = false;

const primaryColor = '#0095DD';
const primaryFontStyle = '16px Arial';

let score = 0;
let lives = 3;
let level = 0;
let bricksAmount = 0;
let bricks = [];

const levelsMaps = [
    [
        [1, 1, 0, 1, 1],
        [1, 1, 0, 1, 1],
        [1, 1, 0, 1, 1]
    ],
    [
        [0, 1, 1, 1, 0],
        [1, 0, 1, 0, 1],
        [1, 1, 0, 1, 1]
    ],
    [
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1]
    ]
];

initBricks(level);

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("mousemove", mouseMoveHandler);

draw();
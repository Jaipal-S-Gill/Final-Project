// Board
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;

// Players
let playerWidth = 80; // 500 for testing, 80 normal
let playerHeight = 10;
let playerVelocityX = 10; // Move 10 pixels each time

let player = {
    x: boardWidth / 2 - playerWidth / 2,
    y: boardHeight - playerHeight - 5,
    width: playerWidth,
    height: playerHeight,
    velocityX: playerVelocityX
};

let lastPowerUpTime = 0;

// Ball
let balls = [
    {
        x: boardWidth / 2,
        y: boardHeight / 2,
        width: 10,
        height: 10,
        velocityX: 5,
        velocityY: 5
    }
];

// Blocks
let blockArray = [];
let blockWidth = 50;
let blockHeight = 10;
let blockColumns = 8;
let blockRows = 3;
let blockMaxRows = 10;
let blockCount = 0;

let blockX = 15;
let blockY = 45;

let score = 0;
let gameOver = false;

// Power-up
let powerUp = {
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    active: false
};

function outOfBounds(xPosition) {
    return xPosition < 0 || xPosition + player.width > boardWidth;
}

function update() {
    requestAnimationFrame(update);

    // Clear the canvas
    context.clearRect(0, 0, board.width, board.height);

    // Draw power-up
    if (powerUp.active) {
        context.fillStyle = "red"; // Change color for debugging
        context.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    }

    // Draw player
    context.fillStyle = "lightgreen";
    context.fillRect(player.x, player.y, player.width, player.height);

    // Draw balls
    context.fillStyle = "white";
    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        // Check for collisions with the borders
        if (ball.y <= 0 || ball.y + ball.height >= boardHeight) {
            ball.velocityY *= -1; // Reverse direction on collision with top or bottom
        }
        if (ball.x <= 0 || ball.x + ball.width >= boardWidth) {
            ball.velocityX *= -1; // Reverse direction on collision with left or right
        }

        context.fillRect(ball.x, ball.y, ball.width, ball.height);
    }

    // Bounce the ball off player paddle
    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];

        if (topCollision(ball, player) || bottomCollision(ball, player)) {
            ball.velocityY *= -1; // Flip y direction up or down
        } else if (leftCollision(ball, player) || rightCollision(ball, player)) {
            ball.velocityX *= -1; // Flip x direction left or right
        }
    }

    // Handle ball collisions with blocks
    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];

        for (let j = 0; j < blockArray.length; j++) {
            let block = blockArray[j];

            if (!block.break && detectCollision(ball, block)) {
                block.break = true; // Block is broken
                ball.velocityY *= -1; // Flip y direction up or down
                score += 100;
                blockCount -= 1;
            }
        }
    }

    // Remove broken blocks from the array
    blockArray = blockArray.filter((block) => !block.break);

    // Spawn 4 more balls if collision with power-up
    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];

        if (detectCollision(ball, powerUp) && powerUp.active) {
            powerUp.active = false; // Deactivate power-up
            spawnBalls(); // Spawn 4 more balls
        }
    }

    // Next level
    if (blockCount === 0) {
        score += 100 * blockRows * blockColumns; // Bonus points :)
        blockRows = Math.min(blockRows + 1, blockMaxRows);
        createBlocks();
    }

    // Draw blocks
    context.fillStyle = "skyblue";
    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        context.fillRect(block.x, block.y, block.width, block.height);
    }

    // Draw score
    context.font = "20px sans-serif";
    context.fillText(score, 10, 25);

    // Draw game over message
    if (gameOver) {
        context.fillText("Game Over: Press 'Space' to Restart", 80, 400);
    }
}

function movePlayer(e) {
    if (gameOver) {
        if (e.code == "Space") {
            resetGame();
            console.log("RESET");
        }
        return;
    }
    if (e.code == "ArrowLeft") {
        let nextPlayerX = player.x - player.velocityX;
        if (!outOfBounds(nextPlayerX)) {
            player.x = nextPlayerX;
        }
    } else if (e.code == "ArrowRight") {
        let nextPlayerX = player.x + player.velocityX;
        if (!outOfBounds(nextPlayerX)) {
            player.x = nextPlayerX;
        }
    }
}

function detectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function topCollision(ball, block) {
    return detectCollision(ball, block) && ball.y + ball.height >= block.y;
}

function bottomCollision(ball, block) {
    return detectCollision(ball, block) && block.y + block.height >= ball.y;
}

function leftCollision(ball, block) {
    return detectCollision(ball, block) && ball.x + ball.width >= block.x;
}

function rightCollision(ball, block) {
    return detectCollision(ball, block) && block.x + block.width >= ball.x;
}

function createBlocks() {
    blockArray = []; // Clear blockArray
    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            let block = {
                x: blockX + c * blockWidth + c * 10, // c*10 space 10 pixels apart columns
                y: blockY + r * blockHeight + r * 10, // r*10 space 10 pixels apart rows
                width: blockWidth,
                height: blockHeight,
                break: false
            };

            // Place power-up randomly, for example, when c equals a certain value
            if (c === 2 && r === 1) {
                powerUp.x = block.x + (block.width - powerUp.width) / 2;
                powerUp.y = block.y - powerUp.height;
                powerUp.active = true;
            }

            blockArray.push(block);
        }
    }
    blockCount = blockArray.length;
}

function resetGame() {
    gameOver = false;
    player = {
        x: boardWidth / 2 - playerWidth / 2,
        y: boardHeight - playerHeight - 5,
        width: playerWidth,
        height: playerHeight,
        velocityX: playerVelocityX
    };
    balls = [
        {
            x: boardWidth / 2,
            y: boardHeight / 2,
            width: ballWidth,
            height: ballHeight,
            velocityX: ballVelocityX,
            velocityY: ballVelocityY
        }
    ];
    blockArray = [];
    blockRows = 3;
    score = 0;
    createBlocks();
}

function spawnBalls() {
    // Create 4 new balls with different velocities
    let newBalls = [
        { x: ball.x, y: ball.y, velocityX: -ball.velocityX, velocityY: -ball.velocityY },
        { x: ball.x, y: ball.y, velocityX: ball.velocityX, velocityY: -ball.velocityY },
        { x: ball.x, y: ball.y, velocityX: -ball.velocityX, velocityY: ball.velocityY },
        { x: ball.x, y: ball.y, velocityX: ball.velocityX, velocityY: ball.velocityY }
    ];

    // Add the new balls to the existing balls array
    balls = balls.concat(newBalls);
}

function placePowerUpRandomly() {
    // Find a random block to place the power-up
    let randomColumn = Math.floor(Math.random() * blockColumns);
    let randomRow = Math.floor(Math.random() * blockRows);

    // Ensure the power-up is placed within the canvas bounds
    randomColumn = Math.min(randomColumn, blockColumns - 1);
    randomRow = Math.min(randomRow, blockRows - 1);

    // Calculate the position of the block
    let block = blockArray[randomColumn + randomRow * blockColumns];
    
    if (block) {
        powerUp.x = block.x + (block.width - powerUp.width) / 2;
        powerUp.y = block.y - powerUp.height;
        powerUp.active = true;
    }
}

function checkPowerUp() {
    // Get the current time
    let currentTime = Date.now();

    // Check if 7 seconds have passed since the last power-up appeared
    if (currentTime - lastPowerUpTime >= 7000) {
        // Place power-up randomly
        placePowerUpRandomly();
        lastPowerUpTime = currentTime; // Update the last power-up time
    }
}


window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); // Used for drawing on the board

    // Draw initial player
    context.fillStyle = "skyblue";
    context.fillRect(player.x, player.y, player.width, player.height);

    // Create blocks
    createBlocks();

    // Set up an interval to check for the power-up every second
    setInterval(checkPowerUp, 1000);

    requestAnimationFrame(update);
    document.addEventListener("keydown", movePlayer);
};

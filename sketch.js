'use strict';
/* global SlowObstacle,StopObstacle,Food,Snake,ElectricalObstacle,SpeedPotion,MysteryPotion,ConcretePotion,$ */

let customWindowWidth;
let customWindowHeight;
let wallmode = false;
let chaosmode = false;
let resolution = 20;
let framerate = 15;
let gameStarted = false;
let gameIsPaused = true;
let musicMuted = false;
let snakes = [];
let food = [];
let electricalObstacles = [];
let stopObstacles = [];
let slowObstacles = [];
let speedPotions = [];
let mysteryPotions = [];
let concretePotions = [];
let speedPotionsInterval;
let mysteryPotionsInterval;
let concretePotionsInterval;
let speedPotionsEvery = 5;
let mysteryPotionsEvery = 40;
let concretePotionsEvery = 20;

let score = 0;

let loseMusic;
let eatMusic;
let gameMusic;

// eslint-disable-next-line
function preload() {
	customWindowWidth = floor((windowWidth - 1) / resolution);
	customWindowHeight = floor((windowHeight - 1) / resolution);
	eatMusic = loadSound('./assets/sounds/eatSound1.wav');
	loseMusic = loadSound('./assets/sounds/loseSound1.wav');
	gameMusic = loadSound('./assets/sounds/gameSound3.wav');
}

// eslint-disable-next-line
function setup() {
	createCanvas(customWindowWidth * resolution, customWindowHeight * resolution);
	background(random(255), random(200), 50);
	$('#startGamePopUp').modal('show');
}
// eslint-disable-next-line
function draw() {
	frameRate(framerate);
	if (gameIsPaused) {
		return;
	}
	scale(resolution);
	$('#scoreDiv').text(`You lost. Your score was ${score}`);
	background(0);

	noStroke();
	noFill();


	for (let f of food) {
		f.show();
	}
	for (let eo of electricalObstacles) {
		eo.show();
	}
	for (let so of stopObstacles) {
		so.show();
	}
	for (let so of slowObstacles) {
		so.show();
	}
	for (let i = 0; i < speedPotions.length; i++) {
		let sp = speedPotions[i];
		sp.show();
		sp.update();
		if (sp.expired()) {
			speedPotions.splice(i, 1);
		}
	}
	for (let i = 0; i < mysteryPotions.length; i++) {
		let mp = mysteryPotions[i];
		mp.show();
		mp.update();
		if (mp.expired()) {
			mysteryPotions.splice(i, 1);
		}
	}

	for (let i = 0; i < concretePotions.length; i++) {
		let cp = concretePotions[i];
		cp.show();
		cp.update();
		if (cp.expired()) {
			concretePotions.splice(i, 1);
		}
	}



	for (let snake of snakes) {
		snake.show();
		for (let i = 0; i < snake.velocity; i++) {

			enableCollisionForStopObstacles();
			if (wallmode) {
				enableBorders();
				stroke(255, 50, 50);
				strokeWeight(0.4);
				noFill();
				rect(0, 0, customWindowWidth, customWindowHeight);
			}
			snake.updatePending = false;

			for (let so of slowObstacles) {
				if (snake.collideWith(so)) {
					modifySpeed('percent', -0.1);
					modifyScore('percent', -0.2);
				}
			}
			for (let f of food) {
				if (snake.eat(f)) {
					if (!musicMuted) {
						eatMusic.play();
					}
					modifySpeed('flat', 3);
					modifyScore('flat', 1);
					snake.grow();
					let fOptions = {
						1: 85,
						2: 10,
						3: 5
					};
					createFoodAtRandomLocation(fOptions);
				}
			}

			for (let f of speedPotions) {
				if (snake.drink(f, speedPotions)) {
					modifySpeed('percent', 2);
					modifyScore('percent', 1.5);
				}
			}

			for (let f of mysteryPotions) {
				if (snake.drink(f, mysteryPotions)) {
					if (f.ability === 'Poison') {
						gameOver(f);
					} else if (f.ability === 'ScoreX1.5') {
						modifyScore('percent', 1.5);
					}
				}

			}

			for (let f of concretePotions) {
				if (snake.drink(f, concretePotions)) {
					wallmode = true;
					clearInterval(concretePotionsInterval);
					setTimeout(() => {
						wallmode = false;
						concretePotionsInterval = setInterval(() => {
							spawnRandomConcretePotions(35);
						}, concretePotionsEvery * 1000);
					}, 20 * 1000);
				}
			}

			if (snake.die()) {
				gameOver(snake);
			}
			snake.update();
		}
	}
	displaySpeedAndScore();
}
// eslint-disable-next-line
function keyPressed() {
	switch (key) {
		case 'Enter':
			if (!gameStarted)
				$('#playButton').trigger('click');
			break;
		case 'Escape':
			if (gameStarted) {
				if (gameIsPaused) {
					$('#infoPopUp').modal('hide');
					$('*').css('cursor', 'none');
					speedPotionsInterval = setInterval(() => {
						spawnRandomSpeedPotions(30);
					}, speedPotionsEvery * 1000);

					mysteryPotionsInterval = setInterval(() => {
						spawnRandomMysteryPotions(80);
					}, mysteryPotionsEvery * 1000);

					concretePotionsInterval = setInterval(() => {
						spawnRandomMysteryPotions(35);
					}, concretePotionsInterval * 1000);

					if (!musicMuted) {
						gameMusic.loop();
					}

				} else {
					$('#infoPopUp').modal('show');
					$('*').css('cursor', 'auto');
					clearInterval(speedPotionsInterval);
					clearInterval(mysteryPotionsInterval);
					clearInterval(concretePotionsInterval);
					gameMusic.pause();
				}
				pauseOrContinueGame();
			}
			break;
		default:
			break;
	}
	for (let snake of snakes) {
		switch (key) {
			case 'q':
				snake.grow();
				modifyScore('flat', 1);
				break;
			default:
				break;
		}
		if (gameIsPaused) {
			return;
		}

		const arrows = [LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, 65, 68, 83, 87];
		if (!arrows.includes(keyCode)) {
			return;
		}
		let dir = createVector();
		if (snake.updatePending) {
			return;
		}
		snake.updatePending = true;
		let snakeLength = snake.body.length;
		switch (keyCode) {
			// A or <-
			case 65:
			case LEFT_ARROW:
				if (snake.movesRight() && snakeLength > 1) {
					return;
				}
				if (wallmode) {
					if (snake.touchLeftWall()) {
						return;
					}
				}

				if (snake.touchAnyStopObstacleInRight()) { //Gia na min stamataei to fidi ean pernaei katheta dexia apo to stop obstacle
					return;
				}

				if (snake.touchAnyStopObstacleInLeft() && !snake.isMoving() && snake.looksRight()) {
					return;
				}

				if (snake.touchRightWall()) {
					if (snake.isHorizontal()) {
						return;
					}

				}
				dir.x = -1;
				dir.y = 0;
				break;
				// D or ->
			case 68:
			case RIGHT_ARROW:
				if (snake.movesLeft() && snakeLength > 1) {
					return;
				}
				if (wallmode) {
					if (snake.touchRightWall()) {
						return;
					}
				}

				if (snake.touchAnyStopObstacleInLeft()) { //Gia na min stamataei to fidi ean pernaei katheta aristera apo to stop obstacle
					return;
				}
				if (snake.touchAnyStopObstacleInRight() && !snake.isMoving() && snake.looksLeft()) {
					return;
				}
				if (snake.touchLeftWall()) {
					if (snake.isHorizontal()) {
						return;
					}

				}
				dir.x = 1;
				dir.y = 0;
				break;
				// W or ^
			case 87:
			case UP_ARROW:
				if (snake.movesDown() && snakeLength > 1) {
					return;
				}
				if (wallmode) {
					if (snake.touchTopWall()) {
						return;
					}
				}

				if (snake.touchAnyStopObstacleInBottom()) { //Gia na min stamataei to fidi ean pernaei orizontia katw apo to stop obstacle
					return;
				}
				if (snake.touchAnyStopObstacleInTop() && !snake.isMoving() && snake.looksDown()) {
					return;
				}
				if (snake.touchBottomWall()) {
					if (snake.isVertical()) {
						return;
					}
				}

				dir.x = 0;
				dir.y = -1;
				break;
				//S or down arrow
			case 83:
			case DOWN_ARROW:
				if (snake.movesUp() && snakeLength > 1) {
					return;
				}
				if (wallmode) {
					if (snake.touchBottomWall()) {
						return;
					}
				}

				if (snake.touchAnyStopObstacleInTop()) { //Gia na min stamataei to fidi ean pernaei orizontia panw apo to stop obstacle
					return;
				}

				if (snake.touchAnyStopObstacleInBottom() && !snake.isMoving() && snake.looksUp()) {
					return;
				}
				if (snake.touchTopWall()) {
					if (snake.isVertical()) {
						return;
					}
				}

				dir.x = 0;
				dir.y = 1;
				break;
			default:
				break;
		}
		snake.setDirection(dir);
	}
}


function createFoodAtRandomLocation(options) {
	if (!chaosmode) {
		if (food.length > 0) {
			return;
		}
	}

	let x, y, f;
	let chance = random(100);
	let chosen;
	let sum = 0;
	for (let option in options) {
		sum += options[option];
		if (chance < sum) {
			chosen = option;
			break;
		}
	}
	for (let i = 0; i < chosen; i++) {
		do {
			x = floor(random(customWindowWidth));
			y = floor(random(customWindowHeight));
			f = new Food(x, y, 1, 1);
		} while (cantCreateSomethingHere(f));
		food.push(f);
	}
}

function createSpeedPotionsInRandomLocation(options) {
	if (speedPotions.length > 1 || framerate > 50) {
		return;
	}
	let x, y, speedPotion;
	let chance = random(100);
	let chosen;
	let sum = 0;
	for (let option in options) {
		sum += options[option];
		if (chance < sum) {
			chosen = option;
			break;
		}
	}
	for (let i = 0; i < chosen; i++) {
		do {
			x = floor(random(customWindowWidth));
			y = floor(random(customWindowHeight));
			speedPotion = new SpeedPotion(x, y);
		} while (cantCreateSomethingHere(speedPotion));
		speedPotions.push(speedPotion);
	}
}

function createMysteryPotionsInRandomLocation(options) {
	if (mysteryPotions.length > 5) {
		return;
	}
	let x, y, ability, mysteryPotion;
	let chance = random(100);
	let chosen;
	let sum = 0;
	for (let option in options) {
		sum += options[option];
		if (chance < sum) {
			chosen = option;
			break;
		}
	}
	for (let i = 0; i < chosen; i++) {
		do {
			x = floor(random(customWindowWidth));
			y = floor(random(customWindowHeight));
			let chance2 = random(100);
			if (chance2 < 50) {
				ability = 'Poison';
			} else {
				ability = 'ScoreX1.5';
			}
			mysteryPotion = new MysteryPotion(x, y, ability);
		} while (cantCreateSomethingHere(mysteryPotion));
		mysteryPotions.push(mysteryPotion);
	}
}

function createConcretePotionsInRandomLocation(options) {
	if (concretePotions.length > 0) {
		return;
	}
	let x, y, concretePotion;
	let chance = random(100);
	let chosen;
	let sum = 0;
	for (let option in options) {
		sum += options[option];
		if (chance < sum) {
			chosen = option;
			break;
		}
	}
	for (let i = 0; i < chosen; i++) {
		do {
			x = floor(random(customWindowWidth));
			y = floor(random(customWindowHeight));
			concretePotion = new ConcretePotion(x, y);
		} while (cantCreateSomethingHere(concretePotion));
		concretePotions.push(concretePotion);
	}
}

function createSnakeAtRandomLocation(options) {
	let x, y, snake;
	let chance = random(100);
	let chosen;
	let sum = 0;
	for (let option in options) {
		sum += options[option];
		if (chance < sum) {
			chosen = option;
			break;
		}
	}
	for (let i = 0; i < chosen; i++) {
		do {
			x = floor(random(customWindowWidth));
			y = floor(random(customWindowHeight));
			snake = new Snake(x, y, 1);
		} while (cantCreateSomethingHere(snake));
		snakes.push(snake);
	}
}

function createElectricalObstaclesInRandomLocation(options) {
	let x, y, eo;
	let chance = random(100);
	let chosen;
	let sum = 0;
	for (let option in options) {
		sum += options[option];
		if (chance < sum) {
			chosen = option;
			break;
		}
	}
	for (let i = 0; i < chosen; i++) {
		do {
			x = floor(random(customWindowWidth));
			y = floor(random(customWindowHeight));
			eo = new ElectricalObstacle(x, y);
		} while (cantCreateSomethingHere(eo));
		electricalObstacles.push(eo);
	}
}

function createStopObstaclesInRandomLocation(options) {
	let x, y, so;
	let chance = random(100);
	let chosen;
	let sum = 0;
	for (let option in options) {
		sum += options[option];
		if (chance < sum) {
			chosen = option;
			break;
		}
	}
	for (let i = 0; i < chosen; i++) {
		do {
			x = floor(random(customWindowWidth));
			y = floor(random(customWindowHeight));
			so = new StopObstacle(x, y);
		} while (cantCreateSomethingHere(so));
		stopObstacles.push(so);
	}
}

function createSlowObstaclesInRandomLocation(options) {
	let x, y, so;
	let chance = random(100);
	let chosen;
	let sum = 0;
	for (let option in options) {
		sum += options[option];
		if (chance < sum) {
			chosen = option;
			break;
		}
	}
	for (let i = 0; i < chosen; i++) {
		do {
			x = floor(random(customWindowWidth));
			y = floor(random(customWindowHeight));
			so = new SlowObstacle(x, y);
		} while (cantCreateSomethingHere(so));
		slowObstacles.push(so);
	}
}

function cantCreateSomethingHere(f) {
	for (let i = 0; i < food.length; i++) { //Ean se auto to simeio iparxei trofi
		for (let j = 0; j < food[i].body.length; j++) {
			for (let k = 0; k < f.body.length; k++) {
				if (food[i].body[j].x === f.body[k].x && food[i].body[j].y === f.body[k].y) {
					return true;
				}
			}
		}
	}
	for (let i = 0; i < electricalObstacles.length; i++) { //Ean se auto to simeio iparxei electrical obstacle
		for (let j = 0; j < electricalObstacles[i].body.length; j++) {
			for (let k = 0; k < f.body.length; k++) {
				if (electricalObstacles[i].body[j].x === f.body[k].x && electricalObstacles[i].body[j].y === f.body[k].y) {
					return true;
				}
			}
		}
	}

	for (let i = 0; i < stopObstacles.length; i++) { //Ean se auto to simeio iparxei stop obstacle
		for (let j = 0; j < stopObstacles[i].body.length; j++) {
			for (let k = 0; k < f.body.length; k++) {
				if (stopObstacles[i].body[j].x === f.body[k].x && stopObstacles[i].body[j].y === f.body[k].y) {
					return true;
				}
			}
		}
	}
	for (let i = 0; i < slowObstacles.length; i++) { //Ean se auto to simeio iparxei slow obstacle
		for (let j = 0; j < slowObstacles[i].body.length; j++) {
			for (let k = 0; k < f.body.length; k++) {
				if (slowObstacles[i].body[j].x === f.body[k].x && slowObstacles[i].body[j].y === f.body[k].y) {
					return true;
				}
			}
		}
	}

	for (let i = 0; i < snakes.length; i++) { //Ean se auto to simeio iparxei fidi.
		for (let j = 0; j < snakes[i].body.length; j++) {
			for (let k = 0; k < f.body.length; k++) {
				if (snakes[i].body[j].x === f.body[k].x && snakes[i].body[j].y === f.body[k].y) {
					return true;
				}
			}
		}
	}

	return false;
}

function startNewGame() {
	gameStarted = true;
	framerate = 15;
	snakes = [];
	electricalObstacles = [];
	stopObstacles = [];
	slowObstacles = [];
	food = [];
	speedPotions = [];
	mysteryPotions = [];
	wallmode = false;
	score = 0;

	if (!musicMuted) {
		gameMusic.loop();
	}
	let fOptions;
	fOptions = {
		1: 100
	};
	createSnakeAtRandomLocation(fOptions);

	fOptions = {
		1: 95,
		2: 5
	};
	createFoodAtRandomLocation(fOptions);
	fOptions = {
		1: 100
	};
	createElectricalObstaclesInRandomLocation(fOptions);
	fOptions = {
		1: 50,
		2: 30,
		3: 20
	};
	createStopObstaclesInRandomLocation(fOptions);
	fOptions = {
		1: 75,
		2: 20,
		3: 5
	};
	createSlowObstaclesInRandomLocation(fOptions);
	fOptions = {
		1: 80,
		2: 20
	};
	speedPotionsInterval = setInterval(() => {
		spawnRandomSpeedPotions(30);
	}, speedPotionsEvery * 1000);

	mysteryPotionsInterval = setInterval(() => {
		spawnRandomMysteryPotions(80);
	}, mysteryPotionsEvery * 1000);

	concretePotionsInterval = setInterval(() => {
		spawnRandomConcretePotions(35);
	}, concretePotionsEvery * 1000);
}

function pauseOrContinueGame() {
	gameIsPaused = !gameIsPaused;
}


function enableBorders() {
	for (let snake of snakes) {
		let head = snake.body[0];
		if (head.x < 1 && snake.xDirection == -1) {
			snake.xDirection = 0;
		} else if (head.x > customWindowWidth - 2 && snake.xDirection == 1) {
			snake.xDirection = 0;
		} else if (head.y < 1 && snake.yDirection == -1) {
			snake.yDirection = 0;
		} else if (head.y > customWindowHeight - 2 && snake.yDirection == 1) {
			snake.yDirection = 0;
		}
	}

}

function enableCollisionForStopObstacles() {
	for (let snake of snakes) {
		for (let so of stopObstacles) {
			for (let i = 0; i < so.body.length; i++) {
				let head = snake.body[0];
				if ((head.x === so.body[i].x + 1 && head.y === so.body[i].y) && snake.xDirection == -1) {
					snake.xDirection = 0;
				} else if ((head.x === so.body[i].x - 1 && head.y === so.body[i].y) && snake.xDirection == 1) {
					snake.xDirection = 0;
				} else if ((head.y === so.body[i].y + 1 && head.x === so.body[i].x) && snake.yDirection == -1) {
					snake.yDirection = 0;
				} else if ((head.y === so.body[i].y - 1 && head.x === so.body[i].x) && snake.yDirection == 1) {
					snake.yDirection = 0;
				}
			}

		}

	}

}

function spawnRandomSpeedPotions(chance) {
	let x = random(100);
	if (x < chance) {
		let fOptions = {
			1: 95,
			2: 5
		};
		createSpeedPotionsInRandomLocation(fOptions);
	}
}

function spawnRandomMysteryPotions(chance) {
	let x = random(100);
	if (x < chance) {
		let fOptions = {
			1: 100
		};
		createMysteryPotionsInRandomLocation(fOptions);
	}
}

function spawnRandomConcretePotions(chance) {
	let x = random(100);
	if (x < chance) {
		let fOptions = {
			1: 100
		};
		createConcretePotionsInRandomLocation(fOptions);
	}
}

function killSnake(snake) {
	for (let i = 0; i < snakes.length; i++) {
		if (snakes[i] === snake) {
			snakes.splice(i, 1);
		}
	}
	gameMusic.stop();
	if (!musicMuted) {
		loseMusic.play();
	}
}

function gameOver(snake) {
	killSnake(snake);
	gameIsPaused = true;
	gameStarted = false;
	clearInterval(speedPotionsInterval);
	clearInterval(mysteryPotionsInterval);
	clearInterval(concretePotionsInterval);
	$('#endGamePopUp').modal('show');
	$('*').css('cursor', 'auto');
}

function displaySpeedAndScore() {
	let snake = snakes[0];
	if (!snake) {
		return;
	}
	noStroke();
	fill(255);

	textAlign(CORNER);
	textSize(1);
	text(`Speed: ${snake.velocity}`, 0.5, 1.2);

	textAlign(CORNER);
	textSize(1);
	text(`Score:  ${score}`, 0.5, 2.2);
}

function modifySpeed(type, value) {
	let snake = snakes[0];
	let minSpeed = 1;
	let maxSpeed = 60;
	if (type === 'flat') {
		snake.secretVelocity += value;
	} else if (type === 'percent') {
		snake.secretVelocity *= value;
	}

	if (snake.secretVelocity < minSpeed) {
		snake.secretVelocity = minSpeed;
	}

	if (snake.secretVelocity > maxSpeed) {
		snake.secretVelocity = maxSpeed;
	}

	modifyRealSpeed(snake.secretVelocity);
}

function modifyRealSpeed(speed) {
	let snake = snakes[0];
	if (speed < 20) {
		snake.velocity = 1;
	} else if (speed < 40) {
		snake.velocity = 2;
	} else if (speed <= 60) {
		snake.velocity = 3;
	}
}

function modifyScore(type, value) {
	if (type === 'flat') {
		score += value;
	} else if (type === 'percent') {
		score = floor(score * value);
	}
	if (score < 0) {
		score = 0;
	}
}

$(function () {
	
	const wallButton = $('#wall');
	$('#startGamePopUp').modal({
		'keyboard': false,
		'backdrop': 'static'
	}).modal('hide');
	$('*').css('cursor', 'auto');
	$('#endGamePopUp').modal({
		'keyboard': false,
		'backdrop': 'static'
	}).modal('hide');

	$('#infoPopUp').modal({
		'keyboard': false,
		'backdrop': 'static'
	}).modal('hide');

	
	wallButton.css('display', 'none');
	wallButton.css('background-color', 'red');





	// Events
	$(document).on('click', '#playButton', function () {
		if (!gameStarted) {
			$('#startGamePopUp').modal('hide');
			$('#endGamePopUp').modal('hide');
			$('*').css('cursor', 'none');
			startNewGame();
			gameIsPaused = false;
		}
	});

	$(document).on('click', '#restartButton', function () {
		$('#playButton').trigger('click');
	});

	

	$(document).on('click', '#wall', function () {
		if (wallButton.css('background-color') === 'rgb(255, 0, 0)') {
			wallButton.css('background-color', 'green');
			wallmode = false;
		} else if (wallButton.css('background-color') === 'rgb(0, 128, 0)') {
			wallButton.css('background-color', 'red');
			wallmode = true;
		}
	});

});
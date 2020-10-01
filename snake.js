'use strict';
/* global food,customWindowHeight,customWindowWidth,stopObstacles,electricalObstacles,wallmode*/
// eslint-disable-next-line
class Snake {
	constructor(x, y, size) {
		this.size = size;
		this.xDirection = 0;
		this.yDirection = 0;
		this.velocity = 1;
		this.secretVelocity = 1;
		this.updatePending = false;
		this.body = [];
		this.body.push(createVector(x, y));
	}

	update() {
		let snakeLength = this.body.length;
		let head = this.body[0];
		let bodyC = []; //antigrafo tou fidiou
		for (let i = 0; i < snakeLength; i++) {
			bodyC.push(this.body[i].copy());
		}
		if (this.xDirection === 0 && this.yDirection === 0) {
			return;
		}
		head.x += this.xDirection;
		head.y += this.yDirection;
		for (let i = 1; i < snakeLength; i++) {
			let part = this.body[i];
			let pr = bodyC[i - 1];
			part.x = pr.x;
			part.y = pr.y;
		}
	}

	setDirection(dir) {
		this.xDirection = dir.x;
		this.yDirection = dir.y;
	}

	show() {
		let snakeLength = this.body.length;
		for (let i = snakeLength - 1; i >= 0; i--) {
			let part = this.body[i];
			if (i === 0) {
				fill(0, 0, 200);
				strokeWeight(0.18);
				stroke(210, 0, 0);
			} else {
				fill(20, 20, 82);
				strokeWeight(0.1);
				stroke(random(210), 0, 0);
			}
			rect(part.x, part.y, this.size, this.size);
		}
	}

	eat(f) {
		for (let i = 0; i < food.length; i++) {
			let flag = true;
			if (food[i].body.length > this.body.length) {
				continue;
			}
			for (let j = 0; j < food[i].body.length; j++) {
				if (food[i].body[j] && this.body[j]) {
					//Ean to kathe stoixeio tou fidiou apo tin arxi toy isoutai me kathe stoixeio tou fagitou apo to telos toy.
					if (food[i].body[food[i].body.length - j - 1].x !== this.body[j].x || food[i].body[food[i].body.length - j - 1].y !== this.body[j].y) {
						flag = false;
						break;
					}
				}
			}
			if (flag) {
				food.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	drink(f, potions) {
		for (let i = 0; i < potions.length; i++) {
			let flag = true;
			if (potions[i].body.length > this.body.length) {
				continue;
			}
			for (let j = 0; j < potions[i].body.length; j++) {
				if (potions[i].body[j] && this.body[j]) {
					if (potions[i].body[potions[i].body.length - j - 1].x !== this.body[j].x || potions[i].body[potions[i].body.length - j - 1].y !== this.body[j].y) {
						flag = false;
						break;
					}
				}
			}
			if (flag) {
				potions.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	grow() {
		let pr = this.body[this.body.length - 1].copy(); //antigrafo apo to teleutaio kommati tou fidiou.
		let snakeLength = this.body.length;
		if (snakeLength > 1) {
			if (this.looksUp()) {
				pr.y += 1;
			} else if (this.looksDown()) {
				pr.y -= 1;
			} else if (this.looksRight()) {
				pr.x -= 1;
			} else if (this.looksLeft()) {
				pr.x += 1;
			} else {
				console.log('Snake won\'t look anywhere.WOW');
			}

		} else { //Ean to fidi exei mono ena kommati
			if (this.isMoving()) {
				pr.x -= this.xDirection;
				pr.y -= this.yDirection;
			} else {
				if (this.touchAnyWall()) {
					if (this.touch00Corner()) {
						let r = random(1);
						if (r > 0.5) {
							pr.x = 1;
						} else {
							pr.y = 1;
						}
					} else if (this.touch0YMaxCorner()) {
						let r = random(1);
						console.log(r);
						if (r > 0.5) {
							pr.x = 1;
						} else {
							pr.y = customWindowHeight - 2;
						}
					} else if (this.touchXMax0Corner()) {
						let r = random(1);
						if (r > 0.5) {
							pr.x = customWindowWidth - 2;
						} else {
							pr.y = 1;
						}
					} else if (this.touchXMaxYMaxCorner()) {
						let r = random(1);
						if (r > 0.5) {
							pr.x = customWindowWidth - 2;
						} else {
							pr.y = customWindowHeight - 2;
						}
					} else { //Akoumpaei toixo alla kamia apo tis gonies.
						if (this.touchTopWall()) {
							let r = random(1);
							if (r < 0.33) {
								pr.x += 1;
							} else if (r < 0.66) {
								pr.x -= 1;
							} else {
								pr.y += 1;
							}
						} else if (this.touchBottomWall()) {
							let r = random(1);
							if (r < 0.33) {
								pr.x += 1;
							} else if (r < 0.66) {
								pr.x -= 1;
							} else {
								pr.y -= 1;
							}
						} else if (this.touchRightWall()) {
							let r = random(1);
							if (r < 0.33) {
								pr.x -= 1;
							} else if (r < 0.66) {
								pr.y -= 1;
							} else {
								pr.y += 1;
							}
						} else if (this.touchLeftWall()) {
							let r = random(1);
							if (r < 0.33) {
								pr.x += 1;
							} else if (r < 0.66) {
								pr.y -= 1;
							} else {
								pr.y += 1;
							}
						}
					}
				} else {
					if (this.touchAnyStopObstacle()) {
						if (this.touchAnyStopObstacleInBottom()) {
							let so = this.touchAnyStopObstacleInBottom();
							pr.y = so.y + 2;
						} else if (this.touchAnyStopObstacleInTop()) {
							let so = this.touchAnyStopObstacleInTop();
							pr.y = so.y - 2;

						} else if (this.touchAnyStopObstacleInLeft()) {
							let so = this.touchAnyStopObstacleInLeft();
							pr.x = so.x - 2;
						} else if (this.touchAnyStopObstacleInRight()) {
							let so = this.touchAnyStopObstacleInRight();
							pr.x = so.x + 2;
						}
					} else { //Ean den kounietai kai den akoumpaei se toixo i stop obstacle(sinithos arxi paixnidiou me Q)
						let r = random(1);
						let head = this.body[0];
						console.log(r);
						if (r < 0.25) {
							if (head.x + 1 < customWindowWidth - 2) {
								pr.x = head.x + 1;
							} else {
								pr.x = head.x - 1;
							}
						} else if (r < 0.5) {
							if (head.x - 1 > 0) {
								pr.x = head.x - 1;
							} else {
								pr.x = head.x + 1;
							}
						} else if (r < 0.75) {
							if (head.y + 1 < customWindowHeight - 2) {
								pr.y = head.y + 1;
							} else {
								pr.y = head.y - 1;
							}
						} else {
							if (head.y - 1 > 0) {
								pr.y = head.y - 1;
							} else {
								pr.y = head.y + 1;
							}
						}
					}

				}

			}

		}

		this.body.push(pr);
	}

	die() {
		let head = this.body[0];
		let snakeLength = this.body.length;
		for (let i = 1; i < snakeLength; i++) {
			let part = this.body[i];
			if (head.x === part.x && head.y === part.y) {
				return true;
			}
		}
		for (let eo of electricalObstacles) {
			if (this.collideWith(eo)) {
				return true;
			}
		}
		if (wallmode) {
			return false;
		}
		if (head.x < 0 || head.x > customWindowWidth - 1 || head.y < 0 || head.y > customWindowHeight - 1) {
			return true;
		}
		return false;

	}

	collideWith(obstacle) {
		let head = this.body[0];
		for (let i = 0; i < obstacle.body.length; i++) {
			let o = obstacle.body[i];
			if (head.x === o.x && head.y === o.y) {
				return true;
			}
		}
		return false;
	}

	touchAnyWall() {
		let head = this.body[0];
		return (head.x === 0 || head.x === customWindowWidth - 1 || head.y === 0 || head.y === customWindowHeight - 1);
	}

	touchRightWall() {
		let head = this.body[0];
		return (head.x === customWindowWidth - 1);
	}

	touchLeftWall() {
		let head = this.body[0];
		return (head.x === 0);
	}

	touchTopWall() {
		let head = this.body[0];
		return (head.y === 0);
	}

	touchBottomWall() {
		let head = this.body[0];
		return (head.y === customWindowHeight - 1);
	}

	touch00Corner() { //Panw aristera gonia
		return (this.touchLeftWall() && this.touchTopWall());
	}

	touch0YMaxCorner() { //Panw dexia gonia
		return (this.touchLeftWall() && this.touchBottomWall());
	}

	touchXMax0Corner() { //Katw aristera gonia
		return (this.touchRightWall() && this.touchTopWall());
	}

	touchXMaxYMaxCorner() { //Katw dexia gonia
		return (this.touchRightWall() && this.touchBottomWall());
	}


	touchAnyStopObstacle() {
		let head = this.body[0];
		let whichStopObstacle = {};
		for (let so of stopObstacles) {
			let flag = false;
			for (let i = 0; i < so.body.length; i++) {
				if (head.y - 1 === so.body[i].y && head.x === so.body[i].x) {
					flag = true;
					whichStopObstacle.so = so;
					whichStopObstacle.x = so.body[i].x;
					whichStopObstacle.y = so.body[i].y;
					break;
				} else if (head.y + 1 === so.body[i].y && head.x === so.body[i].x) {
					flag = true;
					whichStopObstacle.so = so;
					whichStopObstacle.x = so.body[i].x;
					whichStopObstacle.y = so.body[i].y;
					break;
				} else if (head.x + 1 === so.body[i].x && head.y === so.body[i].y) {
					flag = true;
					whichStopObstacle.so = so;
					whichStopObstacle.x = so.body[i].x;
					whichStopObstacle.y = so.body[i].y;
					break;
				} else if (head.x - 1 === so.body[i].x && head.y === so.body[i].y) {
					flag = true;
					whichStopObstacle.so = so;
					whichStopObstacle.x = so.body[i].x;
					whichStopObstacle.y = so.body[i].y;
					break;
				}
			}
			if (flag) {
				return whichStopObstacle;
			}
		}
		return false;
	}

	touchAnyStopObstacleInBottom() {
		let head = this.body[0];
		let whichStopObstacle = {};
		for (let so of stopObstacles) {
			let flag = false;
			for (let i = 0; i < so.body.length; i++) {
				if (head.y - 1 === so.body[i].y && head.x === so.body[i].x) {
					flag = true;
					whichStopObstacle.so = so;
					whichStopObstacle.x = so.body[i].x;
					whichStopObstacle.y = so.body[i].y;
					break;
				}
			}
			if (flag) {
				return whichStopObstacle;
			}
		}
		return false;
	}

	touchAnyStopObstacleInTop() {
		let head = this.body[0];
		let whichStopObstacle = {};
		for (let so of stopObstacles) {
			let flag = false;
			for (let i = 0; i < so.body.length; i++) {
				if (head.y + 1 === so.body[i].y && head.x === so.body[i].x) {
					flag = true;
					whichStopObstacle.so = so;
					whichStopObstacle.x = so.body[i].x;
					whichStopObstacle.y = so.body[i].y;
					break;
				}
			}
			if (flag) {
				return whichStopObstacle;
			}
		}
		return false;
	}

	touchAnyStopObstacleInLeft() {
		let head = this.body[0];
		let whichStopObstacle = {};
		for (let so of stopObstacles) {
			let flag = false;
			for (let i = 0; i < so.body.length; i++) {
				if (head.x + 1 === so.body[i].x && head.y === so.body[i].y) {
					flag = true;
					whichStopObstacle.so = so;
					whichStopObstacle.x = so.body[i].x;
					whichStopObstacle.y = so.body[i].y;
					break;
				}
			}
			if (flag) {
				return whichStopObstacle;
			}
		}
		return false;
	}

	touchAnyStopObstacleInRight() {
		let head = this.body[0];
		let whichStopObstacle = {};
		for (let so of stopObstacles) {
			let flag = false;
			for (let i = 0; i < so.body.length; i++) {
				if (head.x - 1 === so.body[i].x && head.y === so.body[i].y) {
					flag = true;
					whichStopObstacle.so = so;
					whichStopObstacle.x = so.body[i].x;
					whichStopObstacle.y = so.body[i].y;
					break;
				}
			}
			if (flag) {
				return whichStopObstacle;
			}
		}
		return false;
	}

	looksUp() {
		if (this.body.length > 1) {
			let head = this.body[0];
			let second = this.body[1];
			if (this.isVertical()) {
				if (head.y + 1 === second.y) {
					return true;
				}
			}
		}
		return false;
	}

	looksDown() {
		if (this.body.length > 1) {
			let head = this.body[0];
			let second = this.body[1];
			if (this.isVertical()) {
				if (head.y - 1 === second.y) {
					return true;
				}
			}
		}
		return false;
	}

	looksRight() {
		if (this.body.length > 1) {
			let head = this.body[0];
			let second = this.body[1];
			if (this.isHorizontal()) {
				if (head.x - 1 === second.x) {
					return true;
				}
			}
		}
		return false;
	}

	looksLeft() {
		if (this.body.length > 1) {
			let head = this.body[0];
			let second = this.body[1];
			if (this.isHorizontal()) {
				if (head.x + 1 === second.x) {
					return true;
				}
			}
		}
		return false;
	}

	movesUp() {
		return (this.yDirection === -1);
	}

	movesDown() {
		return (this.yDirection === 1);
	}

	movesRight() {
		return (this.xDirection === 1);
	}

	movesLeft() {
		return (this.xDirection === -1);
	}

	isMoving() {
		return (this.xDirection !== 0 || this.yDirection !== 0);
	}



	isHorizontal() {
		if (this.body.length > 1) {
			let head = this.body[0];
			let second = this.body[1];
			if (head.x - 1 === second.x || head.x + 1 === second.x) {
				return true;
			}

		}
		return false;
	}

	isVertical() {
		if (this.body.length > 1) {
			let head = this.body[0];
			let second = this.body[1];
			if (head.y - 1 === second.y || head.y + 1 === second.y) {
				return true;
			}

		}
		return false;
	}
}
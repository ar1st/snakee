'use strict';
/* global Obstacle */
//eslint-disable-next-line
class SlowObstacle extends Obstacle {

	constructor(x, y) {
		super(x, y, 1, 8);
	}

	show() {
		fill(0, 26, 0);
		strokeWeight(0.1);
		stroke(random(210), 0, 0);
		super.show();
	}
}
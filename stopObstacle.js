'use strict';
/* global Obstacle */
//eslint-disable-next-line
class StopObstacle extends Obstacle {

	constructor(x, y) {
		super(x, y, 7, 1);
	}

	show() {
		fill(255,0,0);
		strokeWeight(0.1);
		stroke(random(210), 0, 0);
		super.show();
	}
}
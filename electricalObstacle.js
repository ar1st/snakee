'use strict';
/* global Obstacle */
//eslint-disable-next-line
class ElectricalObstacle extends Obstacle {

	constructor(x, y) {
		super(x, y, 1, 6);
	}

	show() {
		fill(255, 255, 0);
		strokeWeight(0.1);
		stroke(random(210), 0, 0);
		super.show();
	}
}
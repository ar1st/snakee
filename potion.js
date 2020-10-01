'use strict';
/* global customWindowWidth,customWindowHeight */

//eslint-disable-next-line
class Potion {
	constructor(x, y, w = 1, h = 1) {
		this.body = [];
		this.w = w;
		this.h = h;
		this.lifespan = 30;
		this.ability = 'neutral';
		if (x + w > customWindowWidth) {
			x -= w;
		}
		if (y + h > customWindowHeight) {
			y -= h;
		}
		for (let i = 0; i < this.w; i++) {
			for (let j = 0; j < this.h; j++) {
				this.body.push(createVector(x + i, y + j));
			}
		}
	}

	show() {
		noStroke();
		fill(10, 10, 120);
		for (let i = 0; i < this.w * this.h; i++) {
			let part = this.body[i];
			rect(part.x, part.y, 1, 1);
		}
	}
	update() {
		if (this.lifespan === 0){
			return;
		}
		this.lifespan--;
	}

	expired(){
		return (this.lifespan === 0);
	}
}
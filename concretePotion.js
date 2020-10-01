'use strict';
/* global Potion*/
//eslint-disable-next-line
class ConcretePotion extends Potion {
	constructor(x, y, w = 1, h = 1) {
		super(x, y, w, h);
		this.ability = 'wall';
		this.lifespan = 120;
	}

	show() {
		noStroke();
		fill(255, 153, 153);
		let first = this.body[0];
		text(this.lifespan, first.x, first.y);
		
		fill(128, 0, 96);
		for (let i = 0; i < this.w * this.h; i++) {
			let part = this.body[i];
			rect(part.x, part.y, 1, 1);
		}
	}
}
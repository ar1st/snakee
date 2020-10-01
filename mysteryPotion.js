'use strict';
/* global Potion*/
//eslint-disable-next-line
class MysteryPotion extends Potion {
	constructor(x, y, ability, w = 1, h = 1) {
		super(x, y, w, h);
		this.ability = ability;
		this.lifespan = 300;
	}

	show() {
		noStroke();
		fill(255, 153, 153);
		let first = this.body[0];
		text(this.lifespan, first.x, first.y);

		fill(255, 165, 0);
		for (let i = 0; i < this.w * this.h; i++) {
			let part = this.body[i];
			rect(part.x, part.y, 1, 1);
		}
	}
}
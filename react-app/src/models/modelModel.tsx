export class ModelModel {
	id: number;
	name: string;
	dff: string;
	txd: string;
	ide: string;
	categoryId: number;
	tagIds: number[];
	drawDist: number;
	hasCollision: boolean;
	isBreakable: boolean;
	hasAnimation: boolean;
	timeOn?: number;
	timeOff?: number;

	constructor(
		id: number,
		name: string,
		dff: string,
		txd: string,
		ide: string,
		categoryId: number,
		tagIds: number[],
		drawDist: number,
		hasCollision: boolean = false,
		isBreakable: boolean = false,
		hasAnimation: boolean = false,
		timeOn?: number,
		timeOff?: number
	) {
		this.id = id;
		this.name = name;
		this.dff = dff;
		this.txd = txd;
		this.ide = ide;
		this.categoryId = categoryId;
		this.tagIds = tagIds;
		this.drawDist = drawDist;
		this.hasCollision = hasCollision;
		this.isBreakable = isBreakable;
		this.hasAnimation = hasAnimation;
		this.timeOn = timeOn;
		this.timeOff = timeOff;
	}
}
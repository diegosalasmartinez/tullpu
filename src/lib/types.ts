export enum ActionType {
	IDLE = 'IDLE',
	DRAW = 'DRAW',
	EDIT = 'EDIT'
}

export enum ToolType {
	SELECTION = 'SELECTION',
	LINE = 'LINE',
	RECTANGLE = 'RECTANGLE'
}

export type CanvasInstance = {
	html: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
};

export type Coords = {
	x: number;
	y: number;
};

export type Line = {
	id: string;
	type: ToolType.LINE;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
};

export type Rectangle = {
	id: string;
	type: ToolType.RECTANGLE;
	x: number;
	y: number;
	width: number;
	height: number;
};

export type Shape = Line | Rectangle;

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

export type Node = {
	id: string;
} & Coords;

export type Line = {
	id: string;
	type: ToolType.LINE;
	coordsStart: Coords;
	coordsEnd: Coords;
	nodes: Node[];
};

export type Rectangle = {
	id: string;
	type: ToolType.RECTANGLE;
	coords: Coords;
	width: number;
	height: number;
	nodes: Node[];
};

export type Shape = Line | Rectangle;

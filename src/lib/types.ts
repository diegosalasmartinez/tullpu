export enum ToolType {
	Selection = 'selection',
	Line = 'line',
	Rectangle = 'rectangle'
}

export type Line = {
	id: string;
	type: ToolType.Line;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
};

export type Rectangle = {
	id: string;
	type: ToolType.Rectangle;
	x: number;
	y: number;
	width: number;
	height: number;
};

export type Shape = Line | Rectangle;

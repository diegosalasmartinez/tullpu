export type ToolBarOptions = 'selection' | 'line' | 'rectangle';

export enum ShapeType {
	Line = 'line',
	Rectangle = 'rectangle'
}

export type Line = {
	id: string;
	type: ShapeType.Line;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
};

export type Rectangle = {
	id: string;
	type: ShapeType.Rectangle;
	x: number;
	y: number;
	width: number;
	height: number;
};

export type Shape = Line | Rectangle;

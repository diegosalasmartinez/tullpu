export enum ActionType {
	IDLE = 'IDLE',
	DRAW = 'DRAW',
	EDIT = 'EDIT'
}

export enum ToolType {
	SELECTION = 'SELECTION',
	LINE = 'LINE',
	RECTANGLE = 'RECTANGLE',
	CIRCLE = 'CIRCLE'
}

export type CanvasInstance = {
	html: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
};

export type Coords = {
	x: number;
	y: number;
};

export type ShapeStyle = {
	stroke: string;
	strokeWidth: number;
	fill: string | null;
};

export const DEFAULT_STYLE: ShapeStyle = {
	stroke: '#000000',
	strokeWidth: 1,
	fill: null
};

type ShapeBase = {
	id: string;
	style: ShapeStyle;
};

export type Line = ShapeBase & {
	type: ToolType.LINE;
	start: Coords;
	end: Coords;
};

export type Rectangle = ShapeBase & {
	type: ToolType.RECTANGLE;
	x: number;
	y: number;
	width: number;
	height: number;
};

export type Circle = ShapeBase & {
	type: ToolType.CIRCLE;
	cx: number;
	cy: number;
	rx: number;
	ry: number;
};

export type Shape = Line | Rectangle | Circle;

export type Page = {
	id: string;
	name: string;
	shapes: Shape[];
};

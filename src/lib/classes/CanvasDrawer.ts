import { type CanvasInstance, type Shape, type Coords, ToolType } from '$lib/types';
import {
	CANVAS_BACKGROUND_COLOR,
	SELECTION_COLOR,
	SELECTION_HANDLE_RADIUS,
	SELECTION_HANDLE_STROKE_WIDTH
} from '$lib/constants';
import CanvasStore from './CanvasStore';
import ShapeEntity, { type SelectedNode } from './ShapeEntity';

export default class CanvasDrawer {
	private canvasStatic: CanvasInstance;
	private canvasInteractive: CanvasInstance;
	private canvasStore: CanvasStore;
	private shapeEntity: ShapeEntity;

	private shapeEditing: Shape | null = null;
	private nodeSelected: SelectedNode | null = null;
	private hoverNode: SelectedNode | null = null;

	constructor(
		canvasStatic: CanvasInstance,
		canvasInteractive: CanvasInstance,
		canvasStore: CanvasStore
	) {
		this.canvasStatic = canvasStatic;
		this.canvasInteractive = canvasInteractive;
		this.canvasStore = canvasStore;

		this.shapeEntity = new ShapeEntity(this.canvasStatic, this.canvasInteractive);
	}

	drawCanvasStatic() {
		// Clear static canvas
		this.clearCanvas(this.canvasStatic);

		this.drawCanvasCallback(this.canvasStatic, () => {
			// Draw background
			this.canvasStatic.context.fillStyle = CANVAS_BACKGROUND_COLOR;
			this.canvasStatic.context.fillRect(-10000, -10000, 20000, 20000);

			// Draw shapes
			for (const shape of this.canvasStore.getShapes()) {
				this.shapeEntity.drawShape(shape);
			}
		});
	}

	drawCanvasInteractive() {
		// Clear interactive canvas
		this.clearCanvas(this.canvasInteractive);

		this.drawCanvasCallback(this.canvasInteractive, () => {
			// Draw current shape
			const currentShape = this.canvasStore.getCurrentShape();
			if (currentShape) {
				this.shapeEntity.selectShape(currentShape);
				if (this.hoverNode) {
					this.drawHoverHandle(this.hoverNode);
				}
			}
		});
	}

	updateCursor(event: MouseEvent) {
		const currentShape = this.canvasStore.getCurrentShape();

		if (!currentShape) {
			if (this.hoverNode) {
				this.hoverNode = null;
				this.canvasInteractive.html.style.cursor = 'default';
			}
			return;
		}

		const { x, y } = this.getMousePosition(event);
		const node = this.shapeEntity.getNodeSelected(currentShape, x, y);
		const changed = node?.id !== this.hoverNode?.id;

		if (!changed) return;

		this.hoverNode = node;
		this.canvasInteractive.html.style.cursor = node ? 'pointer' : 'default';
		this.drawCanvasInteractive();
	}

	drawing(event: MouseEvent) {
		// Clear interactive canvas
		this.clearCanvas(this.canvasInteractive);

		this.drawCanvasCallback(this.canvasInteractive, () => {
			// Draw shape to interactive canvas
			const coordsMouse = this.getMousePosition(event);
			const coordsStart = this.canvasStore.getStartPosition();

			this.shapeEntity.drawCoords(coordsStart, coordsMouse);
		});
	}

	stopDrawing(event: MouseEvent) {
		const coordsMouse = this.getMousePosition(event);

		// Validate it's not the same point
		const coordsStart = this.canvasStore.getStartPosition();
		if (coordsStart.x === coordsMouse.x && coordsStart.y === coordsMouse.y) return;

		const shape = this.shapeEntity.createShape(coordsStart, coordsMouse);
		if (!shape) return;

		// Add shape to store and persist
		this.canvasStore.addShape(shape);

		// Switch to selection tool and auto-select the new shape
		this.canvasStore.setCurrentTool(ToolType.SELECTION);
		this.canvasStore.setCurrentShape(shape);

		// Redraw static canvas and show selection handles on interactive canvas
		this.drawCanvasStatic();
		this.drawCanvasInteractive();
	}

	startEditing(event: MouseEvent, shape: Shape) {
		const { x, y } = this.getMousePosition(event);

		this.shapeEditing = shape;
		this.nodeSelected = this.shapeEntity.getNodeSelected(shape, x, y);
	}

	editing(event: MouseEvent) {
		if (!this.shapeEditing || !this.nodeSelected) return;

		const { x, y } = this.getMousePosition(event);

		this.shapeEntity.updateShapeFromNode(this.shapeEditing, this.nodeSelected.id, x, y);

		this.drawCanvasStatic();
		this.drawCanvasInteractive();
	}

	stopEditing() {
		if (this.shapeEditing) {
			this.canvasStore.updateShape(this.shapeEditing);
		}
		this.shapeEditing = null;
		this.nodeSelected = null;
	}

	cancelEditing() {
		this.shapeEditing = null;
		this.nodeSelected = null;
		this.hoverNode = null;
	}

	deleteSelectedShape() {
		const shape = this.canvasStore.getCurrentShape();
		if (!shape) return;
		this.canvasStore.removeShape(shape.id);
		this.canvasStore.setCurrentShape(null);
		this.hoverNode = null;
		this.canvasInteractive.html.style.cursor = 'default';
		this.drawCanvasStatic();
		this.clearCanvas(this.canvasInteractive);
	}

	click(event: MouseEvent) {
		// Clear interactive canvas
		this.clearCanvas(this.canvasInteractive);

		this.drawCanvasCallback(this.canvasInteractive, () => {
			// Print selected shape
			const shapeSelected = this.hasSelectedShape(event);
			if (shapeSelected) {
				this.canvasStore.setCurrentShape(shapeSelected);
				this.shapeEntity.selectShape(shapeSelected);
			} else {
				this.canvasStore.setCurrentShape(null);
			}
		});
	}

	hasSelectedShape(event: MouseEvent) {
		const { x, y } = this.getMousePosition(event);

		for (const shape of this.canvasStore.getShapes()) {
			const isSelected = this.shapeEntity.isShapeSelected(shape, x, y);
			if (isSelected) {
				return shape;
			}
		}

		return null;
	}

	clearCanvas(canvas: CanvasInstance) {
		const { width, height } = canvas.html;
		canvas.context.clearRect(0, 0, width, height);
	}

	getMousePosition(event: MouseEvent): Coords {
		const canvasRect = this.canvasStatic.html.getBoundingClientRect();

		const { x: offsetX, y: offsetY } = this.canvasStore.getOffset();
		const currentX = event.clientX - canvasRect.left - offsetX;
		const currentY = event.clientY - canvasRect.top - offsetY;

		return { x: currentX, y: currentY };
	}

	private drawHoverHandle(node: SelectedNode) {
		const ctx = this.canvasInteractive.context;
		ctx.beginPath();
		ctx.arc(node.x, node.y, SELECTION_HANDLE_RADIUS, 0, Math.PI * 2);
		ctx.fillStyle = SELECTION_COLOR;
		ctx.fill();
		ctx.strokeStyle = SELECTION_COLOR;
		ctx.lineWidth = SELECTION_HANDLE_STROKE_WIDTH;
		ctx.stroke();
		ctx.closePath();
	}

	private drawCanvasCallback(canvas: CanvasInstance, callback: () => void) {
		// Apply translation
		canvas.context.save();
		const { x: offsetX, y: offsetY } = this.canvasStore.getOffset();
		canvas.context.translate(offsetX, offsetY);

		// Custom callback
		callback();

		// Restore translation
		canvas.context.restore();
	}
}

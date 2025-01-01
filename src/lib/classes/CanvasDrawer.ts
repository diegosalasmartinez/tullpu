import { type CanvasInstance } from '$lib/types';
import CanvasStore from './CanvasStore';
import ShapeEntity from './ShapeEntity';

export default class CanvasDrawer {
	private canvasStatic: CanvasInstance;
	private canvasInteractive: CanvasInstance;
	private canvasStore: CanvasStore;
	private shapeEntity: ShapeEntity;

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

		// Apply translation
		this.canvasStatic.context.save();
		const { x: offsetX, y: offsetY } = this.canvasStore.getOffset();
		this.canvasStatic.context.translate(offsetX, offsetY);

		// Draw background
		this.canvasStatic.context.fillStyle = '#f0f0f0';
		this.canvasStatic.context.fillRect(-10000, -10000, 20000, 20000);

		// Draw shapes
		for (const shape of this.canvasStore.getShapes()) {
			this.shapeEntity.drawShape(shape);
		}

		// Restore translation
		this.canvasStatic.context.restore();
	}

	drawCanvasInteractive() {
		// Clear interactive canvas
		this.clearCanvas(this.canvasInteractive);

		// Apply translation
		this.canvasInteractive.context.save();
		const { x: offsetX, y: offsetY } = this.canvasStore.getOffset();
		this.canvasInteractive.context.translate(offsetX, offsetY);

		// Draw current shape
		const currentShape = this.canvasStore.getCurrentShape();
		if (currentShape) {
			this.shapeEntity.selectShape(currentShape);
		}

		// Restore translation
		this.canvasInteractive.context.restore();
	}

	drawing(event: MouseEvent) {
		const { x, y } = this.getMousePosition(event);

		// Clear interactive canvas
		this.clearCanvas(this.canvasInteractive);

		// Apply translation
		this.canvasInteractive.context.save();
		const { x: offsetX, y: offsetY } = this.canvasStore.getOffset();
		this.canvasInteractive.context.translate(offsetX, offsetY);

		// Draw shape to interactive canvas
		const { x: startX, y: startY } = this.canvasStore.getStartPosition();
		this.shapeEntity.drawCoords(startX, startY, x, y);

		// Restore translation
		this.canvasInteractive.context.restore();
	}

	stopDrawing(event: MouseEvent) {
		const { x, y } = this.getMousePosition(event);

		// Validate it's not the same point
		const { x: startX, y: startY } = this.canvasStore.getStartPosition();
		if (startX === x && startY === y) return;

		const shape = this.shapeEntity.createShape(startX, startY, x, y);
		if (!shape) return;

		// Add shape to local storage
		this.canvasStore.addShape(shape);

		// Clear interactive canvas
		this.clearCanvas(this.canvasInteractive);

		// Apply translation
		this.canvasStatic.context.save();
		const { x: offsetX, y: offsetY } = this.canvasStore.getOffset();
		this.canvasStatic.context.translate(offsetX, offsetY);

		// Draw shape to static canvas
		this.shapeEntity.drawShape(shape);

		// Restore translation
		this.canvasStatic.context.restore();
	}

	click(event: MouseEvent) {
		// Apply translation
		this.canvasInteractive.context.save();

		const { x: offsetX, y: offsetY } = this.canvasStore.getOffset();
		this.canvasInteractive.context.translate(offsetX, offsetY);

		// Clear interactive canvas
		this.clearCanvas(this.canvasInteractive);

		// Print selected shape
		const shapeSelected = this.hasSelectedShape(event);
		if (shapeSelected) {
			this.canvasStore.setCurrentShape(shapeSelected);
			this.shapeEntity.selectShape(shapeSelected);
		} else {
			this.canvasStore.setCurrentShape(null);
		}

		// Restore translation
		this.canvasInteractive.context.restore();
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

	private getMousePosition(event: MouseEvent) {
		const canvasRect = this.canvasStatic.html.getBoundingClientRect();

		const { x: offsetX, y: offsetY } = this.canvasStore.getOffset();
		const currentX = event.clientX - canvasRect.left - offsetX;
		const currentY = event.clientY - canvasRect.top - offsetY;

		return { x: currentX, y: currentY };
	}
}

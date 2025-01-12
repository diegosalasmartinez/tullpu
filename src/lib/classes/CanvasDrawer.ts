import { CanvasType, type CanvasInstance, type Shape, type Node, type Coords } from '$lib/types';
import CanvasStore from './CanvasStore';
import ShapeEntity from './ShapeEntity';

export default class CanvasDrawer {
	private canvasStatic: CanvasInstance;
	private canvasInteractive: CanvasInstance;
	private canvasStore: CanvasStore;
	private shapeEntity: ShapeEntity;

	private nodeSelected: Node | null = null;

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
			//this.canvasStatic.context.fillStyle = '#f0f0f0';
			//this.canvasStatic.context.fillRect(-10000, -10000, 20000, 20000);

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
			}
		});
	}

	startDrawing(event: MouseEvent) {
		// Clear canvas interactive
		this.clearCanvas(this.canvasInteractive);
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
		const coordsStart = this.canvasStore.getStartPosition();

		// Validate it's not the same point
		if (this.validateIsSamePoint(coordsStart, coordsMouse)) return;

		const shape = this.shapeEntity.createShape(coordsStart, coordsMouse);
		if (!shape) return;

		// Add shape to local storage
		this.canvasStore.addShape(shape);

		// Clear interactive canvas
		this.clearCanvas(this.canvasInteractive);

		this.drawCanvasCallback(this.canvasStatic, () => {
			// Draw shape to static canvas
			this.shapeEntity.drawShape(shape);
		});
	}

	startEditing(event: MouseEvent, shape: Shape) {
		const coords = this.getMousePosition(event);

		this.canvasStore.setCurrentShape(shape);
		this.nodeSelected = this.shapeEntity.getNodeSelected(shape, coords);

		// Remove shape from local storage
		// It will be added again when the user finishes editing
		this.canvasStore.removeShape(shape);

		// Draw static canvas without the selected shape
		this.drawCanvasStatic();

		this.drawCanvasCallback(this.canvasInteractive, () => {
			// Draw shape to static canvas
			this.shapeEntity.drawShape(shape, CanvasType.INTERACTIVE);
		});
	}

	editing(event: MouseEvent) {
		const shapeSelected = this.canvasStore.getCurrentShape();
		if (!shapeSelected) return;

		// Clear interactive canvas
		this.clearCanvas(this.canvasInteractive);

		this.drawCanvasCallback(this.canvasInteractive, () => {
			// Draw shape to interactive canvas
			const coordsStartPosition = this.canvasStore.getStartPosition();
			const coordsMouse = this.getMousePosition(event);

			const shapeUpdated = this.shapeEntity.updateShape(
				shapeSelected,
				coordsStartPosition,
				coordsMouse,
				this.nodeSelected
			);
			if (!shapeUpdated) return;

			// Draw new coords
			this.shapeEntity.drawShape(shapeUpdated, CanvasType.INTERACTIVE);
			this.shapeEntity.selectShape(shapeSelected);
		});
	}

	stopEditing(event: MouseEvent) {
		const shapeSelected = this.canvasStore.getCurrentShape();
		if (!shapeSelected) return;

		const coordsStartPosition = this.canvasStore.getStartPosition();
		const coordsMouse = this.getMousePosition(event);

		// Clear interactive canvas
		this.clearCanvas(this.canvasInteractive);

		// Validate it's not the same point
		if (this.validateIsSamePoint(coordsStartPosition, coordsMouse)) {
			// Add shape to local storage
			this.canvasStore.addShape(shapeSelected);

			this.drawCanvasCallback(this.canvasStatic, () => {
				// Draw shape to static canvas
				this.shapeEntity.drawShape(shapeSelected);
			});
		} else {
			const shapeUpdated = this.shapeEntity.updateShape(
				shapeSelected,
				coordsStartPosition,
				coordsMouse,
				this.nodeSelected
			);
			if (!shapeUpdated) return;

			// Add shape to local storage
			this.canvasStore.addShape(shapeUpdated);

			// Set current shape
			this.canvasStore.setCurrentShape(shapeUpdated);

			this.drawCanvasCallback(this.canvasStatic, () => {
				// Draw shape to static canvas
				this.shapeEntity.drawShape(shapeUpdated);
			});
		}
	}

	click(event: MouseEvent) {
		const shapeSelected = this.hasSelectedShape(event);
		if (!shapeSelected) {
			return this.canvasStore.setCurrentShape(null);
		}

		// Clear interactive canvas
		this.clearCanvas(this.canvasInteractive);

		this.drawCanvasCallback(this.canvasInteractive, () => {
			// Print selected shape
			this.canvasStore.setCurrentShape(shapeSelected);
			this.shapeEntity.selectShape(shapeSelected);
		});
	}

	hasSelectedShape(event: MouseEvent) {
		const coords = this.getMousePosition(event);

		for (const shape of this.canvasStore.getShapes()) {
			const isSelected = this.shapeEntity.isShapeSelected(shape, coords);
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

	private validateIsSamePoint(coordsStart: Coords, coordsMouse: Coords) {
		if (coordsStart.x === coordsMouse.x && coordsStart.y === coordsMouse.y) return true;
		return false;
	}
}

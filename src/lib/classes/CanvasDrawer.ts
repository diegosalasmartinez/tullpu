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
			for (const shape of this.canvasStore.shapes) {
				this.shapeEntity.drawShape(shape);
			}
		});
	}

	drawCanvasInteractive() {
		// Clear interactive canvas
		this.clearCanvas(this.canvasInteractive);

		this.drawCanvasCallback(this.canvasInteractive, () => {
			// Draw current shape
			const currentShape = this.canvasStore.currentShape;
			if (currentShape) {
				this.shapeEntity.selectShape(currentShape);
			}
		});
	}

	detectHoverInteractiveElements(event: MouseEvent) {
		const entity = this.detectEntity(event);
		if (entity) {
			// If there isn't a selected shape, show the cursor as move
			if (!this.canvasStore.currentShape) {
				this.canvasInteractive.html.style.cursor = 'move';
				return;
			}

			const coords = this.getMousePosition(event);
			const cursorStyle = this.shapeEntity.getCursorStyleOnHover(entity.shape, coords, entity.node);
			this.canvasInteractive.html.style.cursor = cursorStyle;
			return;
		}

		this.canvasInteractive.html.style.cursor = 'default';
	}

	startDrawing() {
		// Clear canvas interactive
		this.clearCanvas(this.canvasInteractive);
	}

	drawing(event: MouseEvent) {
		// Clear interactive canvas
		this.clearCanvas(this.canvasInteractive);

		this.drawCanvasCallback(this.canvasInteractive, () => {
			// Draw shape to interactive canvas
			const coordsMouse = this.getMousePosition(event);
			const coordsStart = this.canvasStore.startPosition;

			this.shapeEntity.drawCoords(coordsStart, coordsMouse);
		});
	}

	stopDrawing(event: MouseEvent) {
		const coordsMouse = this.getMousePosition(event);
		const coordsStart = this.canvasStore.startPosition;

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

	startEditing(shape: Shape, node: Node | null) {
		this.canvasStore.currentShape = shape;
		this.nodeSelected = node;

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
		const currentShape = this.canvasStore.currentShape;
		if (!currentShape) return;

		// Clear interactive canvas
		this.clearCanvas(this.canvasInteractive);

		this.drawCanvasCallback(this.canvasInteractive, () => {
			// Draw shape to interactive canvas
			const coordsStartPosition = this.canvasStore.startPosition;
			const coordsMouse = this.getMousePosition(event);

			const updatedShape = this.shapeEntity.updateShape(
				currentShape,
				coordsStartPosition,
				coordsMouse,
				this.nodeSelected
			);
			if (!updatedShape) return;

			// Draw new coords
			this.shapeEntity.drawShape(updatedShape, CanvasType.INTERACTIVE);
			this.shapeEntity.selectShape(currentShape);
		});
	}

	stopEditing(event: MouseEvent) {
		const currentShape = this.canvasStore.currentShape;
		if (!currentShape) return;

		const coordsStartPosition = this.canvasStore.startPosition;
		const coordsMouse = this.getMousePosition(event);

		// Clear interactive canvas
		this.clearCanvas(this.canvasInteractive);

		// Validate it's not the same point
		if (this.validateIsSamePoint(coordsStartPosition, coordsMouse)) {
			// Add shape to local storage
			this.canvasStore.addShape(currentShape);

			this.drawCanvasCallback(this.canvasStatic, () => {
				// Draw shape to static canvas
				this.shapeEntity.drawShape(currentShape);
			});
		} else {
			const updatedShape = this.shapeEntity.updateShape(
				currentShape,
				coordsStartPosition,
				coordsMouse,
				this.nodeSelected
			);
			if (!updatedShape) return;

			// Add shape to local storage
			this.canvasStore.addShape(updatedShape);

			// Set current shape
			this.canvasStore.currentShape = updatedShape;

			this.drawCanvasCallback(this.canvasStatic, () => {
				// Draw shape to static canvas
				this.shapeEntity.drawShape(updatedShape);
			});
		}
	}

	click(event: MouseEvent) {
		const entity = this.detectEntity(event);
		if (!entity) {
			return this.canvasStore.currentShape = null;
		}

		// Clear interactive canvas
		this.clearCanvas(this.canvasInteractive);

		this.drawCanvasCallback(this.canvasInteractive, () => {
			// Print selected shape
			this.canvasStore.currentShape = entity.shape;
			this.shapeEntity.selectShape(entity.shape);
		});
	}

	detectEntity(event: MouseEvent) {
		const coords = this.getMousePosition(event);

		for (const shape of this.canvasStore.shapes) {
			const isSelected = this.shapeEntity.isShapeDetected(shape, coords);
			if (isSelected) {
				const node = this.shapeEntity.getNodeSelected(shape, coords);
				return { shape, node };
			}
		}

		const currentShape = this.canvasStore.currentShape;
		if (!currentShape) return null;

		const isContentSelected = this.shapeEntity.isShapeContentDetected(currentShape, coords);
		if (isContentSelected) {
			const node = this.shapeEntity.getNodeSelected(currentShape, coords);
			return { shape: currentShape, node };
		}

		return null;
	}

	clearCanvas(canvas: CanvasInstance) {
		const { width, height } = canvas.html;
		canvas.context.clearRect(0, 0, width, height);
	}

	getMousePosition(event: MouseEvent): Coords {
		const canvasRect = this.canvasStatic.html.getBoundingClientRect();

		const { x: offsetX, y: offsetY } = this.canvasStore.offset;
		const currentX = event.clientX - canvasRect.left - offsetX;
		const currentY = event.clientY - canvasRect.top - offsetY;

		return { x: currentX, y: currentY };
	}

	private drawCanvasCallback(canvas: CanvasInstance, callback: () => void) {
		// Apply translation
		canvas.context.save();
		const { x: offsetX, y: offsetY } = this.canvasStore.offset;
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

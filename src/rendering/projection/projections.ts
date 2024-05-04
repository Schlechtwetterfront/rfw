import { Mat2D, Vec2 } from '../../math';
import { Rect } from '../../math/shapes';
import { Camera2D } from '../camera2d';
import { RenderContext } from '../render-context';
import { makeCameraProjection } from './camera';
import { makeCameraClipProjection, makeClipProjection } from './clip';
import { PROJECTION_MAT } from './constants';
import { PositiveXAxis, PositiveYAxis } from './types';
import { makeCameraViewportProjection } from './viewport';

export interface Projections {
    /**
     * Project viewport point `point` to scene.
     * @param point - Point to project
     * @param camera - Camera projection to apply
     * @returns `point`, modified
     */
    projectPointToScene(point: Vec2, camera: Camera2D): Vec2;

    /**
     * Project scene point `point` to viewport.
     * @param point - Point to project
     * @param camera - Camera projection to apply
     * @returns `point`, modified
     */
    projectPointToViewport(point: Vec2, camera: Camera2D): Vec2;

    /**
     * Project viewport rect `rect` to scene.
     * @param rect - Rect to project
     * @param camera - Camera projection to apply
     * @returns `rect`, modified
     */
    projectRectToScene(rect: Rect, camera: Camera2D): Rect;

    /**
     * Project scene rect `rect` to viewport.
     * @param rect - Rect to project
     * @param camera - Camera projection to apply
     * @returns `rect`, modified
     */
    projectRectToViewport(rect: Rect, camera: Camera2D): Rect;

    /**
     * Get camera projection.
     * @param camera - Camera to create projection from
     * @param target - Optional matrix to store the projection in. Will allocate a new instance otherwise
     * @returns `target` or newly allocated matrix
     */
    getCameraProjection(camera: Camera2D, target?: Mat2D): Mat2D;

    /**
     * Get clip projection.
     * @param camera - Optional camera projection to apply. If no camera is given assumes viewport space
     * @param target - Optional matrix to store the projection in. Will allocate a new instance otherwise
     * @returns `target` or newly allocated matrix
     */
    getClipProjection(camera?: Camera2D, target?: Mat2D): Mat2D;
}

export interface ProjectionOptions {
    readonly centered: boolean;
    readonly x: PositiveXAxis;
    readonly y: PositiveYAxis;
}

export class DefaultProjections implements Projections {
    constructor(
        protected readonly context: RenderContext,
        protected readonly options: ProjectionOptions = {
            centered: true,
            x: 'right',
            y: 'up',
        },
    ) {}

    /** @inheritdoc */
    projectPointToScene(point: Vec2, camera: Camera2D): Vec2 {
        makeCameraViewportProjection(
            PROJECTION_MAT,
            this.context.dimensions,
            this.options.centered,
            this.options.x,
            this.options.y,
            camera,
        );

        point.multiplyMatInverse(PROJECTION_MAT);

        return point;
    }

    /** @inheritdoc */
    projectPointToViewport(point: Vec2, camera: Camera2D): Vec2 {
        makeCameraViewportProjection(
            PROJECTION_MAT,
            this.context.dimensions,
            this.options.centered,
            this.options.x,
            this.options.y,
            camera,
        );

        point.multiplyMat(PROJECTION_MAT);

        return point;
    }

    /** @inheritdoc */
    projectRectToScene(rect: Rect, camera: Camera2D): Rect {
        makeCameraViewportProjection(
            PROJECTION_MAT,
            this.context.dimensions,
            this.options.centered,
            this.options.x,
            this.options.y,
            camera,
        );

        rect.multiplyMatInverse(PROJECTION_MAT);

        return rect;
    }

    /** @inheritdoc */
    projectRectToViewport(rect: Rect, camera: Camera2D): Rect {
        makeCameraViewportProjection(
            PROJECTION_MAT,
            this.context.dimensions,
            this.options.centered,
            this.options.x,
            this.options.y,
            camera,
        );

        rect.multiplyMat(PROJECTION_MAT);

        return rect;
    }

    /** @inheritdoc */
    getCameraProjection(camera: Camera2D, target?: Mat2D): Mat2D {
        target ??= Mat2D.identity();

        makeCameraProjection(target, camera, this.options.x, this.options.y);

        return target;
    }

    /** @inheritdoc */
    getClipProjection(camera?: Camera2D, target?: Mat2D): Mat2D {
        target ??= Mat2D.identity();

        if (camera) {
            makeCameraClipProjection(
                target,
                this.context.dimensions,
                this.options.centered,
                this.options.x,
                this.options.y,
                camera,
            );
        } else {
            makeClipProjection(
                target,
                this.context.dimensions,
                false,
                'right',
                'down',
            );
        }

        return target;
    }
}

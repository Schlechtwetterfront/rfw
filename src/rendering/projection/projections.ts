import { Mat2D, Vec2 } from '../../math';
import { Rect } from '../../math/shapes';
import { Camera2D } from '../camera2d';
import { RenderContext } from '../render-context';
import { makeCameraProjection } from './camera';
import { makeCameraClipProjection, makeClipProjection } from './clip';
import { PROJECTION_MAT } from './constants';
import { makeCameraViewportProjection } from './viewport';

/**
 * Service to project points
 * @category Rendering
 * */
export interface Projections {
    /**
     * Project a DOM point (e.g., from pointer events) to viewport space.
     * @param point - DOM point
     * @returns `point`, modified
     */
    projectDOMPointToViewport(point: Vec2): Vec2;

    /**
     * Project a DOM point (e.g., from pointer events) to scene space.
     * @param point - DOM point
     * @param camera - Camera projection to apply
     * @returns `point`, modified
     */
    projectDOMPointToScene(point: Vec2, camera: Camera2D): Vec2;

    /**
     * Project viewport point `point` to scene space.
     * @param point - Point to project
     * @param camera - Camera projection to apply
     * @returns `point`, modified
     */
    projectViewportPointToScene(point: Vec2, camera: Camera2D): Vec2;

    /**
     * Project viewport point `point` to DOM space.
     * @param point - Point to project
     * @returns `point`, modified
     */
    projectViewportPointToDOM(point: Vec2): Vec2;

    /**
     * Project scene point `point` to viewport space.
     * @param point - Point to project
     * @param camera - Camera projection to apply
     * @returns `point`, modified
     */
    projectScenePointToViewport(point: Vec2, camera: Camera2D): Vec2;

    /**
     * Project scene point `point` to DOM space.
     * @param point - Point to project
     * @param camera - Camera projection to apply
     * @returns `point`, modified
     */
    projectScenePointToDOM(point: Vec2, camera: Camera2D): Vec2;

    /**
     * Project a DOM rect (e.g., from pointer events) to viewport space.
     * @param rect - DOM rect
     * @returns `rect`, modified
     *
     * @remarks
     * Only takes and produces axis-aligned rects.
     */
    projectDOMRectToViewport(rect: Rect): Rect;

    /**
     * Project a DOM rect (e.g., from pointer events) to scene space.
     * @param rect - DOM rect
     * @param camera - Camera projection to apply
     * @returns `rect`, modified
     *
     * @remarks
     * Only takes and produces axis-aligned rects.
     */
    projectDOMRectToScene(rect: Rect, camera: Camera2D): Rect;

    /**
     * Project viewport rect `rect` to scene space.
     * @param rect - Rect to project
     * @param camera - Camera projection to apply
     * @returns `rect`, modified
     *
     * @remarks
     * Only takes and produces axis-aligned rects.
     */
    projectViewportRectToScene(rect: Rect, camera: Camera2D): Rect;

    /**
     * Project viewport rect `rect` to scene space.
     * @param rect - Rect to project
     * @returns `rect`, modified
     *
     * @remarks
     * Only takes and produces axis-aligned rects.
     */
    projectViewportRectToDOM(rect: Rect): Rect;

    /**
     * Project scene rect `rect` to viewport space.
     * @param rect - Rect to project
     * @param camera - Camera projection to apply
     * @returns `rect`, modified
     *
     * @remarks
     * Only takes and produces axis-aligned rects.
     */
    projectSceneRectToViewport(rect: Rect, camera: Camera2D): Rect;

    /**
     * Project scene rect `rect` to viewport space.
     * @param rect - Rect to project
     * @param camera - Camera projection to apply
     * @returns `rect`, modified
     *
     * @remarks
     * Only takes and produces axis-aligned rects.
     */
    projectSceneRectToDOM(rect: Rect, camera: Camera2D): Rect;

    /**
     * Get camera projection.
     * @param camera - Camera to create projection from
     * @param target - Optional matrix to store the projection in. Will allocate a new instance otherwise
     * @returns `target` or newly allocated matrix
     */
    getCameraProjection(camera: Camera2D, target?: Mat2D): Mat2D;

    /**
     * Get clip projection.
     * @param camera - Optional camera projection to apply
     * @param target - Optional matrix to store the projection in. Will allocate a new instance otherwise
     * @returns `target` or newly allocated matrix
     */
    getClipProjection(camera?: Camera2D, target?: Mat2D): Mat2D;

    /**
     * Get clip projection in viewport space.
     * @param target - Optional matrix to store the projection in. Will allocate a new instance otherwise
     * @return `target` or newly allocated matrix
     */
    getViewportClipProjection(target?: Mat2D): Mat2D;
}

/** @category Rendering */
export interface ProjectionOptions {
    readonly centered: boolean;
}

/** @category Rendering */
export class DefaultProjections implements Projections {
    constructor(
        protected readonly context: RenderContext,
        protected readonly options: ProjectionOptions = {
            centered: true,
        },
    ) {}

    projectDOMPointToViewport(point: Vec2): Vec2 {
        point.y = this.context.dimensions.y - point.y;

        return point;
    }

    projectDOMPointToScene(point: Vec2, camera: Camera2D): Vec2 {
        point = this.projectDOMPointToViewport(point);

        point = this.projectViewportPointToScene(point, camera);

        return point;
    }

    projectViewportPointToScene(point: Vec2, camera: Camera2D): Vec2 {
        makeCameraViewportProjection(
            PROJECTION_MAT,
            this.context.dimensions,
            this.options.centered,
            camera,
        );

        point.multiplyMatInverse(PROJECTION_MAT);

        return point;
    }

    projectViewportPointToDOM(point: Vec2): Vec2 {
        point.y = this.context.dimensions.y - point.y;

        return point;
    }

    projectScenePointToViewport(point: Vec2, camera: Camera2D): Vec2 {
        makeCameraViewportProjection(
            PROJECTION_MAT,
            this.context.dimensions,
            this.options.centered,
            camera,
        );

        point.multiplyMat(PROJECTION_MAT);

        return point;
    }

    projectScenePointToDOM(point: Vec2, camera: Camera2D): Vec2 {
        point = this.projectScenePointToViewport(point, camera);

        point = this.projectViewportPointToDOM(point);

        return point;
    }

    projectDOMRectToViewport(rect: Rect): Rect {
        rect.y = this.context.dimensions.y - rect.y;

        return rect;
    }

    projectDOMRectToScene(rect: Rect, camera: Camera2D): Rect {
        rect = this.projectDOMRectToViewport(rect);

        rect = this.projectViewportRectToScene(rect, camera);

        return rect;
    }

    projectViewportRectToScene(rect: Rect, camera: Camera2D): Rect {
        makeCameraViewportProjection(
            PROJECTION_MAT,
            this.context.dimensions,
            this.options.centered,
            camera,
        );

        rect.multiplyMatInverse(PROJECTION_MAT);

        return rect;
    }

    projectViewportRectToDOM(rect: Rect): Rect {
        rect.y = this.context.dimensions.y - rect.y;

        return rect;
    }

    projectSceneRectToViewport(rect: Rect, camera: Camera2D): Rect {
        makeCameraViewportProjection(
            PROJECTION_MAT,
            this.context.dimensions,
            this.options.centered,
            camera,
        );

        rect.multiplyMat(PROJECTION_MAT);

        return rect;
    }

    projectSceneRectToDOM(rect: Rect, camera: Camera2D): Rect {
        rect = this.projectSceneRectToViewport(rect, camera);

        rect = this.projectViewportRectToDOM(rect);

        return rect;
    }

    getCameraProjection(camera: Camera2D, target?: Mat2D): Mat2D {
        target ??= Mat2D.identity();

        makeCameraProjection(target, camera);

        return target;
    }

    getClipProjection(camera?: Camera2D, target?: Mat2D): Mat2D {
        target ??= Mat2D.identity();

        makeCameraClipProjection(
            target,
            this.context.dimensions,
            this.context.flipY,
            this.options.centered,
            camera,
        );

        return target;
    }

    getViewportClipProjection(target?: Mat2D): Mat2D {
        target ??= Mat2D.identity();

        makeClipProjection(
            target,
            this.context.dimensions,
            this.context.flipY,
            false,
        );

        return target;
    }
}

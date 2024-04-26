import { ChangeTracker } from '../app/change-tracking';
import { Mat2D, Transform2D, Vec2Like } from '../math';

export interface CameraOptions {
    centered?: boolean;
    changeTracker?: ChangeTracker;
}

/**
 * An orthographic camera.
 */
export class Camera2D {
    private readonly changeTracker?: ChangeTracker;

    readonly transform = new Transform2D();

    readonly centered: boolean;

    constructor(options?: CameraOptions) {
        this.centered = options?.centered ?? false;
        this.changeTracker = options?.changeTracker;
    }

    /**
     * Pan this camera globally.
     * @param x - Amount to pan on X axis
     * @param y - Optional, amount to pan on Y axis. If omitted, will be `x`
     * @returns Self
     */
    pan(x: number, y?: number): this {
        this.transform.position.add(x, y);

        this.changeTracker?.registerChange();

        return this;
    }

    /**
     * Pan this camera globally.
     * @param vec - Amount to pan
     * @returns Self
     */
    panVec(vec: Vec2Like): this {
        this.transform.position.addVec(vec);

        this.changeTracker?.registerChange();

        return this;
    }

    /**
     * Pan this camera locally (respecting scaling/zoom).
     * @param x - Amount to pan on X axis
     * @param y - Optional, amount to pan on Y axis. If omitted, will be `x`
     * @returns
     */
    panLocally(x: number, y?: number): this {
        y ??= x;

        x /= this.transform.scale.x;
        y /= this.transform.scale.x;

        this.transform.position.add(x, y);

        this.changeTracker?.registerChange();

        return this;
    }

    /**
     * Pan this camera locally (respecting scaling/zoom).
     * @param vec - Amount to pan
     * @returns Self
     */
    panLocallyVec(vec: Vec2Like): this {
        return this.panLocally(vec.x, vec.y);
    }

    /**
     * Pan this camera to an absolute point.
     * @param x - Point X coordinate
     * @param y - Optional, point Y coordinate. If omitted, will be `x`
     * @returns Self
     */
    panTo(x: number, y?: number): this {
        this.transform.position.set(x, y ?? x);

        this.changeTracker?.registerChange();

        return this;
    }

    /**
     * Pan this camera to an absolute point.
     * @param vec - Point
     * @returns Self
     */
    panToVec(vec: Vec2Like): this {
        this.transform.position.copyFrom(vec);

        this.changeTracker?.registerChange();

        return this;
    }

    /**
     * Zoom this camera.
     * @param zoom - Zoom amount
     * @returns Self
     */
    zoom(zoom: number): this {
        this.transform.scale.multiply(zoom);

        this.changeTracker?.registerChange();

        return this;
    }

    /**
     * Zoom this camera to an absolute zoom level.
     * @param zoom - Absolute zoom value
     * @returns Self
     */
    zoomTo(zoom: number): this {
        this.transform.scale.xy = zoom;

        this.changeTracker?.registerChange();

        return this;
    }

    /**
     * Tilt this camera.
     * @param radians - Tilt amount in radians
     * @returns Self
     */
    tiltRadians(radians: number): this {
        this.transform.radians += radians;

        this.changeTracker?.registerChange();

        return this;
    }

    /**
     * Tilt this camera to an absolute rotation.
     * @param radians - Tilt in radians
     * @returns Self
     */
    tiltToRadians(radians: number): this {
        this.transform.radians = radians;

        this.changeTracker?.registerChange();

        return this;
    }

    /**
     * Tilt this camera.
     * @param degrees - Tilt amount in degrees
     * @returns Self
     */
    tiltDegrees(degrees: number): this {
        this.transform.degrees += degrees;

        this.changeTracker?.registerChange();

        return this;
    }

    /**
     * Tilt this camera to an absolute rotation.
     * @param degrees - Tilt in degrees
     * @returns Self
     */
    tiltToDegrees(degrees: number): this {
        this.transform.degrees = degrees;

        this.changeTracker?.registerChange();

        return this;
    }

    /**
     * Compose this camera's pan, zoom, and tilt to `mat` or this camera's transform matrix.
     * @param mat - Optional, target matrix to compose to
     * @returns Composed matrix (`mat`, if passed)
     */
    compose(mat?: Mat2D): Mat2D {
        mat ??= this.transform.matrix;

        mat.makeIdentity()
            .rotateDegrees(-this.transform.degrees)
            .translate(-this.transform.position.x, -this.transform.position.y)
            .scale(this.transform.scale.x, this.transform.scale.y);

        return mat;
    }
}

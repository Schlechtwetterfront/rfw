import { Mat2D, ReadOnlyMat2D, Vec2, Vec2Like } from '../math';
import { Rect } from '../math/shapes';
import { Camera2D } from './camera2d';
import { RenderDriver } from './render-driver';

const PROJECTION_MAT = Mat2D.IDENTITY;
const PROJECTION_ARRAY = new Float32Array(6);
const CAMERA_MAT = Mat2D.IDENTITY;

export function getUseOnceClipProjectionArray(
    dimensions: Vec2Like,
    camera?: Camera2D,
): Float32Array {
    const projection = getUseOnceClipProjection(dimensions, camera);

    projection.copyTo3x2(PROJECTION_ARRAY);

    return PROJECTION_ARRAY;
}

export function getUseOnceClipProjection(
    dimensions: Vec2Like,
    camera?: Camera2D,
): ReadOnlyMat2D {
    makeClipProjection(PROJECTION_MAT, dimensions, camera);

    return PROJECTION_MAT;
}

export function makeClipProjection(
    mat: Mat2D,
    dimensions: Vec2Like,
    camera?: Camera2D,
): void {
    const cameraProjection =
        camera?.compose(CAMERA_MAT) ?? CAMERA_MAT.makeIdentity();

    mat.a = 2 / dimensions.x;
    mat.b = 0;
    mat.c = 0;
    mat.d = -2 / dimensions.y;
    mat.tx = camera?.origin === 'center' ? 0 : -1;
    mat.ty = camera?.origin === 'center' ? 0 : 1;

    mat.multiplyMat(cameraProjection);
}

export function getUseOnceBottomLeftProjection(
    dimensions: Vec2Like,
    camera?: Camera2D,
): ReadOnlyMat2D {
    makeBottomLeftViewportProjection(PROJECTION_MAT, dimensions, camera);

    return PROJECTION_MAT;
}

export function makeBottomLeftViewportProjection(
    mat: Mat2D,
    dimensions: Vec2Like,
    camera?: Camera2D,
): void {
    const cameraProjection =
        camera?.compose(CAMERA_MAT) ?? CAMERA_MAT.makeIdentity();

    mat.a = 1;
    mat.b = 0;
    mat.c = 0;
    mat.d = -1;
    mat.tx = camera?.origin === 'center' ? dimensions.x * 0.5 : 0;
    mat.ty = camera?.origin === 'center' ? dimensions.y * 0.5 : dimensions.y;

    mat.multiplyMat(cameraProjection);
}

export function projectViewportToScene(
    pos: Vec2,
    dimensions: Vec2Like,
    camera?: Camera2D,
): void {
    const cameraProjection =
        camera?.compose(CAMERA_MAT) ?? CAMERA_MAT.makeIdentity();

    const mat = PROJECTION_MAT;

    mat.a = 1;
    mat.b = 0;
    mat.c = 0;
    mat.d = 1;
    mat.tx = camera?.origin === 'center' ? dimensions.x * 0.5 : 0;
    mat.ty = camera?.origin === 'center' ? dimensions.y * 0.5 : 0;

    mat.multiplyMat(cameraProjection);

    pos.multiplyInverse(mat);
}

export function projectViewportRectToScene(
    rect: Rect,
    dimensions: Vec2Like,
    camera?: Camera2D,
): void {
    const cameraProjection =
        camera?.compose(CAMERA_MAT) ?? CAMERA_MAT.makeIdentity();

    const mat = PROJECTION_MAT;

    mat.a = 1;
    mat.b = 0;
    mat.c = 0;
    mat.d = 1;
    mat.tx = camera?.origin === 'center' ? dimensions.x * 0.5 : 0;
    mat.ty = camera?.origin === 'center' ? dimensions.y * 0.5 : 0;

    mat.multiplyMat(cameraProjection);

    rect.multiplyMatInverse(mat);
}

export class Projections {
    constructor(private readonly driver: RenderDriver) {}

    fromViewportToScene(point: Vec2, camera?: Camera2D): void {
        projectViewportToScene(point, this.driver.dimensions, camera);
    }

    rectFromViewportToScene(rect: Rect, camera?: Camera2D): void {
        projectViewportRectToScene(rect, this.driver.dimensions, camera);
    }
}

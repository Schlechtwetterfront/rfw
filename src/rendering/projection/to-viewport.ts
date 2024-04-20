import { ReadOnlyMat2D, Vec2, Vec2Like } from '../../math';
import { Rect } from '../../math/shapes';
import { Camera2D } from '../camera2d';
import { CAMERA_MAT, PROJECTION_MAT } from './constants';

export function projectPointToViewport(
    point: Vec2,
    dimensions: Vec2Like,
    camera: Camera2D,
): void {
    const mat = getUseOnceToViewportProjection(dimensions, camera);

    point.multiplyMat(mat);
}

export function projectRectToViewport(
    rect: Rect,
    dimensions: Vec2Like,
    camera: Camera2D,
): void {
    const mat = getUseOnceToViewportProjection(dimensions, camera);

    rect.multiplyMat(mat);
}

export function getUseOnceToViewportProjection(
    dimensions: Vec2Like,
    camera: Camera2D,
): ReadOnlyMat2D {
    const cameraProjection = camera.compose(CAMERA_MAT);

    const mat = PROJECTION_MAT;

    mat.a = 1;
    mat.b = 0;
    mat.c = 0;
    mat.d = 1;
    mat.tx = camera.origin === 'center' ? dimensions.x * 0.5 : 0;
    mat.ty = camera.origin === 'center' ? dimensions.y * 0.5 : 0;

    mat.multiplyMat(cameraProjection);

    return mat;
}

import { ReadOnlyMat2D, Vec2, Vec2Like } from '../../math';
import { Rect } from '../../math/shapes';
import { Camera2D } from '../camera2d';
import { CAMERA_MAT, PROJECTION_MAT } from './constants';

export function projectPointToScene(
    point: Vec2,
    dimensions: Vec2Like,
    camera: Camera2D,
): void {
    const mat = getUseOnceToSceneProjection(dimensions, camera);

    point.multiplyMatInverse(mat);
}

export function projectRectToScene(
    rect: Rect,
    dimensions: Vec2Like,
    camera: Camera2D,
): void {
    const mat = getUseOnceToSceneProjection(dimensions, camera);

    rect.multiplyMatInverse(mat);
}

export function getUseOnceToSceneProjection(
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

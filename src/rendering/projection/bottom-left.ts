import { Mat2D, ReadOnlyMat2D, Vec2Like } from '../../math';
import { Camera2D, CameraOrigin } from '../camera2d';
import { CAMERA_MAT, PROJECTION_MAT } from './constants';

export function getUseOnceBottomLeftProjection(
    dimensions: Vec2Like,
    camera: Camera2D | CameraOrigin = 'topLeft',
): ReadOnlyMat2D {
    makeBottomLeftViewportProjection(PROJECTION_MAT, dimensions, camera);

    return PROJECTION_MAT;
}

export function makeBottomLeftViewportProjection(
    mat: Mat2D,
    dimensions: Vec2Like,
    camera: Camera2D | CameraOrigin = 'topLeft',
): void {
    const origin = typeof camera === 'string' ? camera : camera.origin;

    const cameraProjection =
        typeof camera === 'object'
            ? camera.compose(CAMERA_MAT)
            : CAMERA_MAT.makeIdentity();

    mat.a = 1;
    mat.b = 0;
    mat.c = 0;
    mat.d = -1;
    mat.tx = origin === 'center' ? dimensions.x * 0.5 : 0;
    mat.ty = origin === 'center' ? dimensions.y * 0.5 : dimensions.y;

    mat.multiplyMat(cameraProjection);
}

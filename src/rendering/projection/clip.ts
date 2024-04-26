import { Mat2D, ReadOnlyMat2D, Vec2Like } from '../../math';
import { Camera2D } from '../camera2d';
import { CAMERA_MAT, PROJECTION_ARRAY, PROJECTION_MAT } from './constants';

export function getUseOnceClipProjectionArray(
    dimensions: Vec2Like,
    camera: Camera2D | boolean = false,
): Float32Array {
    const projection = getUseOnceClipProjection(dimensions, camera);

    projection.copyTo3x2(PROJECTION_ARRAY);

    return PROJECTION_ARRAY;
}

export function getUseOnceClipProjection(
    dimensions: Vec2Like,
    camera: Camera2D | boolean = false,
): ReadOnlyMat2D {
    makeClipProjection(PROJECTION_MAT, dimensions, camera);

    return PROJECTION_MAT;
}

export function makeClipProjection(
    mat: Mat2D,
    dimensions: Vec2Like,
    camera: Camera2D | boolean = false,
): void {
    const centered = typeof camera === 'boolean' ? camera : camera.centered;

    const cameraProjection =
        typeof camera === 'object'
            ? camera.compose(CAMERA_MAT)
            : CAMERA_MAT.makeIdentity();

    mat.a = 2 / dimensions.x;
    mat.b = 0;
    mat.c = 0;
    mat.d = -2 / dimensions.y;
    mat.tx = centered ? 0 : -1;
    mat.ty = centered ? 0 : 1;

    mat.multiplyMat(cameraProjection);
}

import { Mat2D, ReadOnlyMat2D } from '../../math';
import { Camera2D } from '../camera2d';
import { PROJECTION_ARRAY, PROJECTION_MAT } from './constants';

export function getUseOnceCameraProjectionArray(
    camera: Camera2D,
): Float32Array {
    const projection = getUseOnceCameraProjection(camera);

    projection.copyTo3x2(PROJECTION_ARRAY);

    return PROJECTION_ARRAY;
}

export function getUseOnceCameraProjection(camera: Camera2D): ReadOnlyMat2D {
    makeCameraProjection(PROJECTION_MAT, camera);

    return PROJECTION_MAT;
}

export function makeCameraProjection(mat: Mat2D, camera: Camera2D): void {
    camera.compose(mat);
}

import { Mat2D, Vec2Like } from '../../math';
import { Camera2D } from '../camera2d';
import { makeCameraProjection } from './camera';
import { CAMERA_MAT } from './constants';

/** @category Rendering */
export function makeViewportProjection(
    mat: Mat2D,
    dimensions: Vec2Like,
    centered: boolean = true,
): void {
    mat.a = 1;
    mat.b = 0;
    mat.c = 0;
    mat.d = 1;
    mat.tx = dimensions.x * (centered ? 0.5 : 0);
    mat.ty = dimensions.y * (centered ? 0.5 : 0);
}

/** @category Rendering */
export function makeCameraViewportProjection(
    mat: Mat2D,
    dimensions: Vec2Like,
    centered: boolean = true,
    camera?: Camera2D,
): void {
    makeViewportProjection(mat, dimensions, centered);

    if (camera) {
        makeCameraProjection(CAMERA_MAT, camera);

        mat.multiplyMat(CAMERA_MAT);
    }
}

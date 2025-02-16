import { Mat2D, Vec2Like } from '../../math';
import { Camera2D } from '../camera2d';
import { makeCameraProjection } from './camera';
import { CAMERA_MAT } from './constants';

/** @category Rendering */
export function makeClipProjection(
    mat: Mat2D,
    dimensions: Vec2Like,
    flipY: boolean = false,
    centered: boolean = true,
): void {
    mat.a = 2 / dimensions.x;
    mat.b = 0;
    mat.c = 0;
    mat.d = (flipY ? -1 : 1) * (2 / dimensions.y);
    mat.tx = centered ? 0 : -1;
    mat.ty = centered ? 0 : -1;
}

/** @category Rendering */
export function makeCameraClipProjection(
    mat: Mat2D,
    dimensions: Vec2Like,
    flipY: boolean = false,
    centered: boolean = true,
    camera?: Camera2D,
): void {
    makeClipProjection(mat, dimensions, flipY, centered);

    if (camera) {
        makeCameraProjection(CAMERA_MAT, camera);

        mat.multiplyMat(CAMERA_MAT);
    }
}

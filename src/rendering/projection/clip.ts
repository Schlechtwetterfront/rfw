import { Mat2D, Vec2Like } from '../../math';
import { Camera2D } from '../camera2d';
import { makeCameraProjection } from './camera';
import { CAMERA_MAT } from './constants';
import { PositiveXAxis, PositiveYAxis } from './types';

/** @category Rendering */
export function makeClipProjection(
    mat: Mat2D,
    dimensions: Vec2Like,
    centered: boolean = true,
    x: PositiveXAxis = 'right',
    y: PositiveYAxis = 'up',
): void {
    mat.a = (x === 'right' ? 2 : -2) / dimensions.x;
    mat.b = 0;
    mat.c = 0;
    mat.d = (y === 'up' ? 2 : -2) / dimensions.y;
    mat.tx = centered ? 0 : -1;
    mat.ty = centered ? 0 : 1;
}

/** @category Rendering */
export function makeCameraClipProjection(
    mat: Mat2D,
    dimensions: Vec2Like,
    centered: boolean = true,
    x: PositiveXAxis = 'right',
    y: PositiveYAxis = 'up',
    camera?: Camera2D,
): void {
    makeClipProjection(mat, dimensions, centered, x, y);

    if (camera) {
        makeCameraProjection(CAMERA_MAT, camera, x, y);

        mat.multiplyMat(CAMERA_MAT);
    }
}

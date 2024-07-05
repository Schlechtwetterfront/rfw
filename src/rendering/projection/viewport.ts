import { Mat2D, Vec2Like } from '../../math';
import { Camera2D } from '../camera2d';
import { makeCameraProjection } from './camera';
import { CAMERA_MAT } from './constants';
import { PositiveXAxis, PositiveYAxis } from './types';

/** @category Rendering */
export function makeViewportProjection(
    mat: Mat2D,
    dimensions: Vec2Like,
    centered: boolean = true,
    x: PositiveXAxis = 'right',
    y: PositiveYAxis = 'up',
): void {
    mat.a = x === 'right' ? 1 : -1;
    mat.b = 0;
    mat.c = 0;
    mat.d = y === 'up' ? -1 : 1;
    mat.tx = dimensions.x * (centered ? 0.5 : x === 'left' ? 1 : 0);
    mat.ty = dimensions.y * (centered ? 0.5 : y === 'up' ? 1 : 0);
}

/** @category Rendering */
export function makeCameraViewportProjection(
    mat: Mat2D,
    dimensions: Vec2Like,
    centered: boolean = true,
    x: PositiveXAxis = 'right',
    y: PositiveYAxis = 'up',
    camera?: Camera2D,
): void {
    makeViewportProjection(mat, dimensions, centered, x, y);

    if (camera) {
        makeCameraProjection(CAMERA_MAT, camera, x, y);

        mat.multiplyMat(CAMERA_MAT);
    }
}

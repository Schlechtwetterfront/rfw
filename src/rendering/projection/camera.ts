import { Mat2D } from '../../math';
import { Camera2D } from '../camera2d';
import { PositiveXAxis, PositiveYAxis } from './types';

export function makeCameraProjection(
    mat: Mat2D,
    camera: Camera2D,
    x: PositiveXAxis = 'right',
    y: PositiveYAxis = 'up',
): void {
    mat.makeIdentity()
        .rotateRadians(-camera.transform.radians)
        .translate(
            (x === 'right' ? -1 : 1) * camera.transform.position.x,
            (y === 'down' ? 1 : -1) * camera.transform.position.y,
        )
        .scale(camera.transform.scale.x, camera.transform.scale.y);
}

import { Mat2D } from '../../math';
import { Camera2D } from '../camera2d';

/** @category Rendering */
export function makeCameraProjection(mat: Mat2D, camera: Camera2D): void {
    mat.makeIdentity()
        .rotateRadians(-camera.transform.radians)
        .translate(-camera.transform.position.x, -camera.transform.position.y)
        .scale(camera.transform.scale.x, camera.transform.scale.y);
}

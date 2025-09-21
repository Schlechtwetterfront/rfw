import { Color } from '../../colors';
import { TextureHandle } from '../../rendering/textures';

/**
 * Simple material with texture and color.
 *
 * @category Rendering - Mesh
 */
export class Material {
    constructor(
        public texture: TextureHandle,
        public color = Color.WHITE,
    ) {}
}

import { Color } from '../../colors';
import { Material } from '../../rendering/mesh';
import { TextureHandle } from '../../rendering/textures';

/**
 * Simple material with texture and color.
 *
 * @category Rendering
 */
export class TexturedMaterial implements Material {
    constructor(
        public texture: TextureHandle,
        public color = Color.white(),
    ) {}
}

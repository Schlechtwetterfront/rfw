import { Color } from '../../colors';
import { TextureHandle } from '../../rendering/textures';

/**
 * Simple material with texture and color.
 *
 * @category Rendering - Textured Mesh
 */
export class TexturedMaterial {
    constructor(
        public texture: TextureHandle,
        public color = Color.white(),
    ) {}
}

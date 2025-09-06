import { SpriteLike } from '.';
import { BatchEntry, Batcher } from '../../rendering/batching';
import { TextureHandle } from '../../rendering/textures';
import { TexturedBatch } from '../textured';

/** @category Rendering - Sprites */
export class SpriteBatchEntry<O = SpriteLike> extends BatchEntry<O> {
    texture?: TextureHandle;

    override reset(): void {
        super.reset();

        this.texture = undefined;
    }
}

/** @category Rendering - Sprites */
export abstract class SpriteBatchBase<
    O extends SpriteLike = SpriteLike,
    E extends SpriteBatchEntry<O> = SpriteBatchEntry<O>,
> extends TexturedBatch<O, E> {}

/** @category Rendering - Sprites */
export const DEFAULT_MAX_SPRITE_COUNT = 32_000;

/** @category Rendering - Sprites */
export abstract class SpriteBatcherBase<
    O extends SpriteLike,
    E extends SpriteBatchEntry<O>,
    B extends SpriteBatchBase<O, E>,
> extends Batcher<O, E, B> {
    protected maximums?: { maxTextureCount: number; maxSpriteCount: number };

    get maxTextureCount() {
        return this.maximums?.maxTextureCount;
    }

    get maxSpriteCount() {
        return this.maximums?.maxSpriteCount;
    }

    setMaximums(maxTextureCount: number, maxSpriteCount?: number): void {
        maxSpriteCount ??= DEFAULT_MAX_SPRITE_COUNT;

        const hasBatches = this.batches.length > 0;

        if (hasBatches && this.maximums) {
            throw new Error(
                'Batcher already built batches. Clear batches built with previous maximums before changing thresholds.',
            );
        }

        this.maximums = { maxTextureCount, maxSpriteCount };
    }

    protected override shouldRebuildBatch(batch: B): boolean {
        if (super.shouldRebuildBatch(batch)) {
            return true;
        }

        return batch.textureOrderChanged;
    }

    protected override canAddToBatch(
        entry: E,
        batch: B,
        additionalSize?: number,
    ): boolean {
        if (
            batch.textureCount >= this.maxTextureCount! &&
            !batch.hasTexture(entry.texture!)
        ) {
            return false;
        }

        if (typeof additionalSize === 'number') {
            return batch.size + additionalSize <= this.maxSpriteCount!;
        }

        if (batch.size + entry.size > this.maxSpriteCount!) {
            return false;
        }

        return true;
    }

    protected override changeEntry(entry: E, batch: B | undefined): void {
        const object = entry.object!;

        const texChanged = object.material.texture !== entry.texture;

        entry.texture = object.material.texture;

        if (!batch) {
            return;
        }

        if (texChanged && !batch.hasTexture(entry.texture)) {
            entry.checkCapacity = true;
        }
    }
}

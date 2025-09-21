# Render to Texture

Renders the clock once to a texture, then renders it again and the texture at a higher zoom level.

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { RenderToTextureApp } from './render-to-texture';
import { Rect, WGLDriver } from '../../src';

const canvas = ref<HTMLCanvasElement>();

let app: RenderToTextureApp | undefined;

watchEffect(async () => {
    const c = canvas.value

    if (!c) {
        return;
    }

    const driver = await WGLDriver.fromCanvas(c);

    app = new RenderToTextureApp(c, driver);

    await app.initializeAndStart();
})
</script>

<section>
    <canvas class="sample-canvas" ref="canvas" tabindex="0" style="aspect-ratio: 1"></canvas>
</section>

::: details Code

<<< ./render-to-texture.ts

:::

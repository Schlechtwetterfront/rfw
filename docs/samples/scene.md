# Solar System

A simple scene of our solar system (distances not to scale).

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import {SceneApp} from './scene';
import { Rect, WGLDriver } from '../../src';

const canvas = ref<HTMLCanvasElement>();

let app: SceneApp | undefined;

watchEffect(async () => {
    const c = canvas.value

    if (!c) {
        return;
    }

    const driver = await WGLDriver.fromCanvas(c);

    app = new SceneApp(c, driver);

    await app.initializeAndStart();
})
</script>

<section>
    <canvas class="sample-canvas" ref="canvas" tabindex="0" style="aspect-ratio: 1"></canvas>
</section>

::: details Code

<<< ./scene.ts

:::

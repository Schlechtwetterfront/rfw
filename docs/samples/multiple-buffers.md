# Multiple Buffers

Most built-in renderers interleave all data in a single buffer. This sample uses a renderer that
stores color info in a separate buffer. Because only the color of the meshes is changed, only the
color buffer is updated and uploaded to the GPU.

<script setup lang="ts">
import { ref, watchEffect, onUnmounted } from 'vue';
import { MultipleBuffersApp } from './multiple-buffers';
import { WGLDriver } from '../../src';

const canvas = ref<HTMLCanvasElement>();

let app: MultipleBuffersApp | undefined;

watchEffect(async () => {
    const c = canvas.value

    if (!c) {
        return;
    }

    const driver = await WGLDriver.fromCanvas(c);

    app = new MultipleBuffersApp(c, driver);

    await app.initializeAndStart();
})

onUnmounted(() => app?.stop());
</script>

<section>
    <canvas class="sample-canvas" ref="canvas" tabindex="0"></canvas>
</section>

::: details Code

<<< ./multiple-buffers.ts

:::

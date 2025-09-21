# Lines

<script setup lang="ts">
import { ref, watchEffect, onUnmounted } from 'vue';
import { LineApp } from './lines';
import { WGLDriver } from '../../src';

const canvas = ref<HTMLCanvasElement>();

let app: LineApp | undefined;

watchEffect(async () => {
    const c = canvas.value

    if (!c) {
        return;
    }

    const driver = await WGLDriver.fromCanvas(c);

    app = new LineApp(c, driver);

    await app.initializeAndStart();
})

onUnmounted(() => app?.stop());
</script>

<section>
    <canvas class="sample-canvas" ref="canvas" tabindex="0"></canvas>
</section>

::: details Code

<<< ./lines.ts

:::

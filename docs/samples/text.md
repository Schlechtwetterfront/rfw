<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { TextApp } from './text';
import { Rect, WGLDriver } from '../../src';

const canvas = ref<HTMLCanvasElement>();

let app: TextApp | undefined;

watchEffect(async () => {
    const c = canvas.value

    if (!c) {
        return;
    }

    const driver = await WGLDriver.fromCanvas(c);

    app = new TextApp(c, driver);

    await app.initializeAndStart();
})
</script>

# On Drawing

`rfw` comes with a MSDF text renderer. See the [guide on text](/guide/text).

<section>
    <canvas class="sample-canvas" ref="canvas" tabindex="0"></canvas>
</section>

::: details Code

<<< ./text.ts

:::

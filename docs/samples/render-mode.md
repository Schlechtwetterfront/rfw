# Quad Tree

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { RenderModeApp } from '../../samples/renderMode/render-mode';
import { Rect, WGLDriver } from '../../src';

const canvas = ref<HTMLCanvasElement>();
const diag = ref<HTMLElement>();

const count = ref(100);

let app: RenderModeApp | undefined;

watchEffect(async () => {
    const c = canvas.value
    const d = diag.value

    if (!c || !d) {
        return;
    }

    const driver = await WGLDriver.fromCanvas(c);

    app = new RenderModeApp(new Rect(-300, -150, 600, 300), false, c, driver);
    app.addDiagTicker(d)

    await app.initializeAndStart();
})

function add() {
    app?.addMultiple(count.value)
}

function toggle() {
    app.renderMode = app.renderMode === 'always' ? 'onChange' : 'always'
}
</script>

Using change-tracking, only render when something in the scene was changed.

Hover over the rectangles to trigger a change and thus a re-render.

<section ref="diag"></section>

<section>
    <canvas class="sample-canvas" ref="canvas" tabindex="0"></canvas>
</section>

<section class="sample-controls">
    <input type="text" placeholder="#" v-model="count" min="1">
    <button @click="add">Add rects</button>
    &ndash;
    <button @click="toggle">Toggle render mode</button>
</section>

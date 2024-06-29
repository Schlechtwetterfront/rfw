# Quad Tree

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { QuadTreeApp } from '../../samples/quadtree/quadtree';
import { Rect, WGLDriver } from '../../src';

const canvas = ref<HTMLCanvasElement>();
const diag = ref<HTMLElement>();

const count = ref(100);

let app: QuadTreeApp | undefined;

watchEffect(async () => {
    const c = canvas.value
    const d = diag.value

    if (!c || !d) {
        return;
    }

    const driver = await WGLDriver.fromCanvas(c);

    app = new QuadTreeApp(new Rect(-300, -150, 600, 300), false, c, driver);
    app.addDiagTicker(d)

    await app.initializeAndStart();
})

function add() {
    app?.addRects(count.value)
}
</script>

Showcases quad tree. Use <kbd>CTRL+Click</kbd> to add a rect, <kbd>ALT+Click</kbd> to remove all intersecting.

<section ref="diag"></section>

<section>
    <canvas class="sample-canvas" ref="canvas" tabindex="0"></canvas>
</section>

<section class="sample-controls">
    <input type="text" placeholder="#" :value="count" min="1">
    <button @click="add">Add rects</button>
</section>

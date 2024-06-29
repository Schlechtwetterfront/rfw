# Bunnymark

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { BunnyMarkApp } from '../../samples/bunnymark/bunnymark';
import { Rect, WGLDriver } from '../../src';

const canvas = ref<HTMLCanvasElement>();
const diag = ref<HTMLElement>();

const count = ref(1000);

let app: BunnyMarkApp | undefined;

watchEffect(async () => {
    const c = canvas.value
    const d = diag.value

    if (!c || !d) {
        return;
    }

    const driver = await WGLDriver.fromCanvas(c);

    app = new BunnyMarkApp(new Rect(-300, -150, 600, 300), c, driver);
    app.addDiagTicker(d)

    await app.initializeAndStart();
})

function add() {
    app?.addBunnies(count.value)
}
</script>

Benchmark inspired by similar benchmarks in e.g., pixi.js. Add some bunnies via the controls.

<section ref="diag"></section>

<section>
    <canvas class="sample-canvas" ref="canvas" tabindex="0"></canvas>
</section>

<section class="sample-controls">
    <input type="text" placeholder="#" :value="count" min="1">
    <button @click="add">Add bunnies</button>
</section>

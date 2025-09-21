# Bunnymark (sprites)

<script setup lang="ts">
import { ref, watchEffect, onUnmounted } from 'vue';
import { SpriteBunnyMarkApp } from './bunnymark-sprites';
import { WGLDriver } from '../../src';

const canvas = ref<HTMLCanvasElement>();
const diag = ref<HTMLElement>();

const count = ref(1000);

let app: SpriteBunnyMarkApp | undefined;

watchEffect(async () => {
    const c = canvas.value
  const d = diag.value

    if (!c || !d) {
        return;
    }

    const driver = await WGLDriver.fromCanvas(c);

    app = new SpriteBunnyMarkApp(c, driver);
     app.addDiagTicker(d)

    await app.initializeAndStart();
})

onUnmounted(() => app?.stop());

function add() {
    app?.addBunnies(count.value)
}
</script>

Benchmark inspired by similar benchmarks in e.g., pixi.js. Instead of the generic batched mesh
renderer which has to prepare and upload much more data per vertex this uses a sprite renderer
which for this use-case is a lot more efficient.

Add some bunnies via the controls.

<section ref="diag"></section>

<section>
    <canvas class="sample-canvas" ref="canvas" tabindex="0"></canvas>
</section>

<section class="sample-controls">
    <input type="text" placeholder="#" v-model="count" min="1">
    <button @click="add">Add bunnies</button>
</section>

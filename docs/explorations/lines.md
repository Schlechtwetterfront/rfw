# Line Drawing

<script setup lang="ts">
import { reactive, ref, watch, watchEffect } from 'vue';
import { VPButton } from 'vitepress/theme';
import { LinesApp } from './lines-app';
import { draw } from './lines-canvas';
import { vec, WGLDriver } from '../../src';

const state = reactive({
    beforeStart: vec(10, 180),
    start: vec(120, 80),
    end: vec(350, 80),
    afterEnd: vec(500, 150),
    position: vec(1, 0.5),
    alignment: 0.5,
    thickness: 50,
});

const canvas = ref<HTMLCanvasElement>();

let context: CanvasRenderingContext2D |undefined;

watchEffect(() => {
    const c = canvas.value

    if (!c) {
        context = undefined;

        return;
    }

    if (!context)
    {
        context = c.getContext('2d');
    }

    draw(context, [state.beforeStart, state.start, state.end, state.afterEnd], state.position, state.alignment, state.thickness);
})

const canvas2 = ref<HTMLCanvasElement>();

let app: LinesApp | undefined;

watch([canvas2, state], async () => {
    const c = canvas2.value

    if (!c) {
        return;
    }

    if (!app)
    {
        const driver = await WGLDriver.fromCanvas(c);

        app = new LinesApp(c, driver);

        await app.initializeAndStart();
    }

    console.log('setting')

    app.set([state.beforeStart, state.start, state.end, state.afterEnd], state.alignment, state.thickness);
})

</script>

<section class="line-controls">
<div>
<label>
Before start - X
<input type="number" v-model="state.beforeStart.x">
</label>

<label>
Before start - Y
<input type="number" v-model="state.beforeStart.y">
</label>
</div>

<div>
<label>
Start - X
<input type="number" v-model="state.start.x">
</label>

<label>
Start - Y
<input type="number" v-model="state.start.y">
</label>
</div>

<div>
<label>
End - X
<input type="number" v-model="state.end.x">
</label>

<label>
End - Y
<input type="number" v-model="state.end.y">
</label>
</div>

<div>
<label>
After end - X
<input type="number" v-model="state.afterEnd.x">
</label>

<label>
After end - Y
<input type="number" v-model="state.afterEnd.y">
</label>
</div>

<div>
<label>
Position - X
<input type="number" v-model="state.position.x">
</label>

<label>
Position - Y
<input type="number" v-model="state.position.y">
</label>
</div>

<div>
<label>
Alignment
<input type="number" v-model="state.alignment">
</label>

<label>
Thickness
<input type="number" v-model="state.thickness">
</label>
</div>

</section>

<section>
    <canvas class="sample-canvas" ref="canvas" tabindex="0" width="688" height="344"></canvas>
</section>

<section>
    <canvas class="sample-canvas" ref="canvas2" tabindex="0" width="688" height="344"></canvas>
</section>

<style>
.line-controls {
    display: flex;

    flex-flow: row wrap;

    gap: 16px;

    input {
        width: 160px;
    }

    div {
        display: flex;

        flex-flow: row nowrap;

        gap: 4px;
    }
}
</style>

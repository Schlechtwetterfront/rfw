<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { BENCHES, Bench, BenchItem } from './benches';
import { timeoutPromise } from './util';

interface BenchItemResult {
    average: number;
    item: BenchItem;
    relative: number;
}

const iterations = ref(10);
const running = ref<Bench>();
const last = ref<Bench>();
const results = ref<BenchItemResult[]>([]);

function sortResults() {
    results.value.sort((a, b) => a.average - b.average);

    const baseline = results.value.find(i => i.item.baseline)?.average;

    if (baseline !== undefined) {
        results.value.forEach(i => (i.relative = i.average / baseline));
    }
}

async function run(bench: Bench) {
    if (running.value) {
        return;
    }

    running.value = bench;
    last.value = bench;
    results.value.length = 0;

    await timeoutPromise()

    for (const item of bench.items) {
        // Warmup
        item.fn();

        let total = 0;

        for (let i = 0; i < iterations.value; i++) {
            const timing = item.fn();

            total += timing;
        }

        results.value.push({
            item,
            average: total / iterations.value,
            relative: 1,
        });

        sortResults();

        await timeoutPromise();
    }

    running.value = undefined;
}
</script>

<template>
    <h1>Benchmarks</h1>

    <input type="text" pattern="[0-9]+" v-model.number="iterations" />

    <ul>
        <li v-for="bench in BENCHES" :key="bench.label">
            {{ bench.label }}
            <button @click="run(bench)">Run</button>
        </li>
    </ul>

    <section v-if="last">
        <h2>Benchmark &mdash; {{ last.label }}</h2>

        <h3>Results <span v-if="running">(Running...)</span></h3>
        <table>
            <tr>
                <th>Label</th>
                <th class="cell--number">Elapsed [ms]</th>
                <th class="cell--number">Relative</th>
            </tr>
            <tr v-for="result in results" :key="result.item.label">
                <td>
                    {{ result.item.label }}
                </td>
                <td class="cell--number">
                    {{ result.average.toFixed(3) }}
                </td>
                <td class="cell--number">
                    {{ result.relative.toFixed(2) }}
                </td>
            </tr>
        </table>
    </section>
</template>

<style>
body {
    font-family: sans-serif;
    font-size: 16px;
}

th,
td {
    text-align: left;
}

.cell--number {
    text-align: right;
}
</style>

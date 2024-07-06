<script setup lang="ts">
import { VPButton } from 'vitepress/theme';
import { computed, ref } from 'vue';
import { Bench, BenchItem, timeoutPromise } from './bench';

const props = defineProps<{
    bench: Bench;
}>();

interface BenchItemResult {
    average: number;
    item: BenchItem;
    relative: number;
}

const iterations = ref(100);
const running = ref(false);
const results = ref<BenchItemResult[]>([]);

async function run() {
    if (running.value) {
        return;
    }

    running.value = true;
    results.value = [];

    await timeoutPromise();

    for (const item of props.bench.items) {
        // Warmup
        item.fn();

        const iterationCount = iterations.value;

        let total = 0;

        for (let i = 0; i < iterationCount; i++) {
            const timing = item.fn();

            total += timing;
        }

        results.value.push({
            item,
            average: total / iterations.value,
            relative: 1,
        });

        await timeoutPromise();
    }

    running.value = false;
}

const table = computed(() => {
    const benchItems = props.bench.items;

    const vms = [];

    for (const item of benchItems) {
        const result = results.value.find(r => r.item.label === item.label);

        vms.push({ item, result });
    }

    vms.sort((a, b) => (a.result?.average ?? 0) - (b.result?.average ?? 0));

    const baselineAverage =
        vms.find(i => i.item.baseline)?.result?.average ?? 0;

    if (baselineAverage !== undefined) {
        vms.forEach(i => {
            if (!i.result) {
                return;
            }

            i.result.relative = i.result.average / baselineAverage;
        });
    }

    return vms;
});
</script>

<template>
    <h4>Benchmark Options</h4>

    <section class="controls">
        <label>
            Iterations
            <input type="number" v-model="iterations" />
        </label>

        <VPButton @click="run()" text="Run"></VPButton>
    </section>

    <h4>Results <span v-if="running">&mdash; Running...</span></h4>

    <table>
        <thead>
            <tr>
                <th>Label</th>
                <th class="cell--number">Elapsed [ms]</th>
                <th class="cell--number">Relative</th>
            </tr>
        </thead>

        <tbody>
            <tr v-for="row in table" :key="row.item.label">
                <td>
                    {{ row.item.label }}
                </td>
                <td class="cell--number">
                    {{ row.result?.average.toFixed(3) }}
                </td>
                <td class="cell--number">
                    {{ row.result?.relative.toFixed(2) }}
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped>
.controls {
    display: flex;
    flex-flow: row wrap;
    align-items: end;

    gap: 16px;
}

th,
td {
    text-align: left;
}

.cell--number {
    text-align: right;
}

h4 {
    margin-top: 32px;
    margin-bottom: 12px;
}
</style>

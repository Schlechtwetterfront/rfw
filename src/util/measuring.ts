const PERFORMANCE = performance;

const ENABLE_PERFORMANCE = true;

export class Sampler {
    private readonly samples: number[] = [];

    private _total = 0;

    get total() {
        return this._total;
    }

    get average() {
        const samples = this.samples.length;

        return samples ? this._total / samples : 0;
    }

    get collectedSamples() {
        return this.samples.length;
    }

    get last() {
        return this.samples.at(-1);
    }

    constructor(
        public readonly name: string,
        public readonly maxSamples = 128,
    ) {}

    addSample(count: number): void {
        let outgoingSample = 0;

        if (this.samples.length === this.maxSamples) {
            outgoingSample = this.samples[0]!;

            this.samples.copyWithin(0, 1);

            this.samples[this.maxSamples - 1] = count;
        } else {
            this.samples.push(count);
        }

        this._total = this._total + count - outgoingSample;
    }
}

export class MarkTimeSampler extends Sampler {
    private started = false;

    get perSecond() {
        return 1000 / this.average;
    }

    start(): void {
        if (!ENABLE_PERFORMANCE) {
            return;
        }

        PERFORMANCE.mark(this.name);

        this.started = true;
    }

    finish(): void {
        if (!ENABLE_PERFORMANCE) {
            return;
        }

        if (!this.started) {
            return;
        }

        const measure = PERFORMANCE.measure(this.name, this.name);

        this.addSample(measure.duration);
    }
}

export class TimeSampler extends Sampler {
    private startTimestamp?: number;

    get perSecond() {
        return 1000 / this.average;
    }

    start(): void {
        if (!ENABLE_PERFORMANCE) {
            return;
        }

        this.startTimestamp = PERFORMANCE.now();
    }

    finish(): void {
        if (!ENABLE_PERFORMANCE) {
            return;
        }

        if (this.startTimestamp === undefined) {
            return;
        }

        const duration = PERFORMANCE.now() - this.startTimestamp;

        this.addSample(duration);

        this.startTimestamp = undefined;
    }
}

export class CountedSampler extends Sampler {
    current = 0;

    count(by = 1): void {
        this.current += by;
    }

    finish(): void {
        this.addSample(this.current);
        this.current = 0;
    }
}

/**
 * Object containg different formats of the elapsed time since the last tick.
 */
export interface Elapsed {
    /** Elapsed time in seconds. */
    elapsedSeconds: number;
    /** Elapsed time in milliseconds */
    elapsedMilliseconds: number;
}

const TEMP_ELAPSED = {
    elapsedSeconds: 0,
    elapsedMilliseconds: 0,
} satisfies Elapsed;

export type TickHandler = (elapsed: Elapsed) => void;

export class TickerHandle {}

class Ticker {
    constructor(
        public readonly interval: number,
        public handler: TickHandler,
        public lastTick?: number,
    ) {}
}

export type MillisecondInterval = number;
export type FPSInterval = `${number}fps`;
export type HertzInterval = `${number}hz`;

export type Interval =
    | MillisecondInterval
    | 'animationFrame'
    | 'max'
    | FPSInterval
    | HertzInterval;

/**
 * Parse a ticker interval into a millisecond number.
 * @param interval - Interval
 * @returns Milliseconds
 */
export function parseInterval(interval: Interval | undefined): number {
    if (typeof interval === 'number') {
        return Math.max(0, interval);
    } else if (interval === 'animationFrame' || interval === 'max') {
        return 0;
    } else if (typeof interval === 'string' && interval.endsWith('fps')) {
        return 1_000 / parseInt(interval.slice(0, -3));
    } else if (typeof interval === 'string' && interval.endsWith('hz')) {
        return 1_000 / parseInt(interval.slice(0, -2));
    }

    return 1_000 / 60;
}

/**
 * Manages tickers. Tickers are executed periodically.
 */
export class Tickers {
    private tickers = new Map<TickerHandle, Ticker>();

    /**
     * Construct a new {@link Tickers}
     * @param epsilon - Optional, epsilon to use when comparing elapsed times with intervals
     */
    constructor(private readonly epsilon = 0.1) {}

    /**
     * Step all tickers by the delta of the last tick to `timestamp`.
     * @param timestamp - Timestamp
     */
    tick(timestamp: number): void {
        for (const ticker of this.tickers.values()) {
            if (!ticker.lastTick) {
                TEMP_ELAPSED.elapsedSeconds = 0;
                TEMP_ELAPSED.elapsedMilliseconds = 0;

                ticker.handler(TEMP_ELAPSED);

                ticker.lastTick = timestamp;
                continue;
            }

            const elapsed = timestamp - ticker.lastTick;

            const diff = Math.abs(elapsed - ticker.interval);

            if (diff < this.epsilon || elapsed >= ticker.interval) {
                TEMP_ELAPSED.elapsedSeconds = elapsed / 1000;
                TEMP_ELAPSED.elapsedMilliseconds = elapsed;

                ticker.handler(TEMP_ELAPSED);

                ticker.lastTick = timestamp;
            }
        }
    }

    /**
     * Add a new ticker.
     * @param handler - Handler to execute every interval
     * @param interval - Optional, interval. Default is a 60hz ticker
     * @returns A handle to the ticker
     */
    add(handler: TickHandler, interval?: Interval): TickerHandle {
        const intervalInMS = parseInterval(interval);

        const ticker = new Ticker(intervalInMS, handler);

        const handle = new TickerHandle();

        this.tickers.set(handle, ticker);

        return handle;
    }

    /**
     * Delete a ticker via its handle.
     * @param handle - Handle
     * @returns `true` if a ticker was removed
     */
    delete(handle: TickerHandle): boolean {
        return this.tickers.delete(handle);
    }

    /**
     * Delete a ticker via its handler.
     * @param handler - Handler
     */
    deleteByHandler(handler: TickHandler): void {
        const filtered = new Map<TickerHandle, Ticker>();

        for (const [handle, ticker] of this.tickers) {
            if (ticker.handler === handler) {
                continue;
            }

            filtered.set(handle, ticker);
        }

        this.tickers = filtered;
    }

    /**
     * Remove all tickers.
     */
    clear(): void {
        this.tickers.clear();
    }
}

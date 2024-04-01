/**
 * Object pool.
 */
export class Pool<O> {
    private readonly ctor: () => O;
    private readonly reset?: (o: O) => void;
    private readonly maxSize?: number;
    private readonly objects: O[] = [];

    /**
     * Create a new pool.
     * @param options - Pool creation options
     * - `create`: Function to create a pool entry
     * - `reset`: Optional function that resets an entry when it is returned to the pool
     * - `maxSize`: If this size is exceeded, objects returned to the pool will be discarded
     */
    constructor(options: {
        create: () => O;
        reset?: (o: O) => void;
        maxSize?: number;
    }) {
        this.ctor = options.create;
        this.reset = options?.reset;
        this.maxSize = options?.maxSize;
    }

    /**
     * Take an object out of the pool. If the pool is empty, an object will be created.
     * @returns Pool object
     */
    take(): O {
        return this.objects.pop() ?? this.ctor();
    }

    /**
     * Return an object to the pool. If the pool's max size is reached, the object will be discarded.
     * @param o - Object to return
     */
    return(o: O): void {
        if (
            typeof this.maxSize === 'number' &&
            this.objects.length === this.maxSize
        ) {
            return;
        }

        this.reset?.(o);

        this.objects.push(o);
    }
}

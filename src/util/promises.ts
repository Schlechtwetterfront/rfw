/** @category Utility */
export class ManualPromise<T = void> {
    private _resolve!: (v: T) => void;
    private promise!: Promise<T>;

    get current() {
        return this.promise;
    }

    constructor() {
        this.reset();
    }

    resolve(value: T): void {
        this._resolve(value);
    }

    reset(): void {
        this.promise = new Promise<T>(resolve => (this._resolve = resolve));
    }
}

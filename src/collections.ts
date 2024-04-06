/**
 * A set-like structure.
 */
export interface ObjectSet<O> {
    add(o: O): this;
    has(o: O): boolean;
    delete(o: O): boolean;
    clear(): void;
}

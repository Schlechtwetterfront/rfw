import { Vec2Like } from '../math';
import { ReadOnlyRect, Rect, RectLike } from '../math/shapes';
import { Pool } from './pool';

/**
 * Quad tree entry interface.
 */
export interface QuadTreeEntry {
    /**
     * Check if the shape of the entry contains `point`.
     * @param point - Point to check
     * @returns `true` if entry contains `point`
     */
    contains(point: Vec2Like): boolean;

    /**
     * Check if the shape of this entry intersects `rect`.
     * @param rect - Rectangle to check
     * @returns `true` if the entry intersects with `rect`
     */
    intersects(rect: RectLike): boolean;
}

/**
 * Quad tree.
 *
 * Entries must implement the {@link QuadTreeEntry} interface.
 */
export class QuadTree<E extends QuadTreeEntry> {
    private readonly quadPool = new Pool({
        create: () => new _Quad<E>(),
        reset: q => {
            q.entries.length = 0;
            q.subdivided = false;
        },
    });
    private readonly root: _Quad<E>;

    private _size = 0;

    /**
     * Number of entries in the quad tree.
     */
    get size() {
        return this._size;
    }

    /** Quad tree bounds. */
    readonly bounds: ReadOnlyRect;

    /**
     * Construct a new quad tree.
     * @param bounds - Overall bounds of the quad tree
     * @param maxEntriesPerQuad - Max entries a quad can contain until it has to be subdivided
     * @param maxDepth - Max subdivision depth. A quad will not be subdivided further if this value
     * is met - even if `maxEntriesPerQuad` is exceeded
     */
    constructor(
        bounds: RectLike,
        private readonly maxEntriesPerQuad = 64,
        private readonly maxDepth = 4,
    ) {
        this.bounds = Rect.from(bounds);
        this.root = new _Quad(this.bounds.clone(), 0);
    }

    /**
     * Try to add an entry to the quad tree.
     * @param entry - Entry to add
     * @returns `true` if the entry was added, `false` if the entry was outside quad tree bounds
     */
    add(entry: E): boolean {
        if (this.tryAdd(this.root, entry)) {
            this._size++;

            return true;
        }

        return false;
    }

    private tryAdd(quad: _Quad<E>, entry: E): boolean {
        if (!entry.intersects(quad.bounds)) {
            return false;
        }

        const subdivide =
            quad.entries.length === this.maxEntriesPerQuad &&
            quad.depth < this.maxDepth;

        if (subdivide && !quad.subdivided) {
            this.subdivide(quad);
        }

        if (quad.isSubdivided()) {
            let added = false;

            if (this.tryAdd(quad.topLeft, entry)) {
                added = true;
            }

            if (this.tryAdd(quad.topRight, entry)) {
                added = true;
            }

            if (this.tryAdd(quad.bottomLeft, entry)) {
                added = true;
            }

            if (this.tryAdd(quad.bottomRight, entry)) {
                added = true;
            }

            return added;
        }

        quad.entries.push(entry);

        return true;
    }

    /**
     * Delete an entry from the quad tree
     * @param entry - Entry to delete (via reference comparison)
     * @param merge - If `true`, try to merge quads after the deletion
     * @returns `true` if `entry` was deleted
     */
    delete(entry: E, merge = false): boolean {
        if (this.tryDelete(this.root, entry, merge)) {
            this._size--;

            return true;
        }

        return false;
    }

    private tryDelete(quad: _Quad<E>, entry: E, merge: boolean) {
        if (quad.isSubdivided()) {
            let deleted = false;

            if (this.tryDelete(quad.topLeft, entry, merge)) {
                deleted = true;
            }
            if (this.tryDelete(quad.topRight, entry, merge)) {
                deleted = true;
            }
            if (this.tryDelete(quad.bottomLeft, entry, merge)) {
                deleted = true;
            }
            if (this.tryDelete(quad.bottomRight, entry, merge)) {
                deleted = true;
            }

            if (deleted && merge) {
                this.tryMerge(quad);
            }

            return deleted;
        }

        const index = quad.entries.indexOf(entry);

        if (index > -1) {
            quad.entries.splice(index, 1);

            if (merge) {
                this.tryMerge(quad);
            }

            return true;
        }

        return false;
    }

    /**
     * Clear the quad tree.
     */
    clear(): void {
        const { root } = this;

        root.entries.length = 0;

        root.subdivided = false;

        root.topLeft = undefined;
        root.topRight = undefined;
        root.bottomLeft = undefined;
        root.bottomRight = undefined;

        this._size = 0;
    }

    /**
     * Merge subdivided quads that fall below the max entry value.
     */
    merge(): void {
        return this.tryMerge(this.root);
    }

    private tryMerge(quad: _Quad<E>) {
        if (!quad.isSubdivided()) {
            return;
        }

        this.tryMerge(quad.topLeft);
        this.tryMerge(quad.topRight);
        this.tryMerge(quad.bottomLeft);
        this.tryMerge(quad.bottomRight);

        const entryCount =
            quad.topLeft.entries.length +
            quad.topRight.entries.length +
            quad.bottomLeft.entries.length +
            quad.bottomRight.entries.length;

        if (entryCount <= this.maxEntriesPerQuad) {
            quad.entries = [
                ...quad.topLeft.entries,
                ...quad.topRight.entries,
                ...quad.bottomLeft.entries,
                ...quad.bottomRight.entries,
            ];

            const mergedQuad = quad as _Quad<E>;

            mergedQuad.subdivided = false;

            this.quadPool.return(quad.topLeft);
            this.quadPool.return(quad.topRight);
            this.quadPool.return(quad.bottomLeft);
            this.quadPool.return(quad.bottomRight);

            mergedQuad.topLeft = undefined;
            mergedQuad.topRight = undefined;
            mergedQuad.bottomLeft = undefined;
            mergedQuad.bottomRight = undefined;
        }
    }

    /**
     * Get all entries that overlap `point`.
     * @param point - Point to check overlaps against
     * @param results - Optional `Set` to put results into. Will allocate a new `Set` otherwise
     * @returns A `Set` containing all overlapping entries
     */
    overlaps(point: Vec2Like, results?: Set<E>): Set<E> {
        results ??= new Set();

        this.getOverlaps(this.root, point, results);

        return results;
    }

    private getOverlaps(quad: _Quad<E>, point: Vec2Like, results: Set<E>) {
        if (!quad.bounds.contains(point)) {
            return;
        }

        if (quad.isSubdivided()) {
            this.getOverlaps(quad.topLeft, point, results);
            this.getOverlaps(quad.topRight, point, results);
            this.getOverlaps(quad.bottomLeft, point, results);
            this.getOverlaps(quad.bottomRight, point, results);

            return;
        }

        const entryCount = quad.entries.length;

        for (let i = 0; i < entryCount; i++) {
            const entry = quad.entries[i]!;

            if (entry.contains(point)) {
                results.add(entry);
            }
        }
    }

    /**
     * Get all entries that intersect `rect`.
     * @param rect - Rect to intersect with
     * @param results - Optional `Set` to put results into. Will allocate a new `Set` otherwise
     * @returns A `Set` containing all intersecting entries
     */
    intersections(rect: RectLike, results?: Set<E>): Set<E> {
        results ??= new Set();

        this.getIntersections(this.root, rect, results);

        return results;
    }

    private getIntersections(quad: _Quad<E>, rect: RectLike, results: Set<E>) {
        if (!quad.bounds.intersects(rect)) {
            return;
        }

        if (quad.isSubdivided()) {
            this.getIntersections(quad.topLeft, rect, results);
            this.getIntersections(quad.topRight, rect, results);
            this.getIntersections(quad.bottomLeft, rect, results);
            this.getIntersections(quad.bottomRight, rect, results);

            return;
        }

        const entryCount = quad.entries.length;

        for (let i = 0; i < entryCount; i++) {
            const entry = quad.entries[i]!;

            if (entry.intersects(rect)) {
                results.add(entry);
            }
        }
    }

    /**
     * Get all entries that match the predicate.
     * @param predicate - Entry predicate
     * @param intersects - Optional predicate to pre-filter entries. Will be called with quad bounds
     * @param results - Optional `Set` to put results into. Will allocate a new `Set` otherwise
     * @returns A `Set` containing all matched entries
     */
    find(
        predicate: (entry: E) => boolean,
        intersects?: (rect: ReadOnlyRect) => boolean,
        results?: Set<E>,
    ): Set<E> {
        results ??= new Set();

        this._find(this.root, predicate, intersects, results);

        return results;
    }

    private _find(
        quad: _Quad<E>,
        predicate: (entry: E) => boolean,
        intersects: ((rect: ReadOnlyRect) => boolean) | undefined,
        results: Set<E>,
    ) {
        if (intersects?.(quad.bounds) === false) {
            return;
        }

        if (quad.isSubdivided()) {
            this._find(quad.topLeft, predicate, intersects, results);
            this._find(quad.topRight, predicate, intersects, results);
            this._find(quad.bottomLeft, predicate, intersects, results);
            this._find(quad.bottomRight, predicate, intersects, results);

            return;
        }

        const entryCount = quad.entries.length;

        for (let i = 0; i < entryCount; i++) {
            const entry = quad.entries[i]!;

            if (predicate(entry)) {
                results.add(entry);
            }
        }
    }

    /**
     * Get an iterator of all {@link Quad | quads} in the quad tree.
     */
    *quads(): Generator<Quad> {
        yield* this._quads(this.root);
    }

    private *_quads(quad: _Quad<E>): Generator<Quad> {
        yield quad;

        if (!quad.isSubdivided()) {
            return;
        }

        yield* this._quads(quad.topLeft);
        yield* this._quads(quad.topRight);
        yield* this._quads(quad.bottomLeft);
        yield* this._quads(quad.bottomRight);
    }

    private subdivide(quad: _Quad<E>): void {
        if (quad.isSubdivided()) {
            throw new Error('Quad already subdivided');
        }

        if (quad.depth === this.maxDepth) {
            throw new Error(`Quad at max depth (${quad.depth})`);
        }

        const { x, y, width, height } = quad.bounds;
        const halfWidth = width / 2;
        const halfHeight = height / 2;

        const newDepth = quad.depth + 1;

        quad.topLeft = this.quadPool.take();
        quad.topLeft.bounds.set(x, y, halfWidth, halfHeight);
        quad.topLeft.depth = newDepth;

        quad.topRight = this.quadPool.take();
        quad.topRight.bounds.set(x + halfWidth, y, halfWidth, halfHeight);
        quad.topRight.depth = newDepth;

        quad.bottomLeft = this.quadPool.take();
        quad.bottomLeft.bounds.set(x, y + halfHeight, halfWidth, halfHeight);
        quad.bottomLeft.depth = newDepth;

        quad.bottomRight = this.quadPool.take();
        quad.bottomRight.bounds.set(
            x + halfWidth,
            y + halfHeight,
            halfWidth,
            halfHeight,
        );
        quad.bottomRight.depth = newDepth;

        quad.subdivided = true;

        const entryCount = quad.entries.length;

        for (let i = 0; i < entryCount; i++) {
            const entry = quad.entries[i]!;

            this.tryAdd(quad.topLeft, entry);
            this.tryAdd(quad.topRight, entry);
            this.tryAdd(quad.bottomLeft, entry);
            this.tryAdd(quad.bottomRight, entry);
        }

        quad.entries.length = 0;
    }
}

/**
 * A quad in the {@link QuadTree}.
 */
export interface Quad {
    readonly topLeft?: Quad;
    readonly topRight?: Quad;
    readonly bottomLeft?: Quad;
    readonly bottomRight?: Quad;

    readonly bounds: ReadOnlyRect;
    readonly depth: number;

    readonly entryCount: number;

    isSubdivided(): this is SubdividedQuad;
}

/**
 * A subidivided quad in the {@link QuadTree}.
 */
export interface SubdividedQuad {
    readonly topLeft: Quad;
    readonly topRight: Quad;
    readonly bottomLeft: Quad;
    readonly bottomRight: Quad;

    readonly bounds: ReadOnlyRect;
    readonly depth: number;

    readonly entryCount: number;

    isSubdivided(): boolean;
}

class _Quad<E extends QuadTreeEntry> implements Quad {
    topLeft?: _Quad<E>;
    topRight?: _Quad<E>;
    bottomLeft?: _Quad<E>;
    bottomRight?: _Quad<E>;

    subdivided = false;

    entries: E[] = [];

    get entryCount() {
        return this.entries.length;
    }

    constructor(
        public readonly bounds: Rect = Rect.ZERO,
        public depth: number = 0,
    ) {}

    isSubdivided(): this is SubdividedQuad {
        return this.subdivided;
    }
}

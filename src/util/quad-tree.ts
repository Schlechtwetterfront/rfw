import { ReadonlyRect, Rect, RectLike } from '../math/shapes';
import { ArraySet } from './array-set';
import { swapDeleteAt } from './collections';
import { Pool } from './pool';

/**
 * Quad tree entry interface.
 *
 * @category Utility
 */
export interface QuadTreeEntry {
    /**
     * Check if the shape of this entry intersects `rect`.
     * @param rect - Rectangle to check
     * @returns `true` if the entry intersects with `rect`
     */
    intersectsRect(rect: RectLike): boolean;
}

enum QuadTreeUpdate {
    NotPresent,
    Present,
    Deleted,
    Added,
}

const TEMP_MERGE_ARRAY: unknown[] = [];
const TEMP_MERGE_SET = new Set<unknown>();

/**
 * Quad tree.
 *
 * Entries must implement the {@link QuadTreeEntry} interface.
 *
 * @category Utility
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
    readonly bounds: ReadonlyRect;

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
        if (!entry.intersectsRect(quad.bounds)) {
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
     * Update an entry in the tree after it was transformed. Entry may be added to the tree if it
     * was not present before. It may also be deleted even if it was present if the new shape is
     * outside the quad tree's bounds.
     * @param entry - Entry to update
     * @param merge - If `true`, try to merge quads after the deletion
     * @returns `true` if the entry is present after this operation
     *
     * @remarks
     * Combines both {@link QuadTree#add} and {@link QuadTree#delete} into one operation which
     * removes the need to traverse part of the tree again in {@link QuadTree#add}.
     */
    update(entry: E, merge = false): boolean {
        const update = this._update(this.root, entry, true, merge);

        if (update === QuadTreeUpdate.Added) {
            this._size++;
        } else if (update === QuadTreeUpdate.Deleted) {
            this._size--;
        }

        return update === QuadTreeUpdate.Present ||
            update === QuadTreeUpdate.Added
            ? true
            : false;
    }

    private _update(
        quad: _Quad<E>,
        entry: E,
        checkAdd: boolean,
        merge: boolean,
    ): QuadTreeUpdate {
        let addCandidate = false;

        if (checkAdd) {
            addCandidate = entry.intersectsRect(quad.bounds);
        }

        if (quad.isSubdivided()) {
            let deleted = false;
            let present = false;
            let added = false;

            const updateTopLeft = this._update(
                quad.topLeft,
                entry,
                addCandidate,
                merge,
            );
            deleted = deleted || updateTopLeft === QuadTreeUpdate.Deleted;
            present = present || updateTopLeft === QuadTreeUpdate.Present;
            added = added || updateTopLeft === QuadTreeUpdate.Added;

            const updateTopRight = this._update(
                quad.topRight,
                entry,
                addCandidate,
                merge,
            );
            deleted = deleted || updateTopRight === QuadTreeUpdate.Deleted;
            present = present || updateTopRight === QuadTreeUpdate.Present;
            added = added || updateTopRight === QuadTreeUpdate.Added;

            const updateBottomLeft = this._update(
                quad.bottomLeft,
                entry,
                addCandidate,
                merge,
            );
            deleted = deleted || updateBottomLeft === QuadTreeUpdate.Deleted;
            present = present || updateBottomLeft === QuadTreeUpdate.Present;
            added = added || updateBottomLeft === QuadTreeUpdate.Added;

            const updateBottomRight = this._update(
                quad.bottomRight,
                entry,
                addCandidate,
                merge,
            );
            deleted = deleted || updateBottomRight === QuadTreeUpdate.Deleted;
            present = present || updateBottomRight === QuadTreeUpdate.Present;
            added = added || updateBottomRight === QuadTreeUpdate.Added;

            if (deleted && merge) {
                this.tryMerge(quad);
            }

            return added
                ? QuadTreeUpdate.Added
                : present
                  ? QuadTreeUpdate.Present
                  : deleted
                    ? QuadTreeUpdate.Deleted
                    : QuadTreeUpdate.NotPresent;
        }

        const index = quad.entries.indexOf(entry);

        if (!addCandidate && index > -1) {
            swapDeleteAt(quad.entries, index);

            if (merge) {
                this.tryMerge(quad);
            }

            return QuadTreeUpdate.Deleted;
        }

        if (addCandidate && index < 0) {
            quad.entries.push(entry);

            return QuadTreeUpdate.Added;
        }

        return index > -1 ? QuadTreeUpdate.Present : QuadTreeUpdate.NotPresent;
    }

    /**
     * Delete an entry from the quad tree.
     * @param entry - Entry to delete (via reference comparison)
     * @param merge - If `true`, try to merge quads after the deletion
     * @returns `true` if `entry` was deleted
     *
     * @remarks
     * Traverses the whole tree to ensure the entry is deleted. If the entry's position and size has
     * not changed, use {@link QuadTree#deleteSpatial} for a delete that uses the quad tree's fast
     * spatial query.
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
            swapDeleteAt(quad.entries, index);

            if (merge) {
                this.tryMerge(quad);
            }

            return true;
        }

        return false;
    }

    /**
     * Delete an entry from the quad tree.
     * @param entry - Entry to delete (via reference comparison)
     * @param merge - If `true`, try to merge quads after the deletion
     * @returns `true` if `entry` was deleted
     *
     * @remarks
     * If the entry's position or shape has changed, use {@link QuadTree#delete} to ensure its deletion.
     */
    deleteSpatial(entry: E, merge = false): boolean {
        if (this.tryDeleteSpatial(this.root, entry, merge)) {
            this._size--;

            return true;
        }

        return false;
    }

    private tryDeleteSpatial(quad: _Quad<E>, entry: E, merge: boolean) {
        if (!entry.intersectsRect(quad.bounds)) {
            return false;
        }

        if (quad.isSubdivided()) {
            let deleted = false;

            if (this.tryDeleteSpatial(quad.topLeft, entry, merge)) {
                deleted = true;
            }

            if (this.tryDeleteSpatial(quad.topRight, entry, merge)) {
                deleted = true;
            }

            if (this.tryDeleteSpatial(quad.bottomLeft, entry, merge)) {
                deleted = true;
            }

            if (this.tryDeleteSpatial(quad.bottomRight, entry, merge)) {
                deleted = true;
            }

            if (deleted && merge) {
                this.tryMerge(quad);
            }

            return deleted;
        }

        const index = quad.entries.indexOf(entry);

        if (index > -1) {
            swapDeleteAt(quad.entries, index);

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

        if (
            quad.topLeft.isSubdivided() ||
            quad.topRight.isSubdivided() ||
            quad.bottomLeft.isSubdivided() ||
            quad.bottomRight.isSubdivided()
        ) {
            return;
        }

        const topLeftEntryCount = quad.topLeft.entries.length;
        const topRightEntryCount = quad.topRight.entries.length;
        const bottomLeftEntryCount = quad.bottomLeft.entries.length;
        const bottomRightEntryCount = quad.bottomRight.entries.length;

        const totalEntryCount =
            topLeftEntryCount +
            topRightEntryCount +
            bottomLeftEntryCount +
            bottomRightEntryCount;

        TEMP_MERGE_ARRAY.length = 0;
        TEMP_MERGE_SET.clear();

        const topRightTotal = topLeftEntryCount + topRightEntryCount;
        const bottomLeftTotal = topRightTotal + bottomLeftEntryCount;

        for (let i = 0; i < totalEntryCount; i++) {
            let entry: unknown;

            if (i < topLeftEntryCount) {
                entry = quad.topLeft.entries[i];
            } else if (i < topRightTotal) {
                entry = quad.topRight.entries[i - topLeftEntryCount];
            } else if (i < bottomLeftTotal) {
                entry = quad.bottomLeft.entries[i - topRightTotal];
            } else {
                entry = quad.bottomRight.entries[i - bottomLeftTotal];
            }

            if (TEMP_MERGE_SET.has(entry)) {
                continue;
            }

            TEMP_MERGE_SET.add(entry);
            TEMP_MERGE_ARRAY.push(entry);
        }

        if (TEMP_MERGE_ARRAY.length <= this.maxEntriesPerQuad) {
            quad.entries = TEMP_MERGE_ARRAY.slice() as E[];
            TEMP_MERGE_ARRAY.length = 0;

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
     * Get all entries that intersect `rect`.
     * @param rect - Rect to intersect with
     * @param results - Optional `Set` to put results into. Will allocate a new `Set` otherwise
     * @returns A `Set` containing all intersecting entries
     */
    intersections(rect: RectLike, results?: ArraySet<E>): ArraySet<E> {
        results?.clear();

        results ??= new ArraySet();

        this._filter(
            this.root,
            e => e.intersectsRect(rect),
            r => r.intersectsRect(rect),
            results,
        );

        return results;
    }

    /**
     * Get all entries that match the predicate.
     * @param entryPredicate - Entry predicate
     * @param quadPredicate - Quad predicate. Will be called with quad bounds
     * @param results - Optional `Set` to put results into. Will allocate a new `Set` otherwise
     * @returns A `Set` containing all matched entries
     */
    filter(
        entryPredicate: (entry: E) => boolean,
        quadPredicate: (rect: ReadonlyRect) => boolean,
        results?: ArraySet<E>,
    ): ArraySet<E> {
        results ??= new ArraySet();

        this._filter(this.root, entryPredicate, quadPredicate, results);

        return results;
    }

    private _filter(
        quad: _Quad<E>,
        predicate: (entry: E) => boolean,
        intersects: (rect: ReadonlyRect) => boolean,
        results: ArraySet<E>,
    ) {
        if (intersects(quad.bounds) === false) {
            return;
        }

        if (quad.isSubdivided()) {
            this._filter(quad.topLeft, predicate, intersects, results);
            this._filter(quad.topRight, predicate, intersects, results);
            this._filter(quad.bottomLeft, predicate, intersects, results);
            this._filter(quad.bottomRight, predicate, intersects, results);

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
 *
 * @category Utility
 */
export interface Quad {
    readonly topLeft?: Quad;
    readonly topRight?: Quad;
    readonly bottomLeft?: Quad;
    readonly bottomRight?: Quad;

    readonly bounds: ReadonlyRect;
    readonly depth: number;

    readonly entryCount: number;

    isSubdivided(): this is SubdividedQuad;
}

/**
 * A subidivided quad in the {@link QuadTree}.
 *
 * @category Utility
 */
export interface SubdividedQuad {
    readonly topLeft: Quad;
    readonly topRight: Quad;
    readonly bottomLeft: Quad;
    readonly bottomRight: Quad;

    readonly bounds: ReadonlyRect;
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
        public readonly bounds: Rect = Rect.zero(),
        public depth: number = 0,
    ) {}

    isSubdivided(): this is SubdividedQuad {
        return this.subdivided;
    }
}

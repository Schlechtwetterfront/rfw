import { SceneGraphObject } from '..';
import { ChangeTracker } from '../../app/change-tracking';
import { ArraySet } from '../../util';
import { Group } from '../group';
import { OBJECT_KIND, ObjectKind } from './base';

/** @category Scene */
export class TransformPropagator {
    private readonly rootObjects = new ArraySet<SceneGraphObject>();

    constructor(private readonly changeTracker: ChangeTracker) {}

    /**
     * Mark an object's tree as changed. Transforms for the full tree will be composed and
     * propagated on the next call of {@link TransformPropagator#propagate}.
     * @param o - Scene graph object
     */
    change(o: SceneGraphObject): void {
        this.changeTracker.registerChange();

        let actualObject = o;

        while (actualObject.parent) {
            actualObject = actualObject.parent;
        }

        this.rootObjects.add(actualObject);
    }

    /**
     * Update an object's (and its subtree's) transform immediately with the current (i.e., last
     * frame's) transforms.
     * @param o - Scene graph object
     */
    update(o: SceneGraphObject): void {
        this.changeTracker.registerChange();

        this.traverseAndPropagate(o);
    }

    /**
     * Compose changed transforms and propagate along scene graph.
     */
    propagate(): void {
        for (let i = 0; i < this.rootObjects.size; i++) {
            const o = this.rootObjects.values[i]!;

            this.traverseAndPropagate(o);
        }

        this.rootObjects.clear();
    }

    private traverseAndPropagate(o: SceneGraphObject) {
        o.transform.composeWorld(o.parent?.transform);

        if (o[OBJECT_KIND] & ObjectKind.GROUP) {
            const { children } = o as Group;
            const childCount = children.length;

            for (let i = 0; i < childCount; i++) {
                const child = children[i]!;

                if (child[OBJECT_KIND] & ObjectKind.GROUP) {
                    this.traverseAndPropagate(child);
                } else {
                    child.transform.composeWorld(o.transform);
                }
            }
        }
    }
}

import { SceneGraphObject } from '..';
import { ChangeTracker } from '../../app/change-tracking';
import { Group } from '../group';
import { OBJECT_KIND, ObjectKind } from './base';

export class TransformPropagator {
    private readonly rootObjects = new Set<SceneGraphObject>();

    constructor(private readonly changeTracker: ChangeTracker) {}

    change(e: SceneGraphObject): void {
        let actualObject = e;

        while (actualObject.parent) {
            actualObject = actualObject.parent;
        }

        this.rootObjects.add(actualObject);
    }

    propagate(): void {
        if (this.rootObjects.size > 0) {
            this.changeTracker.registerChange();
        }

        for (const o of this.rootObjects) {
            this.traverseAndPropagate(o);
        }

        this.rootObjects.clear();
    }

    private traverseAndPropagate(e: SceneGraphObject) {
        e.transform.composeWorld(e.parent?.transform);

        if (e[OBJECT_KIND] & ObjectKind.GROUP) {
            const { children } = e as Group;
            const childCount = children.length;

            for (let i = 0; i < childCount; i++) {
                const child = children[i]!;

                if (child[OBJECT_KIND] & ObjectKind.GROUP) {
                    this.traverseAndPropagate(child);
                } else {
                    child.transform.composeWorld(e.transform);
                }
            }
        }
    }
}

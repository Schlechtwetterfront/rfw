import { SceneGraphObject } from '.';
import { swapDeleteAt } from '../util';
import { Base, BaseOptions, OBJECT_KIND, ObjectKind } from './graph';

/** @category Scene */
export interface GroupOptions extends BaseOptions {
    children?: SceneGraphObject[];
}

/** @category Scene */
export class Group extends Base {
    private _children: SceneGraphObject[] = [];

    get children(): readonly SceneGraphObject[] {
        return this._children;
    }

    [OBJECT_KIND] = ObjectKind.GROUP;

    get [Symbol.toStringTag]() {
        return `Group ${this.label}`;
    }

    constructor(options?: GroupOptions) {
        super(options);

        options?.children?.forEach(c => this.add(c));
    }

    add(...children: SceneGraphObject[]) {
        const childCount = children.length;

        for (let i = 0; i < childCount; i++) {
            const child = children[i]!;

            if (child.parent && child.parent !== this) {
                child.parent.remove(child);
            }

            child.parent = this;

            this._children.push(child);
        }
    }

    remove(...children: SceneGraphObject[]): void {
        switch (children.length) {
            case 0:
                return;

            case 1: {
                const i = this._children.indexOf(children[0]!);

                if (i > -1) {
                    const child = this._children[i]!;
                    child.parent = undefined;

                    swapDeleteAt(this._children, i);
                }

                return;
            }

            default:
                this._removeChildren(children);
                return;
        }
    }

    private _removeChildren(children: SceneGraphObject[]) {
        const { _children: currentChildren } = this;

        const newChildren: SceneGraphObject[] = [];

        const childCount = currentChildren.length;

        for (let i = 0; i < childCount; i++) {
            const child = currentChildren[i]!;

            if (children.includes(child)) {
                child.parent = undefined;

                continue;
            }

            newChildren.push(child);
        }

        this._children = newChildren;
    }
}

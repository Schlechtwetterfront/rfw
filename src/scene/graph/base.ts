import { LocalTransform2D, Vec2Like } from '../../math';
import { Group } from '../group';

export enum ObjectKind {
    OBJECT = 1 << 0,
    GROUP = 1 << 1,
}

export const OBJECT_KIND = Symbol('kind');

export interface BaseOptions {
    label?: string;
    visible?: boolean;
    x?: number;
    y?: number;
    z?: number;
    position?: Vec2Like;
    radians?: number;
    degrees?: number;
    scale?: number;
}

export abstract class Base {
    readonly transform = new LocalTransform2D();

    //@internal
    private _parent?: Group;

    get parent() {
        return this._parent;
    }
    //@internal
    set parent(parent: Group | undefined) {
        this._parent = parent;
    }

    label?: string;

    constructor(options?: BaseOptions) {
        this.label = options?.label;

        if (typeof options?.x === 'number') {
            this.transform.position.x = options.x;
        }

        if (typeof options?.y === 'number') {
            this.transform.position.y = options.y;
        }

        if (typeof options?.z === 'number') {
            this.transform.z = options.z;
        }

        if (options?.position) {
            this.transform.position.copyFrom(options.position);
        }

        if (typeof options?.radians === 'number') {
            this.transform.radians = options.radians;
        }

        if (typeof options?.degrees === 'number') {
            this.transform.degrees = options.degrees;
        }

        if (options?.scale) {
            this.transform.scale.set(options.scale);
        }
    }
}

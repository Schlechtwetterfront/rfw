import { ObjectOptions, SceneObject } from './graph';

export class EmptyObject extends SceneObject {
    get [Symbol.toStringTag]() {
        return `Empty ${this.label}`;
    }

    constructor(options?: ObjectOptions) {
        super(options);
    }
}

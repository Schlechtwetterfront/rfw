import { Material } from '../renderers/mesh';
import { Mesh } from '../rendering/mesh';
import { ObjectOptions, SceneObject } from './graph';

/** @category Scene */
export interface MeshOptions extends ObjectOptions {
    mesh: Mesh;
    material: Material;
}

/** @category Scene */
export class MeshObject extends SceneObject {
    mesh: Mesh;
    material: Material;

    get [Symbol.toStringTag]() {
        return `Mesh ${this.label}`;
    }

    constructor(options: MeshOptions) {
        super(options);

        this.mesh = options.mesh;
        this.material = options.material;
    }
}

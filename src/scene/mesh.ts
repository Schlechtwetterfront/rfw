import { TexturedMaterial } from '../renderers/textured-mesh';
import { Mesh } from '../rendering/mesh';
import { ObjectOptions, SceneObject } from './graph';

export interface MeshOptions extends ObjectOptions {
    mesh: Mesh;
    material: TexturedMaterial;
}

export class MeshObject extends SceneObject {
    mesh: Mesh;
    material: TexturedMaterial;

    get [Symbol.toStringTag]() {
        return `Mesh ${this.label}`;
    }

    constructor(options: MeshOptions) {
        super(options);

        this.mesh = options.mesh;
        this.material = options.material;
    }
}

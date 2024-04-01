import { Base, BaseOptions, OBJECT_KIND, ObjectKind } from './base';

export interface ObjectOptions extends BaseOptions {}

export abstract class SceneObject extends Base {
    [OBJECT_KIND] = ObjectKind.OBJECT;

    constructor(options?: ObjectOptions) {
        super(options);
    }
}

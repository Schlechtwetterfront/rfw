import { Base, BaseOptions, OBJECT_KIND, ObjectKind } from './base';

/** @category Scene */
export interface ObjectOptions extends BaseOptions {}

/** @category Scene */
export abstract class SceneObject extends Base {
    [OBJECT_KIND] = ObjectKind.OBJECT;

    constructor(options?: ObjectOptions) {
        super(options);
    }
}

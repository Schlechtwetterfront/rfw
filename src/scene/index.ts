import { SceneObject } from './graph/object';
import { Group } from './group';

export * from './empty';
export * from './graph';
export * from './group';
export * from './line';
export * from './mesh';
export * from './text';

/** @category Scene */
export type SceneGraphObject = Group | SceneObject;

/** @category Scene */
export interface SizedObject {
    readonly size: number;
}

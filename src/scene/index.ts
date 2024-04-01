import { SceneObject } from './graph/object';
import { Group } from './group';

export * from './empty';
export * from './graph';
export * from './group';
export * from './line';
export * from './mesh';
export * from './text';

export type SceneGraphObject = Group | SceneObject;

export interface SizedObject {
    readonly size: number;
}

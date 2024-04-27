import { Color } from '../../colors';
import { Vec2 } from '../../math';

export class Vertex {
    constructor(
        public readonly position = Vec2.zero(),
        public readonly uv = Vec2.zero(),
        public color?: Color,
    ) {}

    static fromCoordinates(
        x: number,
        y: number,
        u?: number,
        v?: number,
    ): Vertex {
        return new Vertex(new Vec2(x, y), new Vec2(u ?? 0, v ?? 0));
    }

    static createVerticesFromPositions(
        ...positions: readonly Vec2[]
    ): Vertex[] {
        return positions.map(pos => new Vertex(pos));
    }
}

export class Mesh {
    get triangulatedVertexCount() {
        return this.indices.length;
    }

    constructor(
        public readonly vertices: readonly Vertex[],
        public readonly indices: readonly number[],
    ) {}
}

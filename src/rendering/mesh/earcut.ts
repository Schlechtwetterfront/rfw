import earcut from 'earcut';
import { Mesh, Vertex } from './mesh';

const TEMP_FLAT_POSITIONS: number[] = [];

/**
 * Triangulate the polygon defined by `vertices`.
 * @param vertices - Unique vertices
 * @param islandMarkers - Optional, indices into `vertices` to mark which sections are islands
 * @returns Indices into `vertices` defining all triangles
 *
 * @category Rendering
 */
export function triangulate(
    vertices: Vertex[],
    islandMarkers: number[] = [],
): number[] {
    const indices: number[] = [];

    const islandCount = islandMarkers.length + 1;

    let islandStart = 0;

    for (let island = 0; island < islandCount; island++) {
        TEMP_FLAT_POSITIONS.length = 0;

        const islandEnd = islandMarkers[island] ?? vertices.length;

        for (let i = islandStart; i < islandEnd; i++) {
            TEMP_FLAT_POSITIONS.push(
                vertices[i]!.position.x,
                vertices[i]!.position.y,
            );
        }

        const islandIndices = earcut(TEMP_FLAT_POSITIONS);

        for (let i = 0; i < islandIndices.length; i++) {
            indices.push(islandStart + islandIndices[i]!);
        }

        islandStart = islandEnd;
    }

    TEMP_FLAT_POSITIONS.length = 0;

    return indices;
}

/**
 * Triangulate `vertices` using {@link triangulate} and create a new {@link Mesh} from the result.
 * @param vertices - Unique vertices of the polygon
 * @param islandMarkers - Optional, indices into `vertices` to mark which sections are islands
 * @returns Mesh of the triangulated polygon
 *
 * @category Rendering
 */
export function buildTriangulatedMesh(
    vertices: Vertex[],
    islandMarkers: number[] = [],
): Mesh {
    const indices = triangulate(vertices, islandMarkers);

    return new Mesh(vertices, indices);
}

import {
    CanvasApp,
    Color,
    Group,
    LineBatcher,
    LineObject,
    MeshBatcher,
    MeshObject,
    PI_2,
    SceneGraphObject,
    TexturedMaterial,
    Vertex,
    WGLDriver,
    WGLLineRenderer,
    WGLTexturedMeshBatchRenderer,
    buildCirclePoints,
    buildTriangulatedMesh,
} from '../../src';

interface SpaceObject {
    name: string;
    color: Color;
    diameter: number;
    distance: number;
    velocity: number;
}

const SPACE_OBJECTS: SpaceObject[] = [
    {
        name: 'Sun',
        color: Color.fromHexString('#FFFDEE'),
        diameter: 696_300 * 2,
        distance: 0,
        velocity: 0,
    },
    {
        name: 'Jupiter',
        color: Color.fromHexString('#D3D2B9'),
        diameter: 142_984,
        distance: 778_000_000,
        velocity: 1.673e-1,
    },
    {
        name: 'Saturn',
        color: Color.fromHexString('#CCA270'),
        diameter: 120_536,
        distance: 1_400_000_000,
        velocity: 9.294e-2,
    },
    {
        name: 'Uranus',
        color: Color.fromHexString('#D4EEF0'),
        diameter: 51_118,
        distance: 2_900_000_000,
        velocity: 2.37e-2,
    },
    {
        name: 'Neptune',
        color: Color.fromHexString('#657CF3'),
        diameter: 49_528,
        distance: 4_500_000_000,
        velocity: 1.208e-2,
    },
    {
        name: 'Earth',
        color: Color.fromHexString('#78B436'),
        diameter: 12_756,
        distance: 149_000_000,
        velocity: 1.992,
    },
    {
        name: 'Venus',
        color: Color.fromHexString('#CDBEB0'),
        diameter: 12_104,
        distance: 108_000_000,
        velocity: 3.232,
    },
    {
        name: 'Mars',
        color: Color.fromHexString('#EFB166'),
        diameter: 6_792,
        distance: 79_000_000,
        velocity: 1.059,
    },
    {
        name: 'Mercury',
        color: Color.fromHexString('#959192'),
        diameter: 4_880,
        distance: 58_000_000,
        velocity: 8.264,
    },
];

const MAX_DIAMETER = SPACE_OBJECTS.reduce(
    (max, spaceObject) =>
        spaceObject.diameter > max ? spaceObject.diameter : max,
    0,
);

const MAX_DIAMETER_PIXELS = 312;

function pixelDiameter(d: number) {
    return (d / MAX_DIAMETER) * MAX_DIAMETER_PIXELS;
}

interface RenderSpaceObject {
    root: SceneGraphObject;
    meshObject: MeshObject;
    lineObject: LineObject;
    spaceObject: SpaceObject;
    angle: number;
    radius: number;
}

const BACKGROUND_COLOR = Color.fromHexString('#111');

export class SceneApp extends CanvasApp<WGLDriver> {
    private readonly meshRenderer = new WGLTexturedMeshBatchRenderer(
        this.driver,
    );
    private readonly lineRenderer = new WGLLineRenderer(this.driver);

    // #region mesh-batcher
    private readonly meshBatches = new MeshBatcher({
        maxTextureCount: this.driver.textures.maxTextureCount,
        changeTracker: this.changeTracker,
    });
    // #endregion mesh-batcher
    private readonly lineBatches = new LineBatcher({
        changeTracker: this.changeTracker,
    });

    private readonly objects: RenderSpaceObject[] = [];

    override async initialize(): Promise<void> {
        await super.initialize();

        let distance = 0;
        let last: RenderSpaceObject | undefined;

        for (const so of SPACE_OBJECTS.toSorted(
            (a, b) => a.distance - b.distance,
        )) {
            const radius = pixelDiameter(so.diameter) / 2;

            if (last) {
                distance += last.radius + 12 + radius;
            }

            const meshObject = new MeshObject({
                x: distance,
                mesh: buildTriangulatedMesh(
                    buildCirclePoints(0, 0, radius, 4).map(p => new Vertex(p)),
                ),
                material: new TexturedMaterial(this.textures.white, so.color),
            });

            const lineObject = new LineObject({
                points: buildCirclePoints(0, 0, distance, 4, 'distance', true),
                style: {
                    color: new Color(1, 1, 1, 0.1),
                },
            });

            const initialRotation = Math.random() * PI_2;

            const root = new Group({ radians: initialRotation });

            root.add(meshObject, lineObject);

            this.transforms.change(root);

            // #region add-to-mesh-batcher
            this.meshBatches.add(meshObject);
            // #endregion add-to-mesh-batcher
            this.lineBatches.add(lineObject);

            this.objects.push({
                meshObject,
                lineObject,
                root,
                spaceObject: so,
                angle: 0,
                radius,
            });

            last = this.objects.at(-1);
        }

        this.tickers.add(({ elapsedSeconds }) => {
            for (const so of this.objects) {
                so.root.transform.radians +=
                    so.spaceObject.velocity * elapsedSeconds;

                if (so.root.transform.radians > PI_2) {
                    so.root.transform.radians = 0;
                }

                this.transforms.change(so.root);
                this.meshBatches.change(so.meshObject);
            }
        });
    }

    protected override render(): void {
        super.render();

        this.driver.useRenderTarget('canvas');

        this.driver.clear(BACKGROUND_COLOR);

        this.lineRenderer.render(this.lineBatches.finalize(), this.camera);

        // #region finalize-mesh-batches
        const meshBatches = this.meshBatches.finalize();
        // #endregion finalize-mesh-batches

        // #region render-mesh-batches
        this.meshRenderer.render(meshBatches, this.camera);
        // #endregion render-mesh-batches
    }
}

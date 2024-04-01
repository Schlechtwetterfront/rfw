# `rfw`

[![npm](https://img.shields.io/npm/v/%40schlechtwetterfront%2Frfw)](https://www.npmjs.com/package/@schlechtwetterfront/rfw)

2D rendering library for WebGL.

This is not a batteries-included rendering framework or even engine. It's main goal is to provide
the basic tools and setup to create an actual WebGL application.

#### Features

-   Apps provide a streamlined path to build applications.
-   Render-on-demand via change tracking.
-   Tickers: run logic in a manner similar to ECS systems.
-   Extendable batch tooling for easy batched rendering.
-   Meshes and textures.
-   All the parts for a scene graph (it does not need one, though).
-   Some built-in object types (text, line, textured mesh) with fast batched renderers.
-   Cameras.
-   WebGL canvas/context handling (initialization, resizing, context loss/restore handling).
-   Math (vectors, matrices, transforms, shapes and polygons) and color modules.

## Get started

Install via `npm` or your preferred package manager:

```
npm install rfw
```

Import from `rfw`:

```typescript
import { App, Vec2, Color } from '@schlechtwetterfront/rfw';

// ...
```

Create your application (can also be found under `samples/readme/`):

```typescript
import {
    CanvasApp,
    Color,
    MeshBatcher,
    MeshObject,
    TexturedMaterial,
    Vertex,
    WGLDriver,
    WGLTexturedMeshBatchRenderer,
    buildTriangulatedMesh,
} from '@schlechtwetterfront/rfw';

// Build a mesh from vertices forming a square.
const MESH = buildTriangulatedMesh([
    Vertex.fromCoordinates(-32, -32, 0, 0),
    Vertex.fromCoordinates(32, -32, 1, 0),
    Vertex.fromCoordinates(32, 32, 1, 1),
    Vertex.fromCoordinates(-32, 32, 0, 1),
]);

const BACKGROUND_COLOR = new Color(0.2, 0.2, 0.2);

export class MyApp extends CanvasApp<WGLDriver> {
    // The default renderers only work on batches, so we need something that can create these batches.
    private readonly batches = new MeshBatcher<MeshObject>({
        maxTextureCount: this.driver.textures.maxTextureCount,
        changeTracker: this.changeTracker,
    });

    // A default textured mesh renderer.
    private readonly meshRenderer = new WGLTexturedMeshBatchRenderer(
        this.driver,
    );

    // Initialize is where app setup happens.
    override async initialize(): Promise<void> {
        await super.initialize();

        const texture = await this.textures.addFromURL('image.png');

        // Create a mesh scene object. This object could be added to a scene graph to allow for
        // (transform) hierarchies etc. We can also not do that.
        const object = new MeshObject({
            mesh: MESH,
            material: new TexturedMaterial(texture),
        });

        // Add object to a renderable collection - in this case a batch.
        this.batches.add(object);
        // Mark the object's transform as changed, so it can be updated correctly for rendering. Would
        // also propagate transforms along the hierarchy if we had children.
        this.transforms.change(object);

        // Add a ticker - runs our logic periodically.
        this.tickers.add(({ elapsedSeconds }) => {
            object.transform.degrees += elapsedSeconds * 45;

            // Again we explicitly have to mark the object's transforms as changed.
            this.transforms.change(object);
            // The batcher also needs to know something about the object has changed because it might
            // need to rebuild its batched representation.
            // Doing this explicitly and manually allows this library to do the least amount of work
            // by default.
            this.batches.change(object);
        });
    }

    // This is the render 'pass'.
    protected override render(): void {
        // The canvas app does some default setup for rendering.
        super.render();

        // Clear our viewport to a color.
        this.driver.clearViewport(BACKGROUND_COLOR);

        // We informed the batcher about our object in initialize but the batcher didn't do anything
        // with it yet. To only do work once any changes to batches are queued and must be applied
        // via finalize.
        // The batcher will (re-) assign objects to batches.
        const finalizedBatches = this.batches.finalize();

        // Render the batches. Pass along the optional camera to view anything drawn through its
        // lense (projection).
        this.meshRenderer.render(finalizedBatches, this.camera);
    }
}

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const driver = await WGLDriver.fromCanvas(canvas);

const app = new MyApp(canvas, driver);

await app.initializeAndStart();
```

## License

[MIT](https://opensource.org/licenses/MIT)

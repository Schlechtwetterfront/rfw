# `rfw` [![npm](https://img.shields.io/npm/v/rfw2d)](https://www.npmjs.com/package/rfw2d)

2D rendering library for WebGL.

Check out the [samples](/samples/).

### Features

-   Get started easily with apps, providing a default "bundle" of systems to create your application from.
-   Tickers: run logic in a manner similar to ECS systems.
-   [Scene (graphs)](#scene)
-   [Low abstraction render tooling](#rendering)
-   [Math and color utility modules](#math)
-   [Change tracking](#explicit-change-tracking)
-   [Performance in mind](#performance)

#### Scene

-   Comes with all the parts for a scene graph (`Group`, `SceneObject` base class).
-   The default renderers do not assume a scene graph, instead render data/geometry is built from the scene graph (or multiple, or some other data structure) and then passed to the renderer.
-   Provides some built-in scene objects (text, line, textured mesh) with batched renderers.
-   Use cameras to view your scene through different lenses.

#### Rendering

Low abstraction library explicitly not wrapping the underlying graphics API. The goal is to provide tooling to easily set up a rendering app but then get out of the way and let the consumer use the graphics API however they want.

Tooling includes:

-   WebGL canvas handling:
    -   Canvas/context setup.
    -   Keeping size/render size correct when the canvas element is resized.
    -   WebGL context restore/loss handling.
-   Graphics API "driver" with minimal services for texture loading and shader compilation.
-   Batching components with change tracking to minimize draw calls and buffer uploads.

#### Math

Comes with a set of 2D math utilities.

-   `Mat2D`: A 3x2 matrix for transforms.
-   `Vec2`: 2D vector for points, vector math.
-   `Transform2D` and `LocalTransform2D`: Transforms for scene graph objects.
-   Shapes: `Rect`, `Circle`, and `Poly` offer basic building blocks for geometry building and interaction (intersection/contains-point tests).
-   `Color`: RGBA color with several conversion utilities.

#### Explicit change tracking

`rfw` does no automatic change checking or even iteration (like scene-graph-traversal) by default. All changes have to be explicitly registered by the user:

-   `TransformPropagator.change(object)` to mark an object's transforms as changed
-   `TransformPropagator.propagate()` to apply all transform changes prior to rendering
-   `ObjectCollection.change(object)` (or `.add`/`.remove`) to mark an object as changed.  
    `ObjectCollection` is a generic interface. In case of a batcher the call might trigger re-batching or just an update to the object's geometry.
-   `ChangeTracker.registerChange()` to mark a generic change. Each default app has a `ChangeTracker` that is also passed to all change-tracking systems (like `TransformPropagator` and `ObjectCollection`).  
    This allows the app to know when a render is necessary.

For low-change workloads (static scenes, visualization) this can reduce the work done per frame to a minimum.

#### Performance

-   Math primitives (`Vec2`, `Mat2D`) are mutable to prevent unnecessary allocations (explicitly `.clone()` if necessary).
-   Many APIs support passing a target collection that can be reused by the caller.
-   Object pools are available (and used in library code where applicable - like batching).
-   Extensible batching components.
-   Trade memory for iteration performance with `ArraySet` and `ArrayMap`. They have similar lookup/add/delete performance to JavaScript's built-in `Set` and `Map` but also expose an array of their keys/values for fast iteration.

## Get started

Install via `npm` or your preferred package manager:

```
npm install rfw2d
```

Import from `rfw2d`:

```typescript
import { App, Vec2, Color } from 'rfw2d';

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
} from 'rfw2d';

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

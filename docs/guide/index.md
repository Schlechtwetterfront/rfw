# Introduction

## What is `rfw`?

`rfw` is a 2D rendering framwork for the web. It provides a suite of components that can be used to create visual applications running in a browser.

It is explicitly _not_ a game framework or engine.

## Features

### Scene

-   Comes with all the parts for a scene graph (`Group`, `SceneObject` base class)
-   The default renderers do not assume a scene graph, instead render data/geometry is built from the scene graph (or multiple, or some other data structure) and then passed to the renderer
-   Provides some built-in scene objects (text, line, textured mesh) with batched renderers
-   Use cameras to view your scene through different lenses

### Rendering

Low abstraction library explicitly not wrapping the underlying graphics API. The goal is to provide tooling to easily set up a rendering app but then get out of the way and let the consumer use the graphics API however they want.

Tooling includes:

-   WebGL canvas handling:
    -   Canvas/context setup
    -   Keeping size/render size correct when the canvas element is resized
    -   WebGL context restore/loss handling
-   Graphics API "driver" with minimal services for texture loading and shader compilation
-   Batching components with change tracking to minimize draw calls and buffer uploads

### Math

Comes with a set of 2D math utilities.

-   `Mat2D`: A 3x2 matrix for transforms
-   `Vec2`: 2D vector for points, vector math
-   `Transform2D` and `LocalTransform2D`: Transforms for scene graph objects
-   Shapes: `Rect`, `Circle`, and `Poly` offer basic building blocks for geometry building and interaction (intersection/contains-point tests)
-   `Color`: RGBA color with several conversion utilities

### Explicit change tracking

`rfw` does no automatic change checking or even iteration (like scene-graph-traversal) by default. All changes have to be explicitly registered by the user:

-   `TransformPropagator.change(object)` to mark an object's transforms as changed
-   `TransformPropagator.propagate()` to apply all transform changes prior to rendering
-   `ObjectCollection.change(object)` (or `.add`/`.remove`) to mark an object as changed.
    `ObjectCollection` is a generic interface. In case of a batcher the call might trigger re-batching or just an update to the object's geometry
-   `ChangeTracker.registerChange()` to mark a generic change. Each default app has a `ChangeTracker` that is also passed to all change-tracking systems (like `TransformPropagator` and `ObjectCollection`).  
    This allows the app to know when a render is necessary

For low-change workloads (static scenes, visualization) this can reduce the work done per frame to a minimum.

### Performance

-   Math primitives (`Vec2`, `Mat2D`) are mutable to prevent unnecessary allocations (explicitly `.clone()` if necessary)
-   Many APIs support passing a target collection that can be reused by the caller
-   Object pools are available (and used in library code where applicable - like batching)
-   Extensible batching components
-   Trade memory for iteration performance with `ArraySet` and `ArrayMap`. They have similar lookup/add/delete performance to JavaScript's built-in `Set` and `Map` but also expose an array of their keys/values for fast iteration

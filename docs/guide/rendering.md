# Rendering

## The Path of a Renderable

To draw something on the canvas, several systems come into play:

-   Scene / scene graph (A)
-   Transforms (B)
-   A batcher (C)
-   A renderer (D)

To render a mesh, one would:

1. Create a `MeshObject` to hold mesh (geometry) and material - that is, create a _scene object_. (A)
    ```ts
    const o = new MeshObject({
        /* ... */
    });
    ```
2. Possibly give it a parent that it has to rotate around - that is, add it to a _scene graph_. (A)

    ```ts
    const p = new Group();

    p.add(o);
    ```

3. Set the object's position and the parent's rotation - set their _transforms_. (B)

    ```ts
    o.transform.position.set(100, 100);

    p.transform.degrees = 90;

    // `rfw` is passive, make sure to tell all systems about changes!
    app.transforms.change(p);
    ```

    ::: info Async transform updates
    Calling `TransformPropagator.change` will not update the transforms immediately!

    Instead it queues the transform calculations for the object's whole branch in the scene graph. They are executed on the next call to `TransformPropagator.propagate`, which by default happens at the start of the next frame.
    :::

4. Add the mesh object to a matching batcher. (C)

    ```ts
    const batcher = new MeshBatcher({
        /* ... */
    });

    batcher.add(o);

    // Or, when something changes later:
    batcher.change(o);
    ```

5. Have a matching renderer render all batches. (D)

    ```ts
    const renderer = new WGLTexturedMeshRenderer(/* ... */);

    const batches = batcher.finalize();

    // Render in scene space. If camera is omitted will render in viewport space.
    renderer.render(batches, app.camera);
    ```

3 & 4 obviously happen whenever something changes, 5 on every render.

::: info Change tracking
`rfw` is big on change-tracking. It allows only updating whatever has changed and only rendering _if_ something has changed.

So steps 3/4 and 5 are connected in more ways than immediately obvious.
:::

## Coordinate Systems / Spaces

When using `rfw` you will probably encounter three coordinate systems (or spaces),

-   "DOM",
-   viewport,
-   and scene.

The pseudo-space "DOM" includes any coordinates and dimensions you get from interaction with the DOM, e.g., `client*` or `offset*` in events, `getBoundingClientRect`, etc. The DOM's X-axis points right, Y-axis down.

In `rfw`'s two spaces viewport and scene, the X-axis also points right, the Y-axis, however, points up. To use any DOM coordinate, they will have to be projected.

```ts
const p = vec(event.offsetX, event.offsetY);

app.driver.projections.projectDOMPointToViewport(p);
```

See [`Projections`](/reference/interfaces/Projections.html){target="\_self"}.

The scene space is relative to a camera. `rfw` does not decide where any objects "reside" by default. A UI-like element (imagine e.g., a scale of a graph) could only ever work in viewport space and ignore the camera projection. The actual data points could be in scene space because the graph itself is pannable.

By default, one pixel equals one unit in all the spaces.

TODO: Custom renderer, shader handling

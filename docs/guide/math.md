# Math

`rfw` comes with a bunch of math utilities for 2D.

Some fundamental things apply to all of those:

- They are _not_ immutable.

    ```ts
    const v1 = Vec2.zero();
    const v2 = v1.add(1, 2);
    ```

    `Vec2.add` mutates, so `v1 === v2`.

    This behavior is on purpose to prevent frequent allocations. Use the `clone` method present on most math classes to create a copy.

- They are "simple" (or dumb).

    The math classes do no validation of the values set (like `x` and `y` of `Vec2`) and do no calculations on these properties being set.

    For example, you can set a `Transform2D`s position or rotation, but its matrix (`Transform2D.matrix`) will only be updated on calling `Transform2D.compose`.

## Basics

### `Vec2`

A 2D vector for positions, directions, etc.

```ts
const zeroVec = Vec2.zero();
const zeroVec2 = new Vec2();

// Operations mutate and can be chained
zeroVec.add(1, 1).multiplyVec(zeroVec2);
```

See [`Vec2`](/ref/classes/Vec2).

### `Mat2D`

A 3x2 matrix for e.g., transforms.

```ts
const id = Mat2D.identity();

// Operations mutate and can be chained
id.translate(1, 1).rotateDegrees(90).scale(2, 2);
```

See [`Mat2D`](/ref/classes/Mat2D).

### `Transform2D` and `LocalTransform2D`

Contain position, rotation, and scale and combine these into a matrix (or two, in the case of `LocalTransform2D`s `matrix` and `worldMatrix`).

`LocalTransform2D` is used in the scene objects (`Group`, `MeshObject`, etc.) to allow parent-child relations (-> scene graph).

```ts
const parent = new LocalTransform2D();
const child = new LocalTransform2D();

parent.position.set(100, 100);
child.position.set(10, 0);
child.degrees = 90;

// Compose position, rotation, and scale
parent.composeWorld();

// Compose and additionally apply parent's transform
child.composeWorld(parent);
```

See [`Transform2D`](/ref/classes/Transform2D), [`LocalTransform2D`](/ref/classes/LocalTransform2D).

## Shapes

`rfw` also comes with some basic geometric shapes. Use them as simple data holders (a `Rect` with `x`, `y`, `width`, and `height` instead of two `Vec2`s), to do comparisons/hit-tests or to create geometry.

The shapes are:

- `Rect`
- `Circle`
- `Poly`

All of these support hit-test via point (`Shape.containsPoint`) and rect intersection (`Shape.intersectsRect`).

`Rect` and `Circle` have geometry (fancy name for a list of `Vec2`s) builders in `buildPointsFromRect` and `buildPointsFromCircle` (and their primitive friends `buildRectPoints` and `buildCirclePoints`).

```ts
const r = Rect.zero();
r.width = 2;
r.height = 4;

const c = new Circle(0, 0, 2);

c.intersectsRect(r);

const circlePoints = buildPointsFromCircle(c, 12);

const boundingRect = Rect.fromPoints(circlePoints);

const p = new Poly(Vec2.zero(), Vec2.one(), new Vec2(1, 0));

p.intersectsRect(boundingRect);
```

See [`Shape`](/ref/interfaces/Shape), [`Rect`](/ref/classes/Rect), [`Circle`](/ref/classes/Circle), [`Poly`](/ref/classes/Poly).

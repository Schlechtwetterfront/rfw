# Performance

`rfw` chooses certain abstractions, conventions, and trade-offs that can allow for great performance. It also provides some tools for the user to do the same - if they so choose.

Check out the [benchmarks](/benchmarks/) that some of these decisions are based on.

-   **`for`-loop iteration is a lot faster than iterator-based iteration (`for ... of`) or methods like `forEach`.**

    For arrays: Iterate arrays with a simple `for`-loop.

    ```ts
    const a = [1, 2, 3];

    for (let i = 0; i < a.length; i++) {
        const e = a[i]!;
    }
    ```

    For `Set` and `Map`: Possibly use `rfw`s `ArraySet` or `ArrayMap` (or even `SparseSet`). These trade memory (they keep both a `Map` and an array) for iteration speed (because the array can be iterated with a `for`-loop).

    ```ts
    const am = new ArrayMap([1, 2, 3]);

    // `ArrayMap.size` (and `ArraySet.size`) are getters, if iterated _very_ often it's better to save the function call
    const size = am.size;

    for (let i = 0; i < size; i++) {
        const e = am.values[i]!;
    }
    ```

    See [`ArraySet`](/reference/classes/ArraySet.html){target="\_self"}, [`ArrayMap`](/reference/classes/ArrayMap.html){target="\_self"}, [`SparseSet`](/reference/classes/SparseSet.html){target="\_self"}.

-   **Disregard array order on mutations if not necessary.**

    Especially `Array.splice` to remove elements from arrays is very inefficient. If the order of the array is irrelevant, consider doing a swap-delete.

    ```ts
    const a = [1, 2, 3, 4];

    // Has to move everything after index 1 and allocate an array for the return value
    a.splice(1, 1);

    // a is [1, 3, 4] here

    // Swaps 3 with 4, then truncates
    swapDeleteAt(a, 1);
    // Or swapDelete(a, 3) where 3 is the searched for value
    ```

    See [`swapDelete`](/reference/functions/swapDelete.html){target="\_self"}, [`swapDeleteAt`](/reference/functions/swapDeleteAt.html){target="\_self"}.

-   **Use object pools.**

    When many short-lived objects of a kind are needed an object pool might come in useful.

    ```ts
    const vecPool = new Pool<Vec2>({
        create: () => Vec2.zero(),
        reset: v => v.set(0, 0),
    });

    const v1 = vecPool.take();
    const v2 = vecPool.take();

    vecPool.return(v1);
    ```

    See [`Pool`](/reference/classes/Pool.html){target="\_self"}.

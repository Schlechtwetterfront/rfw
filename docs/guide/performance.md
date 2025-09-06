# Performance

`rfw` chooses certain abstractions, conventions, and trade-offs that can allow for great performance. It also provides some tools for the user to do the same - if they so choose.

Check out the [benchmarks](/benchmarks/) that some of these decisions are based on.

- **`for`-loop iteration can be a lot faster than iterator-based iteration (`for ... of`) or methods like `forEach`.**

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

    See [`ArraySet`](/ref/classes/ArraySet), [`ArrayMap`](/ref/classes/ArrayMap), [`SparseSet`](/ref/classes/SparseSet).

- **Disregard array order on mutations if not necessary.**

    `Array.splice` can be very inefficient to only remove elements from an array. If the order of the array is irrelevant, consider doing a swap-delete.

    ```ts
    const a = [1, 2, 3, 4];

    // Has to move everything after index 1 and allocate an array for the return value
    a.splice(1, 1);

    // a is [1, 3, 4] here

    // Swaps 3 with 4, then truncates
    swapDeleteAt(a, 1);
    // Or swapDelete(a, 3) where 3 is the searched for value
    ```

    See [`swapDelete`](/ref/functions/swapDelete), [`swapDeleteAt`](/ref/functions/swapDeleteAt).

- **Use object pools.**

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

    See [`Pool`](/ref/classes/Pool).

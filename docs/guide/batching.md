# Batching

Use batching to distribute similar render elements into batches, which can then be efficiently uploaded to and rendered by the GPU.

All default renderers only render in batches. For example, the [solar system sample](../samples/scene) sets up a mesh batcher:

<<< ../samples/scene.ts#mesh-batcher

The planet meshes get added to the batcher:

<<< ../samples/scene.ts#add-to-mesh-batcher

Later, when rendering, the planets are distributed into batches by the batcher and then drawn:

<<< ../samples/scene.ts#finalize-mesh-batches

<<< ../samples/scene.ts#render-mesh-batches

::: info Change tracking

Methods on the batcher that modify the collection of batched items (like [`add`](/ref/classes/Batcher#add), [`change`](/ref/classes/Batcher#change)) all feed into the change tracking mechanism.

:::

::: warning Queued updates

Updates to batched objects register a change but do _not_ immediately update the batch entry/storage. All changes are queued and applied in the next call to [`finalize`](/ref/classes/Batcher#finalize).

:::

## Batcher

The [batcher](/ref/classes/Batcher) is responsible for keeping track of all objects (of a kind) and distributing them into individual batches.

Batchers have heuristics to decide which objects get batched together and into how many batches.

- [`SizedBatcher`](/ref/classes/SizedBatcher): Every object must provide a size. Each batch has a maximum size. The batcher then starts new batches whenever the previous ones reach their max size.

    The size is generic and can "mean" different things in different contexts. The [`LineBatcher`](/ref/classes/LineBatcher) (size = line segment count) and [`SpriteBatcher`](/ref/classes/SpriteBatcher) (size = number of sprites) are built on this.

- [`MeshBatcher`](/ref/classes/MeshBatcher): Each object provides a mesh and a material. This is not what the batcher actually cares about, instead the meshes vertex count and the materials texture are of interest.

    The batcher "overflow" point is defined as either a max vertex count (set by the user) or a max texture count (the GPU's/driver's max texture count). This allows the batcher to group multiple meshes with different textures.

- [`TextBatcher`](/ref/classes/TextBatcher): This batcher is similar to the `MeshBatcher` (glyph count and texture count) with additional handling for fonts with multiple textures etc.

All of these derive from the base batcher and add their own heuristics into the batching.

## Batch

Batches are managed by a batcher. The user only gets batches (e.g., from the batcher's [`finalize`](/ref/classes/Batcher#finalize)) for further use - like rendering.

A batch's primary purpose is to hold the list of entries and propagate entry changes into its batch storage.

### Batch Storage

Every batch has an associated batch storage (like [`SpriteBatchStorage`](/ref/classes/SpriteBatchStorage)). Generally, a batch storage will hold one or more buffers to be uploaded to the GPU. It has two purposes:

1. Update the relevant section of the storage/buffer when an entry changes.
2. Know/store which ranges in the storage/buffer have changed since the last upload.

This allows the whole batch to have one large buffer (or one set of large buffers) that all GPU data is held in. Updated ranges of the buffers can then be uploaded only if necessary before the next render.

::: info Change tracking

This is not part of the usual change tracking mechanism but still feeds into the philosophy of only doing work when necessary.

:::

## Batch Entry

A [`BatchEntry`](/ref/classes/BatchEntry) is a wrapper around a batched object (like a [`MeshObject`](/ref/classes/MeshObject)). It holds some additional data about its place in the batch and batch storage. Calling [`add`](/ref/classes/Batcher#add) returns the created entry, which must be used to mark entries as changed or delete them.

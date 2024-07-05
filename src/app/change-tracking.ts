/**
 * Keeps track of if a change occurred. Used by the `onChange` {@link RenderMode} to decide when to
 * render.
 *
 * An {@link App} has a change tracker by default.
 *
 * @category App
 */
export class ChangeTracker {
    private _changed = true;

    /** If a change has been registered. */
    get changed() {
        return this._changed;
    }

    /**
     * Register a change. Called from any system that performs changes.
     */
    registerChange(): void {
        this._changed = true;
    }

    /**
     * Reset the change. Should only be called from the 'consumer' of the change (e.g., an {@link App}).
     */
    reset(): void {
        this._changed = false;
    }
}

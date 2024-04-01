import { Vec2 } from '../src/math';
import { Camera2D } from '../src/rendering/camera2d';

interface PanAndZoomHandle {
    cancel(): void;
    destroy(): void;
}

interface PanAndZoomOptions {
    readonly zoomValue: number;
    readonly minDistance: number;
    readonly eventFilter: (
        e: MouseEvent | TouchEvent,
    ) => 'ignore' | 'handle' | 'cancel';
}

export function usePanAndZoom(
    element: HTMLElement,
    camera: Camera2D,
    options?: Partial<PanAndZoomOptions>,
): PanAndZoomHandle {
    const optionsOrDefaults = {
        zoomValue: 0.1,
        minDistance: 10,
        eventFilter(_) {
            return 'handle';
        },
        ...options,
    } satisfies PanAndZoomOptions;
    const abortController = new AbortController();
    let dpr = window.devicePixelRatio;

    let pointerDown = false;
    let panning = false;

    const lastPosition = Vec2.ZERO;
    const initialPosition = Vec2.ZERO;
    const delta = Vec2.ZERO;
    let cumulativeDistance = 0;

    function updateDelta({ x, y }: { x: number; y: number }) {
        delta.set(lastPosition.x - x, lastPosition.y - y);

        cumulativeDistance += delta.length;

        delta.multiply(dpr);
    }

    function cancelPan() {
        pointerDown = false;
        panning = false;
        cumulativeDistance = 0;
        delta.xy = 0;
    }

    function getXY(e: MouseEvent | TouchEvent) {
        let x: number;
        let y: number;

        if (e instanceof MouseEvent) {
            x = e.clientX;
            y = e.clientY;
        } else {
            if (e.touches.length !== 1) {
                return;
            }

            x = e.touches[0]!.clientX;
            y = e.touches[0]!.clientY;
        }

        return { x, y };
    }

    function down(e: MouseEvent | TouchEvent) {
        const action = optionsOrDefaults.eventFilter(e);

        if (action !== 'handle') {
            return;
        }

        const xy = getXY(e);

        if (!xy) {
            return;
        }

        dpr = window.devicePixelRatio;

        pointerDown = true;

        initialPosition.copyFrom(xy);
        lastPosition.copyFrom(xy);
    }

    function move(e: MouseEvent | TouchEvent) {
        if (!pointerDown) {
            return;
        }

        const action = optionsOrDefaults.eventFilter(e);

        if (action === 'ignore') {
            return;
        } else if (action === 'cancel') {
            cancelPan();
            return;
        }

        const xy = getXY(e);

        if (!xy) {
            cancelPan();
            return;
        }

        updateDelta(xy);

        lastPosition.copyFrom(xy);

        if (!panning && cumulativeDistance > optionsOrDefaults.minDistance) {
            initialPosition.multiply(-1).addVec(xy);
            delta.subtractVec(initialPosition);

            panning = true;
        }

        if (panning) {
            camera.panLocallyVec(delta);
        }
    }

    function upOrCancel(e: MouseEvent | TouchEvent) {
        const xy = getXY(e);

        if (!xy) {
            return;
        }

        if (panning) {
            updateDelta(xy);

            camera.panLocallyVec(delta);
        }

        cancelPan();
    }

    const eventOptions = {
        passive: true,
        signal: abortController.signal,
    };

    element.addEventListener('mousedown', down, eventOptions);
    element.addEventListener('touchstart', down, eventOptions);

    document.addEventListener('mousemove', move, eventOptions);
    document.addEventListener('touchmove', move, eventOptions);

    document.addEventListener('mouseup', upOrCancel, eventOptions);
    document.addEventListener('touchend', upOrCancel, eventOptions);
    document.addEventListener('touchcancel', upOrCancel, eventOptions);

    element.addEventListener(
        'wheel',
        e => {
            const zoomBy =
                e.deltaY > 0
                    ? 1 - optionsOrDefaults.zoomValue
                    : 1 + optionsOrDefaults.zoomValue;
            camera.zoom(zoomBy);
        },
        eventOptions,
    );

    return {
        cancel: () => cancelPan(),
        destroy: () => abortController.abort(),
    };
}

import { Vec2 } from '../src/math';

export function spawnInGrid(
    width: number,
    height: number,
    containerWidth: number,
    containerHeight: number,
    spawner: (index: number, x: number, y: number, total: number) => void,
) {
    const rows = Math.floor(
        (containerHeight * window.devicePixelRatio) / height,
    );
    const cols = Math.floor((containerWidth * window.devicePixelRatio) / width);

    const total = rows * cols;

    for (let i = 0; i < total; i++) {
        const x = (i % cols) * width;
        const y = Math.floor(i / cols) * height;

        spawner(i, x, y, total);
    }

    return total;
}

export function* getSinePoints(
    segmentWidth: number,
    frequency: number,
    height: number,
    containerWidth: number,
    containerHeight: number,
) {
    height = Math.min(height, containerHeight);

    const steps = containerWidth / segmentWidth;

    for (let i = 0; i < steps; i++) {
        const x = i * segmentWidth;

        const r = (x / frequency) * Math.PI;
        const y = Math.sin(r) * height;

        yield new Vec2(x, y);
    }
}

export function spawnInSineWave(
    segmentWidth: number,
    widthScale: number,
    height: number,
    containerWidth: number,
    containerHeight: number,
    spawner: (index: number, x: number, y: number, total: number) => void,
) {
    height = Math.min(height, containerHeight);

    let i = 0;

    for (const p of getSinePoints(
        segmentWidth,
        widthScale,
        height,
        containerWidth,
        containerHeight,
    )) {
        spawner(i, p.x, p.y, segmentWidth);

        i++;
    }
}

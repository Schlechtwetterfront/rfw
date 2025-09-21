import { SizedObject } from '.';
import { Color } from '../colors';
import { ReadonlyVec2, Vec2 } from '../math';
import { ObjectOptions, SceneObject } from './graph';

/** @category Scene */
export class LineSegment {
    constructor(
        public before: Vec2,
        public start: Vec2,
        public end: Vec2,
        public after: Vec2,
        public length: number,
    ) {}
}

/** @category Scene */
export interface LineStyle {
    thickness: number;
    alignment: number;
    dashSize: number;
    gapSize: number;
    color: Color;
}

/** @category Scene */
export function lineStyleOrDefaults(style?: Partial<LineStyle>): LineStyle {
    return {
        thickness: 1,
        alignment: 0.5,
        dashSize: 1,
        gapSize: 0,
        color: Color.WHITE,
        ...style,
    };
}

/** @category Scene */
export interface LineOptions extends ObjectOptions {
    style?: Partial<LineStyle>;
    points?: Vec2[];
    closed?: boolean;
}

/** @category Scene */
export class LineObject extends SceneObject implements SizedObject {
    private _style: LineStyle;
    private _points: Vec2[];
    private _closed: boolean;
    private _segments: LineSegment[];

    get style(): LineStyle {
        return this._style;
    }
    set style(style: Partial<LineStyle>) {
        this._style = { ...this._style, ...style };
    }

    get points(): readonly ReadonlyVec2[] {
        return this._points;
    }
    set points(points: Vec2[]) {
        if (points.length < 2) {
            throw new Error('Line must have at least 2 points');
        }

        this._points = points;

        this._segments = this.buildLineSegments(this._segments);
    }

    get closed(): boolean {
        return this._closed;
    }
    set closed(closed: boolean) {
        this._closed = closed;

        this._segments = this.buildLineSegments(this._segments);
    }

    get segmentCount() {
        if (!this._points.length) {
            return 0;
        }

        return this._closed ? this.points.length : this.points.length - 1;
    }

    get size() {
        return this.segmentCount;
    }

    get segments(): readonly LineSegment[] {
        return this._segments;
    }

    get [Symbol.toStringTag]() {
        return `Line ${this.label}`;
    }

    constructor(options?: LineOptions) {
        super(options);

        if (options?.points && options.points.length < 2) {
            throw new Error('Line must have at least 2 points');
        }

        this._style = lineStyleOrDefaults(options?.style);
        this._points = options?.points ?? [];
        this._closed = options?.closed ?? false;
        this._segments = Array.from(this.buildLineSegments());
    }

    buildLineSegments(segments?: LineSegment[]): LineSegment[] {
        const { _points: points } = this;
        const pointCount = points.length;
        const segmentCount = this._closed ? pointCount : pointCount - 1;

        segments ??= [];

        if (segments.length > segmentCount) {
            segments.length = segmentCount;
        }

        if (this._closed) {
            for (let i = 0; i < pointCount - 1; i++) {
                const before = points[i - 1] ?? points.at(-1)!;
                const start = points[i]!;
                const end = points[i + 1]!;
                const after = points[i + 2] ?? points[0]!;

                const diffX = end.x - start.x;
                const diffY = end.y - start.y;

                const length = Math.sqrt(diffX ** 2 + diffY ** 2);

                const segment = segments[i];

                if (!segment) {
                    segments[i] = new LineSegment(
                        before,
                        start,
                        end,
                        after,
                        length,
                    );
                } else {
                    segment.before = before;
                    segment.start = start;
                    segment.end = end;
                    segment.after = after;
                    segment.length = length;
                }
            }

            const before = points[pointCount - 2]!;
            const start = points[pointCount - 1]!;
            const end = points[0]!;
            const after = points[1]!;

            const diffX = end.x - start.x;
            const diffY = end.y - start.y;

            const length = Math.sqrt(diffX ** 2 + diffY ** 2);

            const segment = segments[pointCount - 1];

            if (!segment) {
                segments[pointCount - 1] = new LineSegment(
                    before,
                    start,
                    end,
                    after,
                    length,
                );
            } else {
                segment.before = before;
                segment.start = start;
                segment.end = end;
                segment.after = after;
                segment.length = length;
            }
        } else {
            for (let i = 0; i < pointCount - 1; i++) {
                let before = points[i - 1];
                const start = points[i]!;
                const end = points[i + 1]!;
                let after = points[i + 2];

                const diffX = end.x - start.x;
                const diffY = end.y - start.y;

                const length = Math.sqrt(diffX ** 2 + diffY ** 2);

                if (!before || !after) {
                    const tangentX = diffX / length;
                    const tangentY = diffY / length;

                    if (!before) {
                        before = new Vec2(
                            start.x - tangentX,
                            start.y - tangentY,
                        );
                    }

                    if (!after) {
                        after = new Vec2(end.x + tangentX, end.y + tangentY);
                    }
                }

                const segment = segments[i];

                if (!segment) {
                    segments[i] = new LineSegment(
                        before,
                        start,
                        end,
                        after,
                        length,
                    );
                } else {
                    segment.before = before;
                    segment.start = start;
                    segment.end = end;
                    segment.after = after;
                    segment.length = length;
                }
            }
        }

        return segments;
    }
}

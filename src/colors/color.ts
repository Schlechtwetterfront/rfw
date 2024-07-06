import { TypedArray } from '../util/arrays';
import { parseHexColor } from './conversion';
import { HSL, HSLA, HSV, HSVA, RGBA } from './formats';

/**
 * RGBA color.
 *
 * @remarks
 * In [0,1] range.
 *
 * @category Color
 */
export interface ColorLike {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;
}

/**
 * Read-only interface of an RGBA color.
 *
 * @remarks
 * In [0,1] range.
 *
 * @category Color
 */
export interface ReadonlyColor extends ColorLike {
    /**
     * Check if the given components match this color's components.
     * @param epsilon - Optional, epsilon for comparison
     *
     * @remarks
     * Compares color components and alpha.
     */
    equalsWithAlpha(
        r: number,
        g: number,
        b: number,
        a: number,
        epsilon?: number,
    ): boolean;

    /**
     * Check if the given color components match this color's color components.
     * @param epsilon - Optional, epsilon for comparison
     *
     * @remarks
     * Only compares color components, ignores alpha.
     */
    equals(r: number, g: number, b: number, epsilon?: number): boolean;

    /**
     * Check if the color matches this color.
     * @param epsilon - Optional, epsilon for comparison
     *
     * @remarks
     * Compares color components and alpha.
     */
    equalsColor(other: ColorLike, epsilon?: number): boolean;

    /**
     * Check if the color matches this color.
     * @param epsilon - Optional, epsilon for comparison
     *
     * @remarks
     * Only compares color components, ignores alpha.
     */
    equalsColorWithAlpha(other: ColorLike, epsilon?: number): boolean;

    /**
     * Copy components into `array` in ARGB order.
     * @param array - Typed array
     * @param offset - Optional, offset into `array`
     * @param normalized - Optional, if `true` copy in range [0,1], otherwise copy in range [0,255] (default)
     * @returns Self
     */
    copyToARGB(array: TypedArray, offset?: number, normalized?: boolean): void;

    /**
     * Copy components into `array` in RGB order.
     * @param array - Typed array
     * @param offset - Optional, offset into `array`
     * @param normalized - Optional, if `true` copy in range [0,1], otherwise copy in range [0,255] (default)
     * @returns Self
     */
    copyToRGB(array: TypedArray, offset?: number, normalized?: boolean): void;

    /**
     * Copy components into `array` in RGBA order.
     * @param array - Typed array
     * @param offset - Optional, offset into `array`
     * @param normalized - Optional, if `true` copy in range [0,1], otherwise copy in range [0,255] (default)
     * @returns Self
     */
    copyToRGBA(array: TypedArray, offset?: number, normalized?: boolean): void;

    /**
     * Clone this color.
     */
    clone(): Color;
}

const TEMP_COLOR: number[] = [];

/**
 * RGBA color.
 *
 * @remarks
 * In [0,1] range.
 *
 * Methods generally _mutate_ the instance. Create new instances with {@link Color.clone}.
 *
 * @category Color
 */
export class Color implements ReadonlyColor, RGBA {
    /** Set all components. */
    set rgba(v: number) {
        this.r = this.g = this.b = this.a = v;
    }

    /** Set color components. */
    set rgb(v: number) {
        this.r = this.g = this.b = v;
    }

    constructor(
        public r: number = 1,
        public g: number = 1,
        public b: number = 1,
        public a: number = 1,
    ) {}

    /**
     * Set components.
     * @param r - Red
     * @param g - Green
     * @param b - Blue
     * @param a - Optional, alpha
     * @returns Self
     */
    set(r: number, g: number, b: number, a?: number): this {
        this.r = r;
        this.g = g;
        this.b = b;

        if (a != undefined) {
            this.a = a;
        }

        return this;
    }

    /**
     * Set from HSV components.
     * @param h - Hue
     * @param s - Saturation
     * @param v - Value
     * @param a - Optional, alpha
     * @returns Self
     */
    setHSV(h: number, s: number, v: number, a?: number): this {
        const chroma = v * s;
        const hh = h / 60;
        const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));

        let rr = 0;
        let gg = 0;
        let bb = 0;

        if (hh >= 0 && hh < 1) {
            rr = chroma;
            gg = x;
            bb = 0;
        } else if (hh >= 1 && hh < 2) {
            rr = x;
            gg = chroma;
            bb = 0;
        } else if (hh >= 2 && hh < 3) {
            rr = 0;
            gg = chroma;
            bb = x;
        } else if (hh >= 3 && hh < 4) {
            rr = 0;
            gg = x;
            bb = chroma;
        } else if (hh >= 4 && hh < 5) {
            rr = x;
            gg = 0;
            bb = chroma;
        } else if (hh >= 5 && hh < 6) {
            rr = chroma;
            gg = 0;
            bb = x;
        }

        const m = v - chroma;

        return this.set(rr + m, gg + m, bb + m, a);
    }

    /**
     * Set from HSL components.
     * @param h - Hue
     * @param s - Saturation
     * @param l - Lightness
     * @param a - Optional, alpha
     * @returns Self
     */
    setHSL(h: number, s: number, l: number, a?: number) {
        const chroma = (1 - Math.abs(2 * l - 1)) * s;
        const hh = h / 60;
        const x = chroma * (1 - Math.abs((hh % 2) - 1));

        let rr = 0;
        let gg = 0;
        let bb = 0;

        if (hh >= 0 && hh < 1) {
            rr = chroma;
            gg = x;
            bb = 0;
        } else if (hh >= 1 && hh < 2) {
            rr = x;
            gg = chroma;
            bb = 0;
        } else if (hh >= 2 && hh < 3) {
            rr = 0;
            gg = chroma;
            bb = x;
        } else if (hh >= 3 && hh < 4) {
            rr = 0;
            gg = x;
            bb = chroma;
        } else if (hh >= 4 && hh < 5) {
            rr = x;
            gg = 0;
            bb = chroma;
        } else if (hh >= 5 && hh < 6) {
            rr = chroma;
            gg = 0;
            bb = x;
        }

        const m = l - chroma / 2;

        return this.set(rr + m, gg + m, bb + m, a);
    }

    equalsWithAlpha(
        r: number,
        g: number,
        b: number,
        a: number,
        epsilon = Number.EPSILON,
    ): boolean {
        return (
            Math.abs(this.r - r) < epsilon &&
            Math.abs(this.g - g) < epsilon &&
            Math.abs(this.b - b) < epsilon &&
            Math.abs(this.a - a) < epsilon
        );
    }

    equals(r: number, g: number, b: number, epsilon = Number.EPSILON): boolean {
        return (
            Math.abs(this.r - r) < epsilon &&
            Math.abs(this.g - g) < epsilon &&
            Math.abs(this.b - b) < epsilon
        );
    }

    equalsColor(other: ColorLike, epsilon?: number): boolean {
        return this.equalsWithAlpha(
            other.r,
            other.g,
            other.b,
            other.a,
            epsilon,
        );
    }

    equalsColorWithAlpha(other: ColorLike, epsilon?: number): boolean {
        return this.equals(other.r, other.g, other.b, epsilon);
    }

    clone(): Color {
        return new Color(this.r, this.g, this.b, this.a);
    }

    /**
     * Copy all components from `other`.
     * @param other
     * @returns Self
     */
    copyFrom(other: ColorLike): this {
        this.r = other.r;
        this.g = other.g;
        this.b = other.b;
        this.a = other.a;

        return this;
    }

    copyToARGB(array: TypedArray, offset = 0, normalized = false): void {
        if (normalized) {
            array[0 + offset] = this.a;
            array[1 + offset] = this.r;
            array[2 + offset] = this.g;
            array[3 + offset] = this.b;
        } else {
            array[0 + offset] = this.a * 255;
            array[1 + offset] = this.r * 255;
            array[2 + offset] = this.g * 255;
            array[3 + offset] = this.b * 255;
        }
    }

    copyToRGB(array: TypedArray, offset = 0, normalized = false): void {
        if (normalized) {
            array[0 + offset] = this.r;
            array[1 + offset] = this.g;
            array[2 + offset] = this.b;
        } else {
            array[0 + offset] = this.r * 255;
            array[1 + offset] = this.g * 255;
            array[2 + offset] = this.b * 255;
        }
    }

    copyToRGBA(array: TypedArray, offset = 0, normalized = false): void {
        if (normalized) {
            array[0 + offset] = this.r;
            array[1 + offset] = this.g;
            array[2 + offset] = this.b;
            array[3 + offset] = this.a;
        } else {
            array[0 + offset] = this.r * 255;
            array[1 + offset] = this.g * 255;
            array[2 + offset] = this.b * 255;
            array[3 + offset] = this.a * 255;
        }
    }

    /**
     * Returns a read-only version of this.
     * @returns Same instance as {@link ReadonlyColor}
     *
     * @remarks
     * Does not actually make this instance read-only if typing is ignored.
     */
    asReadonly(): ReadonlyColor {
        return this;
    }

    toHSVA<T extends HSVA>(target: T): T;
    toHSVA(): HSVA;
    toHSVA<T extends HSVA>(target?: T): T | HSVA {
        if (target) {
            this.toHSV(target);
            target.a = this.a;

            return target;
        }

        return this.toHSV({ h: 0, s: 1, v: 1, a: this.a });
    }

    toHSV<T extends HSV>(target: T): T;
    toHSV(): HSV;
    toHSV<T extends HSV>(target?: T): T | HSV {
        const { r, g, b } = this;

        const xMax = Math.max(r, g, b);
        const v = xMax;

        const xMin = Math.min(r, g, b);

        const chroma = xMax - xMin;

        let h = 0;
        const s = v === 0 ? 0 : chroma / v;

        if (chroma === 0) {
            h = 0;
        } else if (Math.abs(v - r) < Number.EPSILON) {
            h = 60 * (((g - b) / chroma) % 6);
        } else if (Math.abs(v - g) < Number.EPSILON) {
            h = 60 * ((b - r) / chroma + 2);
        } else if (Math.abs(v - b) < Number.EPSILON) {
            h = 60 * ((r - g) / chroma + 4);
        }

        if (target) {
            target.h = h;
            target.s = s;
            target.v = v;

            return target;
        }

        return { h, s, v };
    }

    toHSLA<T extends HSLA>(target: T): T;
    toHSLA(): HSLA;
    toHSLA<T extends HSLA>(target?: T): T | HSLA {
        if (target) {
            this.toHSL(target);
            target.a = this.a;

            return target;
        }

        return this.toHSL({ h: 0, s: 1, l: 1, a: this.a });
    }

    toHSL<T extends HSL>(target: T): T;
    toHSL(): HSL;
    toHSL<T extends HSL>(target?: T): T | HSL {
        const { r, g, b } = this;

        const xMax = Math.max(r, g, b);
        const v = xMax;

        const xMin = Math.min(r, g, b);

        const chroma = xMax - xMin;

        let h = 0;
        const l = (xMax + xMin) / 2;
        const s =
            l === 0 || l === 1
                ? 0
                : chroma / (1 - Math.abs(2 * v - chroma - 1));

        if (chroma === 0) {
            h = 0;
        } else if (Math.abs(v - r) < Number.EPSILON) {
            h = 60 * (((g - b) / chroma) % 6);
        } else if (Math.abs(v - g) < Number.EPSILON) {
            h = 60 * ((b - r) / chroma + 2);
        } else if (Math.abs(v - b) < Number.EPSILON) {
            h = 60 * ((r - g) / chroma + 4);
        }

        if (target) {
            target.h = h;
            target.s = s;
            target.l = l;

            return target;
        }

        return { h, s, l };
    }

    /**
     * Get a CSS color string (hex) in format `#rrggbbaa`.
     * @returns CSS hex string
     */
    toCSSString(): string {
        const r = (this.r * 255).toString(16).padStart(2, '0');
        const g = (this.g * 255).toString(16).padStart(2, '0');
        const b = (this.b * 255).toString(16).padStart(2, '0');
        const a = (this.a * 255).toString(16).padStart(2, '0');

        return `#${r}${g}${b}${a}`;
    }

    static from(v: ColorLike): Color {
        return new Color(v.r, v.g, v.b, v.a);
    }

    static fromHexString(hex: string): Color {
        const colors = parseHexColor(hex, true, TEMP_COLOR);

        return new Color(...colors);
    }

    static fromHSV(h: number, s = 1, v = 1, a?: number) {
        const color = Color.white();

        color.setHSV(h, s, v, a);

        return color;
    }

    static fromHSL(h: number, s = 1, l = 1, a?: number) {
        const color = Color.white();

        color.setHSL(h, s, l, a);

        return color;
    }

    static black() {
        return new Color(0, 0, 0, 1);
    }

    static white() {
        return new Color(1, 1, 1, 1);
    }

    static transparent() {
        return new Color(0, 0, 0, 0);
    }

    static red() {
        return new Color(1, 0, 0, 1);
    }

    static green() {
        return new Color(0, 1, 0, 1);
    }

    static blue() {
        return new Color(0, 0, 1, 1);
    }
}

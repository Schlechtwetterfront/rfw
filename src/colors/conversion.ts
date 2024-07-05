/** @category Color */
export type RGBATuple = [r: number, g: number, b: number, a: number];

/**
 * Parse a hex color in format `#rgb`, `#rgba`, `#rrggbb`, or `#rrggbbaa` into a tuple.
 * @param hex - Hex color string
 * @param normalize - If `true`, write values in range [0,1] otherwise [0,255]
 * @param target - Optional, target tuple
 * @returns RGBA tuple
 *
 * @category Color
 */
export function parseHexColor(
    hex: string,
    normalize: boolean,
    target?: number[],
): RGBATuple {
    target ??= [0, 0, 0, 0];

    let r = 0;
    let g = 0;
    let b = 0;
    let a = 255;

    let length = hex.length;

    if (hex[0] === '#') {
        length--;
        hex = hex.substring(1);
    }

    if (length < 3 || length === 5 || length === 7 || length > 8) {
        throw new Error(
            `Invalid format '${hex}', expected #rgb, #rgba, #rrggbb or #rrggbbaa (# optional)`,
        );
    }

    if (length >= 3 && length <= 4) {
        const rc = hex[0]!;
        r = parseInt(rc + rc, 16);

        const gc = hex[1]!;
        g = parseInt(gc + gc, 16);

        const bc = hex[2]!;
        b = parseInt(bc + bc, 16);

        if (length === 4) {
            const ac = hex[3]!;
            a = parseInt(ac + ac, 16);
        }
    } else if (length >= 6 && length <= 8) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);

        if (length === 8) {
            a = parseInt(hex.substring(6, 8), 16);
        }
    }

    const factor = normalize ? 255 : 1;

    target[0] = r / factor;
    target[1] = g / factor;
    target[2] = b / factor;
    target[3] = a / factor;

    return target as RGBATuple;
}

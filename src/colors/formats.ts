/** @category Color */
export interface HSV {
    h: number;
    s: number;
    v: number;
}

/** @category Color */
export interface HSVA extends HSV {
    a: number;
}

/** @category Color */
export interface HSL {
    h: number;
    s: number;
    l: number;
}

/** @category Color */
export interface HSLA extends HSL {
    a: number;
}

/** @category Color */
export interface RGB {
    r: number;
    g: number;
    b: number;
}

/** @category Color */
export interface RGBA extends RGB {
    a: number;
}

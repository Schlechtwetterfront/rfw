export interface HSV {
    h: number;
    s: number;
    v: number;
}

export interface HSVA extends HSV {
    a: number;
}

export interface HSL {
    h: number;
    s: number;
    l: number;
}

export interface HSLA extends HSL {
    a: number;
}

export interface RGB {
    r: number;
    g: number;
    b: number;
}

export interface RGBA extends RGB {
    a: number;
}

import { Font, Glyph } from '.';
import { Vec2 } from '../math';
import { Rect } from '../math/shapes';
import { TextureHandle } from '../rendering/textures';

export interface BMFontChar {
    id: number;
    index: number;
    char: string;
    width: number;
    height: number;
    xoffset: number;
    yoffset: number;
    xadvance: number;
    chnl: number;
    x: number;
    y: number;
    page: number;
}

export interface BMFont {
    pages: string[];
    chars: BMFontChar[];
    info: {
        face: string;
        size: number;
        bold: number;
        italic: number;
        charset: string[];
        unicode: number;
        stretchH: number;
        smooth: number;
        aa: number;
        padding: [number, number, number, number];
        spacing: [number, number];
        outline: number;
    };
    common: {
        lineHeight: number;
        base: number;
        scaleW: number;
        scaleH: number;
        pages: number;
        packed: number;
        alphaChnl: number;
        redChnl: number;
        greenChnl: number;
        blueChnl: number;
    };
    distanceField: {
        fieldType: 'none' | 'msdf' | 'sdf';
        distanceRange: number;
    };
    kernings: [];
}

export function createFontFromBMFont(
    raw: BMFont,
    pages: TextureHandle[],
): Font {
    const glyphs = new Array<Glyph>();

    for (const char of raw.chars) {
        const glyph = new Glyph(
            char.id,
            char.char,
            new Rect(char.x, char.y, char.width, char.height),
            char.xadvance,
            char.page,
            new Vec2(char.xoffset, char.yoffset),
        );

        glyphs.push(glyph);
    }

    return new Font(
        raw.info.face,
        raw.info.size,
        raw.common.lineHeight,
        raw.common.base,
        new Vec2(raw.common.scaleW, raw.common.scaleH),
        pages,
        raw.distanceField.distanceRange,
        glyphs,
    );
}

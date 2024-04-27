import { ReadOnlyVec2, Vec2 } from '../math';
import { TextLike } from '../renderers/text';
import {
    Font,
    TextLayout,
    TextStyle,
    layoutChars,
    textStyleOrDefaults,
} from '../text';
import { Char, toChars } from '../text/chars';
import { ObjectOptions, SceneObject } from './graph';

export interface TextOptions extends ObjectOptions {
    text: string;
    font: Font;
    style?: Partial<TextStyle>;
    width?: number;
    anchor?: Vec2;
}

// todo: Spans
export class TextObject extends SceneObject implements TextLike {
    private _text: string;
    private _style: TextStyle;
    private _chars: Char[];
    private _layout!: TextLayout;
    private _font: Font;
    private _width: number;
    private _anchor: Vec2;

    get text(): string {
        return this._text;
    }
    set text(s: string) {
        this._text = s;
        this._chars = toChars(s);

        this.relayout();
    }

    get charCount() {
        return this._chars.length;
    }

    get style(): TextStyle {
        return this._style;
    }
    set style(style: Partial<TextStyle>) {
        this._style = { ...this._style, ...style };

        this.relayout();
    }

    get font(): Font {
        return this._font;
    }
    set font(font: Font) {
        this._font = font;

        this.relayout();
    }

    get lineHeight(): number {
        return this.font.getLineHeight(this.style.size, this.style.lineHeight);
    }

    get layout(): TextLayout {
        return this._layout;
    }

    get width(): number {
        return this._width;
    }
    set width(width: number) {
        this._width = width;

        this.relayout();
    }

    get anchor(): ReadOnlyVec2 {
        return this._anchor;
    }
    set anchor(anchor: Vec2) {
        this._anchor = anchor;
    }

    get [Symbol.toStringTag]() {
        return `Text ${this.label}`;
    }

    constructor(options: TextOptions) {
        super(options);

        this._text = options.text;
        this._chars = toChars(this._text);
        this._font = options.font;
        this._style = textStyleOrDefaults(options.style);
        this._width = options.width ?? Number.POSITIVE_INFINITY;
        this._anchor = options.anchor ?? Vec2.zero();

        this.relayout();
    }

    private relayout() {
        this._layout = layoutChars(this._chars, this._style, this._font, {
            maxLineWidth: this.width,
        });
    }
}

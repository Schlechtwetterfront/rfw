# Text

`rfw` comes with a multi-channel signed distance field (MSDF) text renderer.

See it in action in the [text sample](/samples/text).

## Integrating a Font

The necessary files (font description in [BMFont](https://www.angelcode.com/products/bmfont/doc/file_format.html) JSON and glyph atlases) can easily be generated with [`msdf-bmfont-xml`](https://github.com/soimy/msdf-bmfont-xml).

```sh
msdf-bmfont OpenSans-Regular.ttf -f json --smart-size --pot
```

The result can then be loaded:

<<< @/samples/text.ts#Loading

And used with `TextObject`s:

<<< @/samples/text.ts#Text

<<< @/samples/text.ts#Author

## Text Style

Size (in pixels) can be set with `style.size`, line height (either in pixels or relative) with `style.lineHeight`.

Text align within the bounds can be specified with `style.align`. `TextObject`s `anchor` property controls where the text will be rendered relative to its position.

`style.break` controls line break behavior.

See [`TextObject`](/reference/classes/TextObject.html){target="\_self"}, [`TextStyle`](/reference/interfaces/TextStyle.html){target="\_self"}, [`TextLayout`](/reference/classes/TextLayout.html){target="\_self"}.

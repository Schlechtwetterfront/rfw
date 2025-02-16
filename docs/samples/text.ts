import SERIF_DATA from '../../samples/assets/Merriweather-Regular.json';
import SERIF_ATLAS_URL from '../../samples/assets/Merriweather-Regular.png';

import SANS_DATA from '../../samples/assets/NotoSans-Regular.json';
import SANS_ATLAS_URL from '../../samples/assets/NotoSans-Regular.png';

import {
    BMFont,
    CanvasApp,
    Color,
    createFontFromBMFont,
    Font,
    TextBatcher,
    TextObject,
    vec,
    WGLDriver,
    WGLTextRenderer,
} from '../../src';

const BACKGROUND_COLOR = Color.fromHexString('#fefefa');

export class TextApp extends CanvasApp<WGLDriver> {
    private readonly textRenderer = new WGLTextRenderer(this.driver);
    private readonly textBatcher = new TextBatcher({
        changeTracker: this.changeTracker,
        maxTextureCount: this.driver.textures.maxTextureCount,
    });

    private serifFont!: Font;
    private sansFont!: Font;

    private text!: TextObject;
    private author!: TextObject;

    override async initialize(): Promise<void> {
        await super.initialize();

        // #region Loading
        const [serifTexture, sansTexture] = await Promise.all([
            this.textures.addFromURL(SERIF_ATLAS_URL),
            this.textures.addFromURL(SANS_ATLAS_URL),
        ]);

        this.serifFont = createFontFromBMFont(SERIF_DATA as BMFont, [
            serifTexture,
        ]);
        this.sansFont = createFontFromBMFont(SANS_DATA as BMFont, [
            sansTexture,
        ]);
        // #endregion Loading

        // #region Text
        this.text = new TextObject({
            x: 48,
            y: 100,
            anchor: vec(0, 1),
            font: this.serifFont,
            text: 'We met and we part\nAll that remains are\nTraces of brush and ink',
            style: {
                size: 40,
                color: Color.fromHexString('#000'),
            },
        });
        // #endregion Text

        // #region Author
        this.author = new TextObject({
            x: 500,
            y: 60,
            font: this.sansFont,
            text: '- Daigu Ryokan',
            style: {
                size: 20,
                color: Color.fromHexString('#654'),
                align: 'end',
            },
        });
        // #endregion Author

        this.transforms.change(this.text);
        this.transforms.change(this.author);

        this.textBatcher.add(this.text);
        this.textBatcher.add(this.author);
    }

    protected override render(): void {
        super.render();

        this.driver.useRenderTarget('canvas');

        this.driver.clear(BACKGROUND_COLOR);

        this.textRenderer.render(this.textBatcher.finalize());
    }
}

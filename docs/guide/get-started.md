# Quick Start

Install via `npm` or your preferred package manager:

```sh
npm install rfw2d
```

Import from `rfw2d`:

```typescript
import { App, Vec2, Color } from 'rfw2d';

// ...
```

Create your application:

```typescript
import { CanvasApp, Color, WGLDriver } from 'rfw2d';

const BACKGROUND_COLOR = new Color(0.2, 0.2, 0.2);

export class MyApp extends CanvasApp<WGLDriver> {
    // This is the render 'pass'.
    protected override render(): void {
        // The canvas app does some default setup for rendering.
        super.render();

        // Clear our viewport to a color.
        this.driver.clearViewport(BACKGROUND_COLOR);
    }
}

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const driver = await WGLDriver.fromCanvas(canvas);

const app = new MyApp(canvas, driver);

await app.initializeAndStart();
```

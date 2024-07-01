import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'rfw',
    description: 'A WebGL2-powered 2D rendering library.',
    base: '/rfw/',
    themeConfig: {
        nav: [
            { text: 'Guide', link: '/guide/intro' },
            { text: 'Samples', link: '/samples/intro' },
        ],

        sidebar: {
            '/guide/': [
                {
                    text: 'Guide',
                    items: [
                        { text: 'Introduction', link: '/guide/intro' },
                        { text: 'Quick Start', link: '/guide/get-started' },
                    ],
                },
            ],
            '/samples/': [
                {
                    text: 'Samples',
                    items: [
                        { text: 'Introduction', link: '/samples/intro' },
                        { text: 'Simple Scene', link: '/samples/scene' },
                        { text: 'Bunnymark', link: '/samples/bunnymark' },
                        { text: 'Quad Tree', link: '/samples/quadtree' },
                        { text: 'Render Mode', link: '/samples/render-mode' },
                    ],
                },
            ],
        },

        socialLinks: [
            {
                icon: 'github',
                link: 'https://github.com/Schlechtwetterfront/rfw',
            },
        ],
    },
});

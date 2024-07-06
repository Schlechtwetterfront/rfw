import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'rfw',
    description: 'A WebGL2-powered 2D rendering library.',
    base: '/rfw/',
    themeConfig: {
        nav: [
            { text: 'Guide', link: '/guide/' },
            { text: 'Samples', link: '/samples/' },
            { text: 'API Reference', link: '/reference/', target: '_self' },
        ],

        sidebar: {
            '/guide/': [
                {
                    text: 'Guide',
                    items: [
                        { text: 'Introduction', link: '/guide/' },
                        { text: 'Quick Start', link: '/guide/get-started' },
                        { text: 'Math', link: '/guide/math' },
                        { text: 'Rendering', link: '/guide/rendering' },
                    ],
                },
                {
                    text: 'Advanced',
                    items: [
                        { text: 'Batching', link: '/guide/batching' },
                        { text: 'Buffers', link: '/guide/buffers' },
                        { text: 'Performance', link: '/guide/performance' },
                    ],
                },
            ],
            '/samples/': [
                {
                    text: 'Samples',
                    items: [
                        { text: 'Introduction', link: '/samples/' },
                        { text: 'Simple Scene', link: '/samples/scene' },
                        { text: 'Bunnymark', link: '/samples/bunnymark' },
                        { text: 'Quad Tree', link: '/samples/quadtree' },
                        { text: 'Render Mode', link: '/samples/render-mode' },
                    ],
                },
            ],
            '/benchmarks/': [
                {
                    text: 'Benchmarks',
                    items: [
                        { text: 'Introduction', link: '/benchmarks/' },
                        { text: 'Iteration', link: '/benchmarks/iter' },
                        {
                            text: 'Array Delete',
                            link: '/benchmarks/array-delete',
                        },
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

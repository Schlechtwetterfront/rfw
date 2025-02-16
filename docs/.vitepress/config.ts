import MarkdownIt from 'markdown-it';
import { defineConfig } from 'vitepress';

const REF_RE = /ref\/([^/]+)\/([^#]+)(#.+)?/;

const refLinkPlugin = (md: MarkdownIt) => {
    const link_open = md.renderer.rules.link_open;

    md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        const token = tokens[idx]!;

        const href = token.attrGet('href');

        if (href) {
            const match = REF_RE.exec(href);

            if (match) {
                token.attrSet(
                    'href',
                    href.replace(
                        REF_RE,
                        `reference/${match[1]}/${match[2]}.html${match[3] ?? ''}`,
                    ),
                );

                token.attrSet('target', '_self');
            }
        }

        return (
            link_open?.(tokens, idx, options, env, self) ??
            self.renderToken(tokens, idx, options)
        );
    };
};

// https://vitepress.dev/ref/site-config
export default defineConfig({
    markdown: {
        config(md) {
            md.use(refLinkPlugin);
        },
    },
    ignoreDeadLinks: [/^\/reference\//],
    title: 'rfw',
    description: 'A WebGL2-powered 2D rendering library.',
    base: '/rfw/',
    themeConfig: {
        nav: [
            { text: 'Guide', link: '/guide/' },
            { text: 'Samples', link: '/samples/' },
            { text: 'API Reference', link: '/ref/', target: '_self' },
        ],

        sidebar: {
            '/guide/': [
                {
                    text: 'Getting Started',
                    items: [
                        { text: 'Introduction', link: '/guide/' },
                        { text: 'Quick Start', link: '/guide/get-started' },
                    ],
                },
                {
                    text: 'Drawing',
                    items: [
                        { text: 'Meshes', link: '/guide/meshes' },
                        { text: 'Text', link: '/guide/text' },
                        { text: 'Lines', link: '/guide/lines' },
                    ],
                },
                {
                    text: 'Essentials',
                    items: [
                        { text: 'Math', link: '/guide/math' },
                        { text: 'Rendering', link: '/guide/rendering' },
                        { text: 'Batching', link: '/guide/batching' },
                    ],
                },
                {
                    text: 'Advanced',
                    items: [
                        { text: 'Performance', link: '/guide/performance' },
                    ],
                },
            ],
            '/samples/': [
                {
                    text: 'Samples',
                    items: [
                        { text: 'Introduction', link: '/samples/' },
                        {
                            text: 'Solar System',
                            link: '/samples/scene',
                        },
                        { text: 'On Drawing', link: '/samples/text' },
                        { text: 'Bunnymark', link: '/samples/bunnymark' },
                        { text: 'Quad Tree', link: '/samples/quadtree' },
                        { text: 'Render Mode', link: '/samples/render-mode' },
                        {
                            text: 'Render to Texture',
                            link: '/samples/render-to-texture',
                        },
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

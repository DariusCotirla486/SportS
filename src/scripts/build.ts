import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildWorker() {
    try {
        await build({
            entryPoints: [path.join(__dirname, 'worker.ts')],
            bundle: true,
            outfile: path.join(__dirname, 'worker.js'),
            platform: 'node',
            format: 'esm',
            target: 'node20',
            external: [
                'pg',
                'events',
                'stream',
                'util',
                'buffer',
                'crypto',
                'net',
                'tls',
                'dns',
                'fs',
                'path',
                'os',
                'url',
                'http',
                'https',
                'zlib',
                'assert',
                'constants',
                'querystring',
                'string_decoder',
                'timers',
                'worker_threads'
            ]
        });
        console.log('Worker built successfully');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

buildWorker(); 
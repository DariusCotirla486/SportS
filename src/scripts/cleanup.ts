import { Worker } from 'node:worker_threads';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runCleanup() {
    const worker = new Worker(path.join(__dirname, 'worker.js'));

    return new Promise((resolve, reject) => {
        let currentOperation = 'cleanupStock';
        const operations = ['cleanupStock', 'cleanupItems', 'cleanupCategories'];

        worker.on('message', (result) => {
            if (result.success) {
                console.log(result.message);
                
                // Move to next operation
                const currentIndex = operations.indexOf(currentOperation);
                if (currentIndex < operations.length - 1) {
                    currentOperation = operations[currentIndex + 1];
                    worker.postMessage({ type: currentOperation });
                } else {
                    resolve(result);
                }
            } else {
                console.error('Error:', result.error);
                reject(new Error(result.error));
            }
        });

        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });

        // Start with the first operation
        worker.postMessage({ type: currentOperation });
    });
}

// Run the cleanup
runCleanup()
    .then(() => {
        console.log('Cleanup completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }); 
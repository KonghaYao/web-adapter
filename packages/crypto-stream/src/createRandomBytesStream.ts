import { randomBytes } from 'node:crypto';

/** 生成随机数据 */

export function createRandomBytesStream(size: number, perSize = 16) {
    let lastBytes = size;

    return new ReadableStream<Uint8Array>({
        pull(controller) {
            if (lastBytes <= 0) return;
            let usedBytes = perSize;
            if (lastBytes > usedBytes) {
                lastBytes -= usedBytes;
            } else {
                usedBytes = lastBytes;
                lastBytes = 0;
            }
            const buffer = randomBytes(usedBytes);
            controller.enqueue(buffer);
            if (lastBytes === 0) controller.close();
        }
    });
}

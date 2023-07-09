import { createHash } from 'node:crypto';
import { Transform } from 'node:stream';

export const createHashStream = (...args: Parameters<typeof createHash>) => Transform.toWeb(createHash(...args)) as TransformStream<Uint8Array, Uint8Array>;

import { createHash, createHmac } from 'node:crypto';
import { Transform } from 'node:stream';

export const createHashStream = (...args: Parameters<typeof createHash>) => Transform.toWeb(createHash(...args)) as TransformStream<Uint8Array, Uint8Array>;
export const createHmacStream = (...args: Parameters<typeof createHmac>) => Transform.toWeb(createHmac(...args)) as TransformStream<Uint8Array, Uint8Array>;

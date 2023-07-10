import { createHash, createHmac } from 'node:crypto';
import { Transform } from 'node:stream';
import { BinaryLike } from './interface';

export const createHashStream = (...args: Parameters<typeof createHash>) => Transform.toWeb(createHash(...args)) as TransformStream<BinaryLike, BinaryLike>;
export const createHmacStream = (...args: Parameters<typeof createHmac>) => Transform.toWeb(createHmac(...args)) as TransformStream<BinaryLike, BinaryLike>;

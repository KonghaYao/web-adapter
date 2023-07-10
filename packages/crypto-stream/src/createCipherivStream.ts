import { createCipheriv, createDecipheriv } from 'node:crypto';
import { Transform } from 'node:stream';
import { BinaryLike } from './interface';

/** 对称加密流 */
export const createCipherivStream = (...args: Parameters<typeof createCipheriv>) => Transform.toWeb(createCipheriv(...args)) as TransformStream<BinaryLike, BinaryLike>;
/** 对称解密流 */
export const createDecipherivStream = (...args: Parameters<typeof createDecipheriv>) => Transform.toWeb(createDecipheriv(...args)) as TransformStream<BinaryLike, BinaryLike>;

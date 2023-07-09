import { createCipheriv, createDecipheriv } from 'node:crypto';
import { Transform } from 'node:stream';

/** 对称加密流 */
export const createCipherivStream = (...args: Parameters<typeof createCipheriv>) => Transform.toWeb(createCipheriv(...args)) as TransformStream<Uint8Array, Uint8Array>;
/** 对称解密流 */
export const createDecipherivStream = (...args: Parameters<typeof createDecipheriv>) => Transform.toWeb(createDecipheriv(...args)) as TransformStream<Uint8Array, Uint8Array>;

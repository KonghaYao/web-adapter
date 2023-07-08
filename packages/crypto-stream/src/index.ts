import { randomBytes, createHash, createCipheriv, createDecipheriv } from 'node:crypto';
import { Transform } from 'node:stream'
export const createHashStream = (...args: Parameters<typeof createHash>) => Transform.toWeb(createHash(...args)) as TransformStream<Uint8Array, Uint8Array>


/** 对称加密流 */
export const createCipherivStream = (...args: Parameters<typeof createCipheriv>) => Transform.toWeb(createCipheriv(...args)) as TransformStream<Uint8Array, Uint8Array>
/** 对称解密流 */
export const createDecipherivStream = (...args: Parameters<typeof createDecipheriv>) => Transform.toWeb(createDecipheriv(...args)) as TransformStream<Uint8Array, Uint8Array>


function mergeUint8Arrays(arrays: Uint8Array[]) {
    // 计算所有数组元素的总长度
    const totalLength = arrays.reduce((length, array) => length + array.length, 0);

    // 创建一个新的 Uint8Array
    const mergedArray = new Uint8Array(totalLength);

    // 使用 set 方法将每个数组依次合并到新数组中
    let offset = 0;
    arrays.forEach(array => {
        mergedArray.set(array, offset);
        offset += array.length;
    });

    return mergedArray;
}
export const getFinalDataFromStream = <T extends Uint8Array | string>(readable: ReadableStream<T>) => {
    return new Promise<T>((res, rej) => {
        let type: 'uint8' | "string" = 'uint8'
        let last: T
        readable.pipeTo(new WritableStream({
            write(chunk) {
                if (!last) {
                    last = chunk
                    if (typeof last === 'string') {
                        type = 'string'
                    } else {
                        type = 'uint8'
                    }
                    return
                } else {
                    switch (type) {
                        case "string":
                            /**@ts-ignore */
                            last += chunk as string;
                            break;
                        case "uint8":
                            /**@ts-ignore */
                            last = mergeUint8Arrays([last as Uint8Array, chunk as Uint8Array])
                            break;
                    }
                }

            },
            close() {
                res(last)
            },
        }))
    })
}

export class HexEncoderStream extends TransformStream<Uint8Array, string>{
    constructor() {
        super({
            transform(chunk, controller) {
                let hexString = '';
                for (let i = 0; i < chunk.length; i++) {
                    const hexValue = chunk[i].toString(16).padStart(2, '0');
                    hexString += hexValue;
                }
                controller.enqueue(hexString)
            }
        })
    }
}
export class HexDecodeStream extends TransformStream<string, Uint8Array> {
    constructor() {
        super({
            transform(hexString, controller) {
                const byteArray = new Uint8Array(hexString.length / 2);

                for (let i = 0; i < hexString.length / 2; i++) {
                    const hexValue = parseInt(hexString.slice(i * 2, i * 2 + 2), 16);
                    byteArray[i] = hexValue;
                }

                controller.enqueue(byteArray);
            }
        });
    }
}
/** 生成随机数据 */
export function createRandomBytesStream(size: number, perSize = 16) {
    let lastBytes = size;

    return new ReadableStream<Uint8Array>({
        pull(controller) {
            if (lastBytes <= 0) return;
            let usedBytes = perSize
            if (lastBytes > usedBytes) {
                lastBytes -= usedBytes
            } else {
                usedBytes = lastBytes
                lastBytes = 0
            }
            const buffer = randomBytes(usedBytes);
            controller.enqueue(buffer)
            if (lastBytes === 0) controller.close()
        }
    });
}
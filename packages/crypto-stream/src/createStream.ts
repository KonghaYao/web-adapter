import { BinaryLike, TypedArray } from "./interface"

interface createStream {
    (input: string): ReadableStream<string>
}
export const createStream = <T extends TypedArray | string>(input: T,
    /** 每个chunk 的具体大小，string 为字符，arraybuffer 为 uint8array的具体数值 */
    chunkLength = 16,
    /** 可以进行梯度递进延迟传输 */
    stepDelayTime = 0
) => {

    return new ReadableStream<T>({
        async start(controller) {
            let index = 0
            const inputAdapt = typeof input === 'string' ? input : new Uint8Array(input)
            for await (const chunk of getChunk(inputAdapt, chunkLength)) {
                setTimeout(() => {
                    controller.enqueue(chunk as T)
                }, stepDelayTime * index)
                index++
            }
            setTimeout(() => {
                controller.close()
            }, stepDelayTime * index);

        }
    })
}



const getChunk = function*<T extends Uint8Array | string>(input: T, size = 16) {

    const time = Math.ceil(input.length / size)
    for (let index = 0; index < time; index++) {
        yield input.slice(size * index, size * (index + 1))
    }
}
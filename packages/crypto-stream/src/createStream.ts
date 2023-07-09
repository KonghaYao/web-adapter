interface createStream {
    (input: string): ReadableStream<string>
}
export const createStream = <T extends string | Uint8Array>(input: T,
    /** 每个chunk 的具体大小，string 为字符，arraybuffer 为 uint8array的具体数值 */
    chunkLength = 16,
    /** 可以进行梯度递进延迟传输 */
    stepDelayTime = 0
) => {

    return new ReadableStream<T>({
        async start(controller) {
            let index = 0
            for await (const chunk of getChunk(input as Uint8Array | string, chunkLength)) {

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
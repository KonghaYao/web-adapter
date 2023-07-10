import { BinaryLike } from "./interface";
import { mergeUint8Arrays } from "./utils/mergeUint8Arrays";

export const getFinalDataFromStream = <T extends BinaryLike>(readable: ReadableStream<T>) => {
    return new Promise<T>((res, rej) => {
        let type: 'buffer' | "string" = 'buffer';
        let last: T;
        readable.pipeTo(new WritableStream({
            abort: (e) => {

                rej(e)
            },
            write(chunk) {
                if (!last) {
                    last = chunk;
                    if (typeof last === 'string') {
                        type = 'string';
                    }
                    return;
                } else {
                    switch (type) {
                        case "string":
                            /**@ts-ignore */
                            last += chunk as string;
                            break;
                        default:
                            /**@ts-ignore */
                            last = mergeUint8Arrays([new Uint8Array(last), new Uint8Array(chunk)]);
                            break;
                    }
                }

            },
            close() {
                res(last);
            },
        }));
    });
};

export const getFinalDataFromStreams = (...args: ReadableStream[]) => {
    return Promise.all(args.map(i => getFinalDataFromStream(i)))
}
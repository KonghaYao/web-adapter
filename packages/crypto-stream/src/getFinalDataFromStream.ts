import { mergeUint8Arrays } from "./utils/mergeUint8Arrays";

export const getFinalDataFromStream = <T extends Uint8Array | string>(readable: ReadableStream<T>) => {
    return new Promise<T>((res, rej) => {
        let type: 'uint8' | "string" = 'uint8';
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
                    } else {
                        type = 'uint8';
                    }
                    return;
                } else {
                    switch (type) {
                        case "string":
                            /**@ts-ignore */
                            last += chunk as string;
                            break;
                        case "uint8":
                            /**@ts-ignore */
                            last = mergeUint8Arrays([last as Uint8Array, chunk as Uint8Array]);
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

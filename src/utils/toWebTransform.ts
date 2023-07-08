import { Writable, Transform } from "node:stream";
class StreamWritable extends Writable {
    constructor() {
        super();
    }

    _write(chunk: Uint8Array, _: string, callback: Function) {
        this.cb(chunk);
        callback();
    }
    cb = (_: Uint8Array) => { };
    error() { }
}
/** 
 * make nodejs Transform available in Web Streams API 
 * @example const decode = toWebTransform(createDecipheriv("aes-256-gcm", key, iv));
*/
export const toWebTransform = (t: Transform) => {
    return new TransformStream({
        start(controller) {
            const writable = new StreamWritable();
            t.pipe(writable);
            writable.cb = (chunk) => controller.enqueue(chunk);
        },
        transform(chunk) {
            t.write(chunk);
        },
    });
};
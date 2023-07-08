import { Writable } from "stream";
class MyWritable extends Writable {
    constructor(options) {
        super(options);
    }

    _write(chunk, encoding, callback) {
        this.cb(chunk);
        callback();
    }
    cb = () => {};
    error() {}
}
const nodeTransformToWeb = (t) => {
    return new TransformStream({
        start(controller) {
            const writable = new MyWritable();
            t.pipe(writable);
            writable.cb = (chunk) => controller.enqueue(chunk);
        },
        transform(chunk, controller) {
            t.write(chunk);
        },
    });
};
import { createCipheriv, randomBytes, createDecipheriv } from "node:crypto";
import { outputFile } from "fs-extra";
const key = randomBytes(32);
const iv = randomBytes(16);

const chunks = [];
const encode = nodeTransformToWeb(createCipheriv("aes-256-gcm", key, iv));
const decode = nodeTransformToWeb(createDecipheriv("aes-256-gcm", key, iv));
console.log("open");
fetch("https://api.publicapis.org/entries")
    .then((res) => res.body)
    .then((res) =>
        res
            .pipeThrough(encode)
            .pipeThrough(decode)
            .pipeThrough(new TextDecoderStream())
            .pipeTo(
                new WritableStream({
                    write(chunk) {
                        chunks.push(chunk);
                    },
                    close() {
                        outputFile("./test.json", chunks.join(""));
                    },
                })
            )
    );

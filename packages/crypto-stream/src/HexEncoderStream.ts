
export class HexEncoderStream extends TransformStream<Uint8Array, string> {
    constructor() {
        super({
            transform(chunk, controller) {
                let hexString = '';
                for (let i = 0; i < chunk.length; i++) {
                    const hexValue = chunk[i].toString(16).padStart(2, '0');
                    hexString += hexValue;
                }
                controller.enqueue(hexString);
            }
        });
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

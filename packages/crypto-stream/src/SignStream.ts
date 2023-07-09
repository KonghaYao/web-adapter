import { createSign, createVerify, KeyLike, SignKeyObjectInput, SignPrivateKeyInput, VerifyKeyObjectInput, VerifyPublicKeyInput, VerifyJsonWebKeyInput } from 'node:crypto';

export class SignStream extends TransformStream<Uint8Array, Uint8Array> {
    constructor(privateKey: KeyLike | SignKeyObjectInput | SignPrivateKeyInput, ...args: Parameters<typeof createSign>) {
        const sign = createSign(...args);
        super({
            transform(chunk, controller) {
                sign.update(chunk);
            },
            flush(controller) {
                sign.end();
                controller.enqueue(sign.sign(privateKey));
            }
        });
    }
}
export class VerifyError extends Error {
}
export class VerifyStream extends TransformStream<Uint8Array, Uint8Array> {
    constructor(publicKey: KeyLike | VerifyKeyObjectInput | VerifyPublicKeyInput | VerifyJsonWebKeyInput, signature: Uint8Array, ...args: Parameters<typeof createVerify>) {
        const verify = createVerify(...args);
        super({
            transform(chunk, controller) {
                verify.update(chunk);
                controller.enqueue(chunk);
            },

            flush(controller) {
                verify.end();
                const isValid = verify.verify(publicKey, signature);
                if (!isValid) controller.error(new VerifyError('stream: verify failed'));
            }
        });
    }
}

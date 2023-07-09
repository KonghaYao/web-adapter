// @vitest-environment node
import { getFinalDataFromStream } from "../index";
import { createRandomBytesStream } from "../index";
import { HexDecodeStream, HexEncoderStream } from "../index";
import { createHashStream, createHmacStream } from "../index";
import { expect, test } from "vitest";
import {
    createHash,
    randomBytes,
    createHmac,
    generateKeyPairSync,
} from "node:crypto";
import { createCipherivStream, createDecipherivStream } from "../index";
import { SignStream, VerifyStream } from "../index";
test("Hex Test", async () => {
    const [main, copied] = createRandomBytesStream(100).tee();
    const [hexMain, hexCopied] = main.pipeThrough(new HexEncoderStream()).tee();
    const [hexed, originLike, origin] = await Promise.all([
        /** hex 化 */
        getFinalDataFromStream(hexMain),
        /** hex 化后还原 */
        getFinalDataFromStream(hexCopied.pipeThrough(new HexDecodeStream())),

        /** 原始数据 */
        getFinalDataFromStream(copied),
    ] as const);

    expect(hexed).to.eq(Buffer.from(origin).toString("hex")); // 测试 hex 化效果
    expect(Buffer.from(origin).toString("hex")).eql(
        Buffer.from(originLike).toString("hex")
    ); // 测试 hex 还原效果
});
test("Hmac Test", async () => {
    const [main, copied] = createRandomBytesStream(100).tee();
    const key = randomBytes(32);
    const [res, hashed] = await Promise.all([
        // hmac
        getFinalDataFromStream(
            main
                .pipeThrough(createHmacStream("sha256", key))
                .pipeThrough(new HexEncoderStream())
        ),
        // 原始数据
        getFinalDataFromStream(copied),
    ] as const);

    const right = createHmac("sha256", key);
    right.update(hashed);
    expect(res).eq(right.digest("hex"));
});
test("Hash Test", async () => {
    const [main, copied] = createRandomBytesStream(100).tee();
    const [res, hashed] = await Promise.all([
        // hash
        getFinalDataFromStream(
            main
                .pipeThrough(createHashStream("sha256"))
                .pipeThrough(new HexEncoderStream())
        ),
        // 原始数据
        getFinalDataFromStream(copied),
    ] as const);

    const right = createHash("sha256");
    right.update(hashed);
    expect(res).eq(right.digest("hex"));
});
test("Hash Test", async () => {
    const [main, copied] = createRandomBytesStream(100).tee();
    const key = randomBytes(32);
    const iv = randomBytes(16);
    const [res, hashed] = await Promise.all([
        // hash
        getFinalDataFromStream(
            main
                // 加密
                .pipeThrough(createCipherivStream("aes-256-cbc", key, iv))
                // 解密
                .pipeThrough(createDecipherivStream("aes-256-cbc", key, iv))
        ),
        // 原始数据
        getFinalDataFromStream(copied),
    ] as const);

    expect(res).eql(hashed);
});

test("Sign Test", async () => {
    const [main, copied] = createRandomBytesStream(100).tee();
    const { privateKey, publicKey } = generateKeyPairSync("ec", {
        namedCurve: "sect239k1",
    });
    const { privateKey: fakePrivateKey, publicKey: fakePublicKey } =
        generateKeyPairSync("ec", {
            namedCurve: "sect239k1",
        });
    const signature = await getFinalDataFromStream(
        main.pipeThrough(new SignStream(privateKey, "SHA256"))
    );
    expect(
        getFinalDataFromStream(
            copied
                // 第一次解密成功
                .pipeThrough(new VerifyStream(publicKey, signature, "SHA256"))
                // 第二次验证失败
                .pipeThrough(
                    new VerifyStream(fakePrivateKey, signature, "SHA256")
                )
        )
    ).rejects.toThrowError("stream: verify failed");
});

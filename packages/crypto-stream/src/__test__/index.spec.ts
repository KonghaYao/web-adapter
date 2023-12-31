// @vitest-environment node
import { getFinalDataFromStream, createRandomBytesStream, HexDecoderStream, HexEncoderStream, createHashStream, createHmacStream, createCipherivStream, createDecipherivStream, SignStream, VerifyStream, createStream, getFinalDataFromStreams, TypedTransform } from "../index";
import { expect, test } from "vitest";
import {
    createHash,
    randomBytes,
    createHmac,
    generateKeyPairSync,
} from "node:crypto";



test("createStream Test", async () => {
    const binary = randomBytes(16)
    const str = [...binary].map(i => i.toString(16)).join('')
    const [b, s] = await getFinalDataFromStreams(createStream(binary), createStream(str))
    expect(b).eql(binary)
    expect(s).eql(str)
});

test("Hex Base Test", async () => {
    const [main, copied] = createRandomBytesStream(100).tee();
    const [hexMain, hexCopied] = main.pipeThrough(new HexDecoderStream()).tee();
    const [hexed, originLike, origin] = await Promise.all([
        /** hex 化 */
        getFinalDataFromStream(hexMain),
        /** hex 化后还原 */
        getFinalDataFromStream(hexCopied.pipeThrough(new HexEncoderStream())),

        /** 原始数据 */
        getFinalDataFromStream(copied),
    ] as const);

    expect(hexed).to.eq(Buffer.from(origin).toString("hex")); // 测试 hex 化效果
    expect(Buffer.from(origin).toString("hex")).eql(
        Buffer.from(originLike).toString("hex")
    ); // 测试 hex 还原效果
});

test("Hex TypedArray Test", async () => {
    const [main, copied] = createRandomBytesStream(100).tee()
    const a = await getFinalDataFromStreams(copied.pipeThrough(new TypedTransform(Uint8Array)).pipeThrough(new HexDecoderStream())
        , main.pipeThrough(new TypedTransform(Int32Array)).pipeThrough(new HexDecoderStream()),)

    expect(a[0]).eq(a[1])
});
test("Hmac Test", async () => {
    const [main, copied] = createRandomBytesStream(100).tee();
    const key = randomBytes(32);
    const [res, hashed] = await Promise.all([
        // hmac
        getFinalDataFromStream(
            main
                .pipeThrough(createHmacStream("sha256", key))
                .pipeThrough(new HexDecoderStream())
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
                .pipeThrough(new HexDecoderStream())
        ),
        // 原始数据
        getFinalDataFromStream(copied),
    ] as const);

    const right = createHash("sha256");
    right.update(hashed);
    expect(res).eq(right.digest("hex"));
});
test("Cipheriv Test", async () => {
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

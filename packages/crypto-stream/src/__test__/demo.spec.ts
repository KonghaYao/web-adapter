// @vitest-environment node
import { expect, test } from "vitest";
import { randomBytes } from 'crypto'
import { getFinalDataFromStream, createRandomBytesStream, HexDecoderStream, HexEncoderStream, createHashStream, createHmacStream, createCipherivStream, createDecipherivStream, SignStream, VerifyStream, getFinalDataFromStreams, createStream } from "../index";

test("Demo Sending End", async () => {
    // Sending End
    const originData = randomBytes(200)
    const key = randomBytes(32)
    const iv = randomBytes(16)

    const [dataStream, copiedStream] = createStream(originData).pipeThrough(
        createCipherivStream("aes-256-cbc", key, iv)
    ).tee();
    const hashStream = copiedStream
        .pipeThrough(createHashStream("sha256"))
        .pipeThrough(new HexDecoderStream());
    const [output, hashString] = await getFinalDataFromStreams(dataStream, hashStream)
    expect(typeof hashString === 'string').toBe(true)
    expect(output.byteLength).greaterThan(200)


    // Received End
    const [forDecrypt, forHashCheck] = createStream<Uint8Array>(output).tee()
    const [decrypted, hashCheck] = await getFinalDataFromStreams(
        forDecrypt.pipeThrough(createDecipherivStream("aes-256-cbc", key, iv),
        ), forHashCheck.pipeThrough(createHashStream("sha256"))
            .pipeThrough(new HexDecoderStream())
    )
    expect(hashCheck).eq(hashString)
    expect(decrypted).eql(originData)

})
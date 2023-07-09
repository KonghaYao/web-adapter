// @vitest-environment node
import { getFinalDataFromStream } from "../getFinalDataFromStream"
import { createRandomBytesStream } from '../createRandomBytesStream'
import { HexDecodeStream, HexEncoderStream } from '../HexEncoderStream'
import { createHashStream } from '../createHashStream'
import { expect, test } from 'vitest'
import { createHash, randomBytes } from 'node:crypto'
test('Hex Test', async () => {

    const [main, copied] = createRandomBytesStream(100).tee()
    const [hexMain, hexCopied] = main.pipeThrough(new HexEncoderStream()).tee()
    const [hexed, originLike, origin] = await Promise.all([
        /** hex 化 */
        getFinalDataFromStream(hexMain),
        /** hex 化后还原 */
        getFinalDataFromStream(hexCopied.pipeThrough(new HexDecodeStream())),

        /** 原始数据 */
        getFinalDataFromStream(copied)
    ] as const)

    expect(hexed).to.eq(Buffer.from(origin).toString('hex')) // 测试 hex 化效果
    expect(Buffer.from(origin).toString('hex')).eql(Buffer.from(originLike).toString('hex')) // 测试 hex 还原效果

})
test('Hash Test', async () => {

    const [main, copied] = createRandomBytesStream(100).tee()
    const [res, hashed] = await Promise.all([
        // hash 
        getFinalDataFromStream(main.pipeThrough(createHashStream('sha256')).pipeThrough(new HexEncoderStream())),
        // 原始数据 
        getFinalDataFromStream(copied)
    ] as const)

    const right = createHash('sha256')
    right.update(hashed)
    expect(res).eq(right.digest('hex'))
})
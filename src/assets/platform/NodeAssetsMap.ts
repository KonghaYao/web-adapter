import { outputFile, readFile, createReadStream } from "fs-extra";
import { AssetsMap } from "../AssetsMap";
import { resolveNodeModule } from '../../resolveNodeMoudle'
export class NodeAssetsMap extends AssetsMap {
    async loadFileAsync(token: string): Promise<Uint8Array> {
        const targetPath = this.ensureGet(token)
        return readFile(await resolveNodeModule(targetPath)).then((res) => {
            return new Uint8Array(res.buffer);
        });
    }
    async loadFileStream(token: string): Promise<ReadableStream<Uint8Array>> {
        const stream = createReadStream(this.ensureGet(token));
        return new ReadableStream({
            start(controller) {
                stream.on('data', (chunk) => {
                    controller.enqueue(chunk as Uint8Array);
                });
                stream.on('end', () => {
                    controller.close()
                    // stream.close()
                });
                stream.on('error', (e) => {
                    controller.error(e)
                });
            },
        })
    }
    fetch: undefined | typeof globalThis['fetch'] = globalThis.fetch
    async loadFileResponse(token: string): Promise<Response> {
        if (!this.fetch) {
            throw new Error(
                "fetch 函数不存在，请适配 fetch 或者升级更高级的 Nodejs "
            );
        }
        return this.fetch(new URL(this.ensureGet(token), import.meta.url));
    }
    outputFile = outputFile;
}

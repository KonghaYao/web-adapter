import type { WriteFileOptions } from "fs-extra";
import { AssetsMap } from "../AssetsMap";

/** @ts-ignore */
import { dirname } from "https://deno.land/std@0.193.0/path/mod.ts";
const outputFile = async (file: string,
    data: Uint8Array | string,
    options?: string | WriteFileOptions | undefined) => {
    const dir = dirname(file);
    const { ensureDir } = await import(
        /** @ts-ignore */
        "https://deno.land/std@0.192.0/fs/ensure_dir.ts"
    );
    await ensureDir(dir);
    if (typeof data === "string") {
        const encoder = new TextEncoder();
        data = encoder.encode(data);
    }
    /** @ts-ignore */
    return Deno.writeFile(file, data);
};



export class DenoAssetsMap extends AssetsMap {
    async loadFileAsync(token: string): Promise<Uint8Array> {
        /** @ts-ignore */
        return await Deno.readFile(this.ensureGet(token));
    }
    async loadFileStream(token: string): Promise<ReadableStream<Uint8Array>> {
        /** @ts-ignore */
        const file: { readable: ReadableStream, close(): void } = await Deno.open(this.ensureGet(token), { read: true });
        // Do work with file
        file.close();
        return file.readable.pipeThrough(new TransformStream({

        }))
    }
    async loadFileResponse(token: string): Promise<Response> {
        return fetch(this.ensureGet(token));
    }
    outputFile = outputFile
}

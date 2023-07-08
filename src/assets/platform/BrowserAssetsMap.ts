import { WriteFileOptions } from "fs-extra";
import { AssetsMap } from "../AssetsMap";
/** 
 * 请在使用之前将 outputFile 补全
 * @example 
 * const assets = new BrowserAssetsMap()
 * assets.outputFile = (file,data,options)=>{
 * 
 * }
 */
export class BrowserAssetsMap extends AssetsMap {
    async loadFileAsync(token: string): Promise<Uint8Array> {
        return this.loadFileResponse(token)
            .then((res) => res.arrayBuffer())
            .then((res) => new Uint8Array(res));
    }
    async loadFileStream(token: string): Promise<ReadableStream<Uint8Array>> {
        return this.loadFileResponse(token).then(res => {
            if (res.body) return res.body
            console.log('error:', res)
            throw new Error(token + " 未返回信息")
        })
    }
    async loadFileResponse(token: string): Promise<Response> {
        return fetch(this.ensureGet(token));
    }
    async outputFile(
        file: string,
        data: Uint8Array | string,
        options?: string | WriteFileOptions | undefined
    ): Promise<void> { };
}

import type { WriteFileOptions } from "fs-extra";

export abstract class AssetsMap<K extends string = string> extends Map<
    K,
    string
> {
    constructor(input: { [key in K]: string } | [K, string][] = {} as any) {
        super(
            input instanceof Array
                ? input
                : (Object.entries(input) as [K, string][])
        );
    }
    ensureGet(token: K | string) {
        if (this.has(token as K)) {
            return this.get(token as K) as string;
        } else {
            return token;
        }
    }
    /** 重新设定内部的数据 */
    redefine(input: { [key in K]: string } | [K, string][]) {
        if (input instanceof Array) {
            input.map(([k, v]) => this.set(k, v));
        } else {
            Object.entries(input).map(([k, v]) =>
                this.set(k as K, v as string)
            );
        }
    }
    /** 异步地导入本地数据 */
    abstract loadFileAsync(token: K | string): Promise<Uint8Array>;

    /** 读取本地文件流 */
    abstract loadFileStream(token: K | string): Promise<ReadableStream>;
    /** 以 fetch 的方式进行数据传递 */
    abstract loadFileResponse(token: K | string): Promise<Response>;
    /** 对外输出文件 */
    abstract outputFile(
        file: string,
        data: Uint8Array | string,
        options?: string | WriteFileOptions | undefined
    ): Promise<void>;
}

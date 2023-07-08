// @vitest-environment node


import fs from "fs-extra";
import { Readable } from "stream";
import { NodeAssetsMap } from "../NodeAssetsMap";
import { it, describe, beforeEach, afterEach, vi, expect } from 'vitest'
// 创建一个假的文件系统
const mockFileSystem = {
    "/path/to/file1": "file1 content",
    "/path/to/file2": "file2 content"
};
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response> => {
    /** @ts-ignore */
    return new Response(mockFileSystem[input.toString().replace('file://', '')])
}

vi.mock("fs-extra", async (origin) => {
    const a: any = (await origin())
    return {
        ...a,
        readFile: vi.fn(async (path, options, callback) => {
            /** @ts-ignore */
            const content: string = mockFileSystem[path];
            if (!content) throw new Error("File not found")
            return new Uint8Array(await new Blob([content]).arrayBuffer())
        }),
        createReadStream: vi.fn(path => {
            /** @ts-ignore */
            const content = mockFileSystem[path];
            if (content) {
                const stream = new Readable();
                stream.push(content);
                stream.push(null);
                return stream;
            } else {
                throw new Error("File not found");
            }
        }),
        outputFile: vi.fn(async (path, data) => {
            /** @ts-ignore */
            mockFileSystem[path] = data;
        })
    }
});
describe("NodeAssetsMap", () => {
    let assetsMap!: NodeAssetsMap;

    beforeEach(() => {
        assetsMap = new NodeAssetsMap();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("loadFileAsync", () => {
        it("should return the file content as Uint8Array", async () => {
            const token = "/path/to/file1";
            const result = await assetsMap.loadFileAsync(token);
            expect(result).toBeInstanceOf(Uint8Array);
            await expect(new Blob([result]).text()).resolves.toEqual("file1 content");
        });

        it("should throw an error if the file does not exist", async () => {
            const token = "/path/to/nonexistent";
            const p = assetsMap.loadFileAsync(token
            )
            await expect(p).rejects.toThrowError(
                "File not found"
            );
        });
    });

    describe("loadFileStream", () => {
        it("should return a ReadableStream of the file content", async () => {
            const token = "/path/to/file1";
            const result = await assetsMap.loadFileStream(token);
            const chunks = await new Promise<string[]>(resolve => {
                const chunks: string[] = [];
                result.pipeThrough(new TextDecoderStream()).pipeTo(new WritableStream({
                    write(chunk) {
                        chunks.push(chunk)
                    },
                    close() {
                        resolve(chunks)
                    }
                }))


            });

            expect(chunks).toHaveLength(1);
            expect(chunks[0]).toEqual("file1 content");
        });

        it("should throw an error if the file does not exist", async () => {
            const token = "/path/to/nonexistent";
            await expect(assetsMap.loadFileStream(token)).rejects.toThrowError(
                "/path/to/nonexistent 未返回信息"
            );
        });
    });

    describe("loadFileResponse", () => {
        it("should return a Response object", async () => {
            const token = "/path/to/file1";
            assetsMap.fetch = globalThis.fetch
            const response = await assetsMap.loadFileResponse(token);
            expect(response).toBeDefined();
        });

        it("should throw an error if fetch is not available", async () => {
            assetsMap.fetch = undefined
            const token = "/path/to/file1";
            await expect(assetsMap.loadFileResponse(token)).rejects.toThrowError(
                "fetch 函数不存在，请适配 fetch 或者升级更高级的 Nodejs "
            );
        });
    });

    describe("outputFile", () => {
        it("should write data to the file", async () => {
            const path = "/path/to/newfile";
            const data = "new file content";
            await assetsMap.outputFile(path, data);
            /** @ts-ignore */
            expect(mockFileSystem[path]).toEqual(data);
        });
    });
});
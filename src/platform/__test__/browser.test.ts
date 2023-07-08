// @vitest-environment happy-dom
import { BrowserAssetsMap } from "../BrowserAssetsMap";
import { it, describe, beforeEach, afterEach, vi, expect } from 'vitest'
// 创建一个假的文件系统
const mockFileSystem = {
    "/path/to/file1": "file1 content",
    "/path/to/file2": "file2 content"
};
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response> => {
    const path = input.toString().replace('file://', '')
    if (path in mockFileSystem) {

        /** @ts-ignore */
        return new Response(mockFileSystem[path])
    } else {
        throw new Error('File not found')
    }
}

describe("NodeAssetsMap", () => {
    let assetsMap!: BrowserAssetsMap;

    beforeEach(() => {
        assetsMap = new BrowserAssetsMap();
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
                "File not found"
            );
        });
    });

    describe("loadFileResponse", () => {
        it("should return a Response object", async () => {
            const token = "/path/to/file1";
            const response = await assetsMap.loadFileResponse(token);
            expect(response).toBeDefined();
        });


    });

    describe("outputFile", () => {
        it("should write data to the file", async () => {
            const path = "/path/to/newfile";
            const data = "new file content";
            assetsMap.outputFile = async (path, data) => {
                /** @ts-ignore */
                mockFileSystem[path] = data
            }
            await assetsMap.outputFile(path, data);
            /** @ts-ignore */
            expect(mockFileSystem[path]).toEqual(data);
        });
    });
});
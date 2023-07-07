/** 解析模块中文件的地址，并非解析__dirname 和 __filename 的函数 */
export const resolveNodeModule = async (path: string) => {
    const head = path[0];
    switch (head) {
        case ".":
        case "/":
        case "~":
            return path;
        // ** 因为 @ 可以被作为第一个符号，故不适用
        case "&":
            const { resolve, dirname } = await import("node:path");
            const { fileURLToPath } = await import("node:url");
            const absolutePath = resolve(
                dirname(fileURLToPath(import.meta.url)),
                path.slice(1)
            );
            return absolutePath;
        default:
            const { default: module } = await import("node:module");
            const require = module.createRequire(import.meta.url);
            return require.resolve(path);
    }
};

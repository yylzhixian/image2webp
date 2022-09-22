import * as path from "path";
import { ImageminOptions } from "./types";
import { parseFilePath } from "./utils";
import { runBin } from "./bin";

async function cwebp(
    fileDir: string,
    fileName: string,
    fileExt: string,
    options?: ImageminOptions
) {
    const qualityOption = ["-q", options?.quality || 75].map(String);
    const inputOption = [`"${path.join(fileDir, fileName + fileExt)}"`];
    const outputOption = ["-o", `"${path.join(fileDir, fileName + ".webp")}"`];

    return await runBin('cwebp', [
        ...qualityOption,
        ...inputOption,
        ...outputOption,
    ]);
}

async function gif2webp(
    fileDir: string,
    fileName: string,
    fileExt: string,
    options?: ImageminOptions
) {
    const qualityOption = ["-q", options?.quality || 75].map(String);
    const inputOption = [`"${path.join(fileDir, fileName + fileExt)}"`];
    const outputOption = ["-o", `"${path.join(fileDir, fileName + ".webp")}"`];

    return await runBin('gif2webp', [
        ...qualityOption,
        ...inputOption,
        ...outputOption,
    ]);
}

export async function convert(
    fileDir: string,
    fileName: string,
    fileExt: string,
    options?: ImageminOptions
) {
    if (/^\.png|jpg|jpeg$/i.test(fileExt)) {
        return await cwebp(fileDir, fileName, fileExt, options);
    }
    if (/^\.gif$/i.test(fileExt)) {
        return await gif2webp(fileDir, fileName, fileExt, options);
    }

    return false;
}

export async function convertCurrentImage(
    documentPath: string,
    filePath: string,
    options?: ImageminOptions
) {
    const pathObj = parseFilePath(documentPath, filePath);

    if (pathObj) {
        return await convert(pathObj.dir, pathObj.name, pathObj.ext, options);
    }

    return false;
}

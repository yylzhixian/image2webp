import * as path from "path";
import * as fs from "fs";
import * as process from 'node:process';
import * as download from 'download';

import { BinName, BinPathObj } from "./types";
import { exec, isExisting } from "./utils";

const url = 'https://yylzhixian.github.io/vendors';

export const binPaths: BinPathObj = {
    cwebp: {
        'darwin': { name: 'cwebp', url: `${url}/cwebp/osx/cwebp` },
        'linux/x86': { name: 'cwebp', url: `${url}/cwebp/linux/x86/cwebp` },
        'linux/x64': { name: 'cwebp', url: `${url}/cwebp/linux/x64/cwebp` },
        'win32/x64': { name: 'cwebp.exe', url: `${url}/cwebp/win/x64/cwebp.exe` },
    },
    gif2webp: {
        'darwin': { name: 'gif2webp', url: `${url}/gif2webp/macos/gif2webp` },
        'linux': { name: 'gif2webp', url: `${url}/gif2webp/linux/gif2webp` },
        'win32': { name: 'gif2webp.exe', url: `${url}/gif2webp/win/gif2webp.exe` },
    },
};

export async function runBin(binName: BinName, options: string[]) {
    const platform = process.platform;
    const arch = process.arch;
    const pathWithArch = binPaths[binName];
    let binPathObj = pathWithArch[`${platform}/${arch}`];

    if (!binPathObj && !(binPathObj = pathWithArch[platform])) {
        throw Error("Sorry! It's not support your platfom.");
    }

    const binDir = path.resolve(__dirname, '../bin', binName);
    const command = path.join(binDir, binPathObj.name);

    try {
        await isExisting(binDir);
    } catch (error) {
        fs.mkdirSync(binDir, { recursive: true });
    }

    try {
        await isExisting(command);
    } catch (error) {
        fs.writeFileSync(command, await download(binPathObj.url));
    }

    fs.chmodSync(command, 0o777);

    return await exec(command, options);
}

import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";
import imageSize from 'image-size';

export function isPlatform(name: NodeJS.Platform) {
    return process.platform === name;
}

export function isWin() {
    return isPlatform("win32");
}

export function isMac() {
    return isPlatform("darwin");
}

export function isLinux() {
    return isPlatform("linux");
}

export function isExisting(fsPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.stat(fsPath, (error, stat) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}

export function exec(
    command: string,
    args?: string[] | undefined
): Promise<string> {
    return new Promise((resolve, reject) => {
        command += args ? ` ${args.join(" ")}` : "";
        child_process.exec(command, (error, stdout) => {
            if (error) reject(error);
            else resolve(stdout);
        });
    });
}

export function simplifyByteUnit(byte: number) {
    if (byte < 1024) {
        return `${byte} B`;
    }
    const KB = 1024 * 1024;
    if (byte < KB) {
        return `${(byte / 1024).toFixed(2)} KB`;
    }
    const MB = KB * 1024;
    if (byte < MB) {
        return `${(byte / KB).toFixed(2)} MB`;
    }
    return `${(byte / MB).toFixed(2)} GB`;
}

export function parseFilePath(documentPath: string, relativePath: string) {
    const textFilePathReg = /.*\//.exec(documentPath);
    if (!textFilePathReg) return;

    let textFilePath = textFilePathReg[0];

    if (isWin()) {
        textFilePath = textFilePath.replace(/^\//, "");
    }

    return path.parse(path.resolve(textFilePath, relativePath));
}

export function getAbsolutePath(parsedPath: path.ParsedPath) {
    // const pathObj = parseFilePath(documentPath, relativePath);

    // if (!pathObj) return "";

    return `${parsedPath.dir.replace(/\\/g, "/")}/${parsedPath.name}${parsedPath.ext}`;
}

export function getFileSize(parsedPath: path.ParsedPath) {
    const res = {
        bytes: 0,
        unit: "0 B",
    };

    try {
        const file = getAbsolutePath(parsedPath);
        const stat = fs.statSync(file);
        const unit = simplifyByteUnit(stat.size);
        res.bytes = stat.size;
        res.unit = unit;
    } catch (error) {
        console.error(error);
    }

    return res;
}

export function lazyTips(callback: (count: number, msg: string) => void) {
    let timer: NodeJS.Timeout | null = null;
    let count: number | null = 0;
    let tips: string[] | null = [
        "Please wait a moment, I'm working hard...",
        "Still going even more...",
        "I am long running! - almost there...",
        "It will be finished soon...",
        "Just a moment, trust me :)",
    ];
    function later(delay: number) {
        timer = setTimeout(() => {
            if (Array.isArray(tips) && typeof count === "number") {
                callback(count + 1, tips[count % tips.length]);
                count++;
                later(delay + 2e3);
            }
        }, delay);
    }

    later(2e3);
    return () => {
        if (timer) clearTimeout(timer);
        timer = null;
        count = null;
        tips = null;
    };
}

export function limitToOne(x: number) {
    return (Math.atan(x) * 2) / Math.PI;
}

export function getImageDimension(img: string | Buffer) {
    return imageSize(img);
}
import * as vscode from "vscode";

export interface ImageFileObject {
    filePath: string;
    documentPath: string;
    charStartIndex: vscode.Position;
    charEndIndex: vscode.Position;
}

export interface ImageminGif2WebpOptions {
    quality: number;
    lossy?: boolean;
    mixed?: boolean;
    method?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    minimize?: boolean;
    kmin?: number;
    kmax?: number;
    filter?: number;
    metadata?: "all" | "none" | "icc" | "xmp";
    multiThreading?: boolean;
    buffer?: Buffer;
}

export interface ImageminWebpOptions {
    quality: number;
};

export type ImageminOptions = ImageminWebpOptions | ImageminGif2WebpOptions;

export type BinName = 'cwebp' | 'gif2webp';
export type BinPathObj = Record<BinName, Record<string, { name: string, url: string }>>;


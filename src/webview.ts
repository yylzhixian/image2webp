import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {
    COMMAND_CONVERT,
    COMMAND_UPDATE_ORIGINAL,
    COMMAND_UPDATE_WEBP,
    COMMAND_RESPONSE_SUFFIX,
    VSCODE_CDN_PREFIX
} from './constant';
import { ImageFileObject, ImageminOptions } from "./types";
import { parseFilePath, getFileSize, getImageDimension } from "./utils";

export default class WebviewPanel {
    static currentPanel: WebviewPanel | undefined;
    static readonly viewType = 'image2webp';
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    public _imgObj: ImageFileObject;
    public _editor: vscode.TextEditor | undefined;
    public _imageRatio: number;

    static createOrShow(extensionUri: vscode.Uri, imgObj: ImageFileObject, editor?: vscode.TextEditor) {
        const column = editor && vscode.ViewColumn.Two;

        if (WebviewPanel.currentPanel) {
            WebviewPanel.currentPanel.updateOriginal(imgObj);
            WebviewPanel.currentPanel._editor = editor;
            WebviewPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            WebviewPanel.viewType,
            'image2webp',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
            },
        );

        WebviewPanel.currentPanel = new WebviewPanel(panel, extensionUri, imgObj, editor);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, imgObj: ImageFileObject, editor?: vscode.TextEditor) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._imgObj = imgObj;
        this._imageRatio = 1;
        this._editor = editor;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                let result = undefined;
                switch (message.command) {
                    case COMMAND_CONVERT:
                        result = await this.handleConvert(message.options);
                        break;
                }

                this._panel.webview.postMessage({
                    command: message.command + COMMAND_RESPONSE_SUFFIX,
                    data: result,
                });
            },
            null,
            this._disposables
        );
        this._panel.webview.html = this._getHtmlContent();
        this.updateOriginal(imgObj);
    }

    private _getHtmlContent() {
        const webPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'dist', 'web');
        const assetsUri = vscode.Uri.joinPath(webPathOnDisk, 'assets');
        const htmlUri = vscode.Uri.joinPath(webPathOnDisk, 'index.html');

        const transformUriFromFile = (file: vscode.Uri) => {
            let fileContent = fs.readFileSync(file.fsPath, { encoding: 'utf-8' });
            fileContent = fileContent.replace(/(?<=('|"|\())\/assets\/(.+?)(?=('|"|\)))/ig, ($0, _, $2) => {
                if (/\.(js|css)$/i.test($0)) {
                    transformUriFromFile(vscode.Uri.joinPath(webPathOnDisk, $0));
                }

                const newUri = vscode.Uri.joinPath(assetsUri, $2).with({ scheme: 'vscode-resource' }).toString();

                return newUri.replace(/^vscode-resource:/i, VSCODE_CDN_PREFIX);
            });

            if (!/\.html$/i.test(file.fsPath)) {
                fs.writeFileSync(file.fsPath, fileContent, { encoding: 'utf-8' });
            }

            return fileContent;
        };

        return transformUriFromFile(htmlUri);
    }

    updateOriginal(imgObj: ImageFileObject) {
        this._imgObj = imgObj;
        const pathObj = parseFilePath(imgObj.documentPath, imgObj.filePath);
        if (pathObj) {
            const filePath = path.join(pathObj.dir, pathObj.name + pathObj.ext);
            const fileSize = getFileSize(pathObj);
            const url = path.join(VSCODE_CDN_PREFIX, filePath);

            const dimensions = getImageDimension(filePath);
            if (dimensions.width && dimensions.height) {
                this._imageRatio = dimensions.height / dimensions.width;
            } else {
                this._imageRatio = 1;
            }

            this._panel.webview.postMessage({
                command: COMMAND_UPDATE_ORIGINAL,
                data: { ...fileSize, url, imageRatio: this._imageRatio, fileName: pathObj.name + pathObj.ext },
            });
        }
    }

    updateWebP() {
        const pathObj = parseFilePath(this._imgObj.documentPath, this._imgObj.filePath);

        if (pathObj) {
            const webpObj = { ...pathObj, ext: '.webp' };
            const fileSize = getFileSize(webpObj);
            const url = path.join(VSCODE_CDN_PREFIX, webpObj.dir, webpObj.name + webpObj.ext);

            this._panel.webview.postMessage({
                command: COMMAND_UPDATE_WEBP,
                data: { ...fileSize, url },
            });
        }
    }

    handleConvert(options: ImageminOptions) {
        return new Promise<boolean>((resolve) => {
            vscode.commands.executeCommand(
                COMMAND_CONVERT,
                this._imgObj,
                options,
                (status: boolean) => {
                    this.updateWebP();
                    resolve(status);
                },
                this._editor
            );
        });
    }

    dispose() {
        WebviewPanel.currentPanel = undefined;
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
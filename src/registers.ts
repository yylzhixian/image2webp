import * as vscode from "vscode";
import ImagePathSnippet from "./ImagePathSnippet";
import Webview from "./Webview";
import { ImageFileObject, ImageminOptions } from "./types";
import { COMMAND_CONVERT, COMMAND_MORE, COMMAND_REFACTOR } from "./constant";
import { convertCurrentImage } from "./convert";
import { lazyTips, limitToOne } from "./utils";

export const registerCodeActionsProvider =
    vscode.languages.registerCodeActionsProvider(
        ["css", "less", "scss", "vue", "html", "javascript", "javascriptreact", "typescript", "typescriptreact"],
        new ImagePathSnippet(),
        {
            providedCodeActionKinds: ImagePathSnippet.providedCodeActionKinds,
        }
    );

export const registerConvertCommand = vscode.commands.registerCommand(
    COMMAND_CONVERT,
    (
        imgObj: ImageFileObject,
        options: ImageminOptions,
        callback: (status: boolean) => void,
        editor: vscode.TextEditor
    ) => {
        vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: "Processing",
            },
            (progress) => {
                return new Promise<void>(async (resolve, reject) => {
                    const cancelTimer = lazyTips((count, msg) => {
                        const increment = Math.floor(limitToOne(count) * 30);
                        progress.report({
                            increment,
                            message: msg,
                        });
                    });
                    try {
                        const convertStatus = await convertCurrentImage(
                            imgObj.documentPath,
                            imgObj.filePath,
                            options
                        );
                        cancelTimer();
                        resolve();

                        callback(convertStatus === '');

                        if (convertStatus === false) {
                            vscode.window.showErrorMessage(
                                "Failed, please check the image path"
                            );
                        } else {
                            vscode.commands.executeCommand(
                                COMMAND_REFACTOR,
                                imgObj,
                                editor
                            );
                            vscode.window.showInformationMessage("Success!");
                        }
                    } catch (error: unknown) {
                        cancelTimer();

                        if (error && typeof error === "object")
                            vscode.window.showErrorMessage(error.toString());

                        reject(error);
                        callback(false);
                    }
                });
            }
        );
    }
);

export const registerRefactorCommand = vscode.commands.registerCommand(
    COMMAND_REFACTOR,
    (imgObj: ImageFileObject, activeTextEditor: vscode.TextEditor) => {
        const pathRange = new vscode.Range(
            imgObj.charStartIndex,
            imgObj.charEndIndex
        );
        const editor = activeTextEditor || vscode.window.activeTextEditor;

        if (editor) {
            const { filePath } = ImagePathSnippet.parseFilePath(
                editor.document,
                pathRange
            );

            const suffixRegExp = /\.(jpe?g|png|gif)$/i;

            if (suffixRegExp.test(filePath)) {
                const newPath = filePath.replace(suffixRegExp, ".webp");
                editor.edit((editBuilder) => {
                    editBuilder.replace(pathRange, newPath);
                });
            }
        }
    }
);

export const registerMoreCommand = (context: vscode.ExtensionContext) => {
    return vscode.commands.registerCommand(
        COMMAND_MORE,
        (imgObj: ImageFileObject) => {
            Webview.createOrShow(context.extensionUri, imgObj, vscode.window.activeTextEditor);
        }
    );
};

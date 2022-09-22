import * as vscode from "vscode";
import { ImageFileObject } from "./types";
import { COMMAND_CONVERT, COMMAND_MORE } from "./constant";

export default class ImagePathSnippet implements vscode.CodeActionProvider {
    static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

    provideCodeActions(document: vscode.TextDocument, range: vscode.Range) {
        const imgObj = ImagePathSnippet.parseFilePath(document, range);
        if (!imgObj.filePath) return;

        return [
            this.createItem(imgObj, 75),
            this.createItem(imgObj, 50),
            this.createItem(imgObj, 25),
            this.createMoreCommand(imgObj),
        ];
    }

    static parseFilePath(
        document: vscode.TextDocument,
        range: vscode.Range
    ): ImageFileObject {
        const line = document.lineAt(range.start.line);
        const imgPathReg = /(?<=('|"|\())(?!\/).*?\.(?:jpe?g|png|gif)(?=('|"|\)))/gi; // example: ../imgs/bg.png
        let filePath = "";
        let regRes: RegExpExecArray | null;
        let start = 0;
        let end = 0;

        while ((regRes = imgPathReg.exec(line.text))) {
            start = regRes.index;
            end = start + regRes[0].length;
            if (
                start <= range.start.character &&
                end >= range.start.character
            ) {
                filePath = regRes[0];
                break;
            }
        }

        return {
            filePath,
            documentPath: document.uri.path,
            charStartIndex: new vscode.Position(range.start.line, start),
            charEndIndex: new vscode.Position(range.start.line, end),
        };
    }

    createItem(imgObj: ImageFileObject, quality: number) {
        const action = new vscode.CodeAction(
            `Convert to webp: ${quality} %`,
            vscode.CodeActionKind.Empty
        );
        action.command = {
            command: COMMAND_CONVERT,
            title: "Convert to webp",
            arguments: [imgObj, { quality }, () => { }],
        };
        return action;
    }

    createMoreCommand(imgObj: ImageFileObject) {
        const action = new vscode.CodeAction(
            "Choose more...",
            vscode.CodeActionKind.Empty
        );
        action.command = {
            command: COMMAND_MORE,
            title: "Convert to webp",
            arguments: [imgObj],
        };
        return action;
    }
}

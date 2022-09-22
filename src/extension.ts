import * as vscode from "vscode";
import {
    registerCodeActionsProvider,
    registerConvertCommand,
    registerRefactorCommand,
    registerMoreCommand,
} from "./registers";

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        registerCodeActionsProvider,
        registerConvertCommand,
        registerRefactorCommand,
        registerMoreCommand(context),
    );
}

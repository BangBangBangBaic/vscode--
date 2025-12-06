import * as vscode from 'vscode';
import { AudioPlayer } from './audioPlayer';

// 插件激活时，这个函数会被自动调用
export function activate(context: vscode.ExtensionContext) {
    console.log('键盘音效插件已激活！');

    // 1. 初始化音频播放器
    const audioPlayer = new AudioPlayer(context);

    // 2. 监听用户在任何文件中的输入
    let disposable = vscode.workspace.onDidChangeTextDocument((event) => {
        // event.contentChanges 是一个数组，包含本次变动的所有内容
        event.contentChanges.forEach((change) => {
            // 获取用户刚刚输入的字符
            const typedChar = change.text;
            // 我们只为单个字符的输入（且不是空格和回车）播放音效
            if (typedChar && typedChar.length === 1) {
                // 过滤掉换行、回车、空格等特殊字符（可选，你可以注释掉这一行来为所有按键加声音）  
                    // 【核心】调用播放器播放音效
                    audioPlayer.playKeySound();
            
            }
        });
    });

    // 将监听器加入订阅列表，这样插件关闭时会自动清理它
    context.subscriptions.push(disposable);
}

// 插件停用时调用
export function deactivate() {
    console.log('插件已停用');
}
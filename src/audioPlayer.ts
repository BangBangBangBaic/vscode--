import * as vscode from 'vscode';

export class AudioPlayer {
    private panel: vscode.WebviewPanel | undefined;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.initWebview();
    }

    // 初始化一个隐藏的Webview面板，用它来播放音频
    private initWebview() {
        this.panel = vscode.window.createWebviewPanel(
            'keySoundPlayer', // 内部标识，随便起，只要唯一就行
            'Key Sound Player', // 面板标题，用户看不到，因为隐藏了
            { viewColumn: vscode.ViewColumn.Nine }, // 把面板丢到最边上
            {
                enableScripts: true, // 必须开启，才能运行我们的JavaScript音频代码
                retainContextWhenHidden: true // 重要！面板隐藏时也不会被销毁，保持音效随时可播
            }
        );
        // 给这个Webview面板设置HTML内容
        this.panel.webview.html = this.getWebviewContent();
            // 让面板在后台显示，不主动弹出到前台
            this.panel.reveal(this.panel.viewColumn, true);
    }

    // 这是你唯一需要调用的方法：播放一个按键音
    public playKeySound() {
        if (!this.panel) {
            return;
        }   
        // 向隐藏的Webview面板发送一个消息，告诉它：“播放声音！”
        this.panel.webview.postMessage({
            command: 'play',
            sound: 'type.wav' // 告诉它播放哪个文件
        });
    }

    // 构建Webview内部的HTML和JavaScript代码
    private getWebviewContent(): string {
        // 获取sounds文件夹在Webview中的安全访问地址
        const soundsUri = this.panel!.webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'sounds')
        ).toString();

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Audio Player</title>
            <script>
                // 音频文件的基地址
                const soundsBaseUri = "${soundsUri}";
                // 一个简单的缓存，避免重复创建Audio对象
                const audioCache = {};

                // 监听来自插件主进程（也就是上面postMessage发来）的消息
                window.addEventListener('message', event => {
                    const message = event.data; // 消息内容
                    if (message.command === 'play') {
                        playSound(message.sound); // 收到播放命令，调用播放函数
                    }
                });

                // 播放声音的核心函数
                function playSound(filename) {
                    let audio = audioCache[filename];
                    if (!audio) {
                        // 如果缓存里没有，就创建一个新的Audio对象
                        audio = new Audio(\`\${soundsBaseUri}/\${filename}\`);
                        audioCache[filename] = audio;
                        audio.volume = 0.3; // 设置音量，0.3是30%音量，可以根据喜好调
                    }
                    // 每次播放前把播放进度重置到0，确保能连续、快速地重复播放
                    //youmei
                    audio.currentTime = 0;
                    // 播放它！如果失败（比如用户没交互），就静默失败
                    audio.play().catch(error => { /* 忽略播放错误 */ });
                }
            </script>
        </head>
        <body>
            <p>不要删除</p>
        </body>
        </html>
        `;
    }
}
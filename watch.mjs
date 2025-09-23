#!/usr/bin/env node

import { exec, execSync } from 'child_process';
import { watch } from 'fs';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { readdir, stat } from 'fs/promises';

const execAsync = promisify(exec);

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 项目路径
const PROJECT_ROOT = process.cwd();
const WEB_COMPONENT_DIR = join(PROJECT_ROOT, 'packages/web-component');
const DEMO_DIR = join(PROJECT_ROOT, 'examples/web-component-demo');

// 开发服务器进程
let devServerProcess = null;

// 检查目录是否存在
function checkDirectories() {
    if (!fs.existsSync(WEB_COMPONENT_DIR)) {
        console.error(`错误: web-component 目录不存在: ${WEB_COMPONENT_DIR}`);
        process.exit(1);
    }

    if (!fs.existsSync(DEMO_DIR)) {
        console.error(`错误: demo 目录不存在: ${DEMO_DIR}`);
        process.exit(1);
    }
}

// 停止开发服务器
async function stopDevServer() {
    if (devServerProcess) {
        console.log('停止开发服务器...');

        // 尝试正常终止进程
        devServerProcess.kill('SIGTERM');

        // 等待进程结束
        await new Promise((resolve) => {
            const timeout = setTimeout(() => {
                // 如果进程仍在运行，强制杀死
                if (!devServerProcess.killed) {
                    devServerProcess.kill('SIGKILL');
                }
                resolve();
            }, 5000);

            devServerProcess.on('exit', () => {
                clearTimeout(timeout);
                resolve();
            });
        });

        devServerProcess = null;
    }

    // 确保端口被释放，使用跨平台方式检查并杀死占用端口的进程
    try {
        const { execSync } = await import('child_process');
        let command;

        if (process.platform === 'win32') {
            command = `netstat -ano | findstr :3000`;
        } else {
            command = `lsof -ti:3000`;
        }

        const result = execSync(command, { encoding: 'utf8' });
        if (result) {
            const pids = result
                .trim()
                .split('\n')
                .map((line) => {
                    if (process.platform === 'win32') {
                        const match = line.match(/(\d+)$/);
                        return match ? match[1] : null;
                    }
                    return line.trim();
                })
                .filter((pid) => pid);

            for (const pid of pids) {
                try {
                    process.kill(Number.parseInt(pid, 10), 'SIGTERM');
                    console.log(`已终止占用端口 3000 的进程: ${pid}`);
                } catch (err) {
                    try {
                        process.kill(Number.parseInt(pid, 10), 'SIGKILL');
                        console.log(`已强制终止占用端口 3000 的进程: ${pid}`);
                    } catch (e) {
                        console.log(`无法终止进程 ${pid}: ${e.message}`);
                    }
                }
            }
        }
    } catch (err) {
        // 端口未被占用，无需处理
    }

    // 等待端口释放
    await new Promise((resolve) => setTimeout(resolve, 2000));
}

// 构建 web-component
async function buildWebComponent() {
    console.log('构建 web-component...');
    await execAsync('pnpm build', { cwd: WEB_COMPONENT_DIR });
    console.log('构建完成');
}

// 启动开发服务器
async function startDevServer() {
    console.log('启动开发服务器...');
    devServerProcess = exec('pnpm dev', { cwd: DEMO_DIR });

    // 捕获输出
    devServerProcess.stdout.on('data', (data) => {
        console.log(`[开发服务器] ${data.toString().trim()}`);
    });

    devServerProcess.stderr.on('data', (data) => {
        console.error(`[开发服务器错误] ${data.toString().trim()}`);
    });

    // 处理进程退出
    devServerProcess.on('exit', (code) => {
        if (code !== 0) {
            console.error(`开发服务器异常退出，代码: ${code}`);
        }
        devServerProcess = null;
    });

    // 等待服务器启动
    await new Promise((resolve) => setTimeout(resolve, 2000));
}

// 处理文件变更
async function handleFileChange(changedFile) {
    console.log(`文件变更: ${changedFile}`);

    // 添加防抖，避免频繁触发
    if (handleFileChange.debounceTimer) {
        clearTimeout(handleFileChange.debounceTimer);
    }

    handleFileChange.debounceTimer = setTimeout(async () => {
        await stopDevServer();
        // 确保开发服务器完全停止后再进行构建
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await buildWebComponent();
        await startDevServer();
    }, 500);
}

// 清理函数
async function cleanup() {
    console.log('\n正在清理...');
    await stopDevServer();
    process.exit(0);
}

// 初始化
async function init() {
    checkDirectories();
    await stopDevServer();
    await buildWebComponent();
    await startDevServer();
}

// 检查文件是否应该被忽略
function shouldIgnoreFile(filePath) {
    const ignorePatterns = [
        /node_modules/,
        /dist/,
        /\.git/,
        /\.DS_Store/,
        /.*\.log/
    ];

    return ignorePatterns.some((pattern) => pattern.test(filePath));
}

// 递归监听目录
async function watchDirectory(dirPath, callback) {
    try {
        const files = await readdir(dirPath);

        for (const file of files) {
            const fullPath = join(dirPath, file);
            const stats = await stat(fullPath);

            if (stats.isDirectory()) {
                // 递归监听子目录
                await watchDirectory(fullPath, callback);
            } else if (!shouldIgnoreFile(fullPath)) {
                // 监听文件变更
                watch(fullPath, (eventType) => {
                    if (eventType === 'change') {
                        callback(fullPath);
                    }
                });
            }
        }
    } catch (error) {
        console.error('监听目录错误:', error);
    }
}

// 主函数
async function main() {
    console.log('启动文件监听...');

    // 设置信号处理
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    // 初始化
    await init();

    console.log(`监听 ${WEB_COMPONENT_DIR} 目录，按 Ctrl+C 停止`);

    // 设置文件监听
    await watchDirectory(WEB_COMPONENT_DIR, handleFileChange);
}

// 启动主程序
main().catch((error) => {
    console.error('启动失败:', error);
    process.exit(1);
});

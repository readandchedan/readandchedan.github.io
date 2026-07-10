#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const MarkdownIt = require('markdown-it');
const juice = require('juice');

const USAGE = `Usage:
  node md2wechat.js <markdown-file> [options]

Options:
  --output, -o <file>   Write the generated inline-styled HTML to <file>.
  --preview, -p <file>  Write a preview page with a copy button instead of copying.
  --css <file>          Use a custom CSS file (default: styles/wechat.css).
  --help, -h            Show this help.

Examples:
  node md2wechat.js ../../_posts/tabletennis/_posts/2024-01-01-hello.md
  node md2wechat.js note.md -o note.html
  node md2wechat.js note.md -p preview.html
`;

function parseArgs(argv) {
  const args = argv.slice(2);
  const options = {
    output: null,
    preview: null,
    css: path.join(__dirname, 'styles', 'wechat.css'),
    help: false,
  };
  let input = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if ((arg === '--output' || arg === '-o') && i + 1 < args.length) {
      options.output = args[++i];
    } else if ((arg === '--preview' || arg === '-p') && i + 1 < args.length) {
      options.preview = args[++i];
    } else if (arg === '--css' && i + 1 < args.length) {
      options.css = args[++i];
    } else if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    } else if (!input) {
      input = arg;
    } else {
      throw new Error(`Multiple input files are not supported: ${input}, ${arg}`);
    }
  }

  return { input, options };
}

function stripFrontMatter(text) {
  if (text.startsWith('---')) {
    const end = text.indexOf('---', 3);
    if (end !== -1) {
      return text.slice(end + 3).replace(/^\n+/, '');
    }
  }
  return text;
}

function toInlineHtml(markdown, css) {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: false,
    highlight: (str) => {
      // WeChat editor does not reliably preserve whitespace in <pre>,
      // so we convert spaces/line breaks explicitly.
      const lines = str.replace(/\r\n/g, '\n').split('\n');
      // Drop a single trailing blank line that Markdown usually adds.
      if (lines.length > 1 && lines[lines.length - 1] === '') {
        lines.pop();
      }
      return lines
        .map((line) => md.utils.escapeHtml(line).replace(/ /g, '&nbsp;'))
        .join('<br/>');
    },
  });

  const body = md.render(markdown)
    .replace(/<table/g, '<section class="table-container" data-tool="mdnice编辑器"><table')
    .replace(/<\/table>/g, '</table></section>');
  const wrapped = `<section id="nice" data-tool="mdnice编辑器" data-website="https://readandchedan.com">\n${body}\n</section>`;
  return juice.inlineContent(wrapped, css, {
    inlinePseudoElements: true,
    preserveImportant: true,
  });
}

function buildPreviewPage(html, css) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>md2wechat preview</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; margin: 0; background: #f5f5f5; }
    #toolbar { position: sticky; top: 0; background: #fff; padding: 12px 20px; border-bottom: 1px solid #e0e0e0; display: flex; gap: 12px; align-items: center; }
    #toolbar button { padding: 8px 16px; cursor: pointer; }
    #toolbar span { color: #666; font-size: 14px; }
    #preview { max-width: 720px; margin: 20px auto; padding: 24px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    ${css}
  </style>
</head>
<body>
  <div id="toolbar">
    <button id="copy">复制到剪贴板</button>
    <span id="status">点击按钮复制微信编辑器可用的 HTML</span>
  </div>
  <div id="preview">${html}</div>
  <script>
    document.getElementById('copy').addEventListener('click', async () => {
      const html = document.getElementById('preview').innerHTML;
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          const blob = new Blob([html], { type: 'text/html' });
          await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]);
          document.getElementById('status').textContent = '已复制，去微信编辑器粘贴即可';
        } else {
          throw new Error('浏览器不支持 Clipboard API');
        }
      } catch (e) {
        document.getElementById('status').textContent = '复制失败：' + e.message + '，请手动选中预览区复制';
      }
    });
  </script>
</body>
</html>`;
}

function isWsl() {
  return (
    process.platform === 'linux' &&
    (!!process.env.WSL_DISTRO_NAME ||
      fs.existsSync('/proc/sys/fs/binfmt_misc/WSLInterop') ||
      fs.existsSync('/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe'))
  );
}

function runPowerShell(command) {
  const result = spawnSync('powershell.exe', ['-NoProfile', '-Command', command], {
    encoding: 'utf8',
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || 'PowerShell command failed');
  }
  return result.stdout.trim();
}

function windowsTempPaths() {
  const raw = runPowerShell('Write-Host $env:TEMP');

  if (process.platform === 'win32') {
    return { win: raw, fs: raw };
  }

  // WSL: C:\Users\... -> /mnt/c/Users/...
  const fsPath = raw
    .replace(/\\/g, '/')
    .replace(/^([A-Za-z]):/, '/mnt/$1')
    .toLowerCase();
  return { win: raw, fs: fsPath };
}

const HTA_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta charset="utf-8">
  <hta:application id="copy" border="none" caption="no" showintaskbar="no" />
  <script src="md2wechat-content.js"></script>
  <script>
    window.onload = function() {
      var div = document.createElement('div');
      div.innerHTML = md2wechatContent;
      div.style.position = 'absolute';
      div.style.left = '-9999px';
      document.body.appendChild(div);
      var range = document.createRange();
      range.selectNodeContents(div);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand('copy');
      window.close();
    };
  </script>
</head>
<body></body>
</html>`;

function copyHtmlToClipboard(html) {
  if (process.platform === 'win32' || isWsl()) {
    const { win: tempWin, fs: tempFs } = windowsTempPaths();
    if (!fs.existsSync(tempFs)) {
      fs.mkdirSync(tempFs, { recursive: true });
    }

    const contentJs = path.join(tempFs, 'md2wechat-content.js');
    const htaFile = path.join(tempFs, 'md2wechat-copy.hta');
    // BOM so mshta/IE reads the external JS as UTF-8.
    fs.writeFileSync(contentJs, '﻿var md2wechatContent = ' + JSON.stringify(html) + ';', 'utf8');
    fs.writeFileSync(htaFile, HTA_TEMPLATE, 'utf8');

    const htaWin = tempWin.endsWith('\\')
      ? tempWin + 'md2wechat-copy.hta'
      : tempWin + '\\md2wechat-copy.hta';

    const result = spawnSync('mshta.exe', [htaWin], {
      encoding: 'utf8',
      windowsHide: true,
      timeout: 15000,
    });
    return result.status === 0;
  }

  if (process.platform === 'darwin') {
    // macOS pbcopy does not support HTML by default; fall back to preview file.
    return false;
  }

  // Try Linux with xclip.
  const result = spawnSync('xclip', ['-selection', 'clipboard', '-t', 'text/html'], {
    input: html,
    encoding: 'utf8',
  });
  return result.status === 0;
}

function main() {
  const { input, options } = parseArgs(process.argv);

  if (options.help || !input) {
    console.log(USAGE);
    process.exit(input ? 0 : 1);
  }

  if (!fs.existsSync(input)) {
    console.error(`Error: file not found: ${input}`);
    process.exit(1);
  }

  if (!fs.existsSync(options.css)) {
    console.error(`Error: CSS file not found: ${options.css}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(input, 'utf8');
  const markdown = stripFrontMatter(raw);
  const css = fs.readFileSync(options.css, 'utf8');
  const html = toInlineHtml(markdown, css);

  if (options.output) {
    fs.writeFileSync(options.output, html, 'utf8');
    console.log(`HTML written to: ${path.resolve(options.output)}`);
    return;
  }

  if (options.preview) {
    const page = buildPreviewPage(html, css);
    fs.writeFileSync(options.preview, page, 'utf8');
    console.log(`Preview page written to: ${path.resolve(options.preview)}`);
    return;
  }

  const copied = copyHtmlToClipboard(html);
  if (copied) {
    console.log('Copied styled HTML to the clipboard. Paste it into the WeChat editor.');
  } else {
    const fallback = path.join(process.cwd(), 'md2wechat-preview.html');
    const page = buildPreviewPage(html, css);
    fs.writeFileSync(fallback, page, 'utf8');
    console.log('Could not copy rich HTML to the clipboard on this platform.');
    console.log(`Preview page written to: ${fallback}`);
    console.log('Open it in a browser and click the copy button, or copy the rendered content manually.');
  }
}

main();

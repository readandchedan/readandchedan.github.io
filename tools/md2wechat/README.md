# md2wechat

把 Markdown 文章转换成微信公众号编辑器可以直接粘贴的排版 HTML，并自动复制到剪贴板。

效果类似 [wechat.bmpi.dev](https://wechat.bmpi.dev/)，但是在本地运行，不需要把文章内容发到第三方网站。

## 安装

```bash
cd tools/md2wechat
npm install
```

## 用法

```bash
# 转换一篇文章并复制到剪贴板
node md2wechat.js ../../_posts/tabletennis/_posts/2026-07-06-better-world-ranking.md

# 只输出 HTML 文件
node md2wechat.js ../../_posts/tabletennis/_posts/2026-07-06-better-world-ranking.md -o output.html

# 生成一个带预览和复制按钮的 HTML 页面
node md2wechat.js ../../_posts/tabletennis/_posts/2026-07-06-better-world-ranking.md -p preview.html

# 使用自定义 CSS
node md2wechat.js article.md --css styles/mytheme.css
```

## 剪贴板支持

- **WSL / Windows**：自动通过 PowerShell 把富文本 HTML 写入 Windows 剪贴板，直接在微信公众平台编辑器里粘贴即可。
- **Linux**：如果安装了 `xclip`，会尝试写入 `text/html`。
- **macOS / 其他环境**：会自动生成一个预览页面，在浏览器里点击“复制到剪贴板”按钮即可。

## 自定义样式

默认样式在 `styles/wechat.css`。你可以复制一份修改，然后用 `--css` 指定。CSS 会通过 [juice](https://github.com/Automattic/juice) 内联到每个元素上，所以微信公众号编辑器能保留大部分样式。

## 注意事项

- 会去掉 Jekyll 的 YAML frontmatter。
- 图片地址保持原样，本地图片不会自动上传，粘贴后需要在微信编辑器里重新上传。

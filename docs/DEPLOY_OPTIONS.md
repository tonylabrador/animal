# 把 Wild Explorer 发布到网上 — 可选方案

项目是 Next.js + 静态数据（`animal_source.json`），没有后端 API，可以部署到多种平台。

---

## 一、推荐：Vercel（零配置、免费）

- **优点**：Next.js 官方平台，连 Git 后自动构建和发布，免费额度够个人项目用。
- **步骤**：
  1. 把代码推到 **GitHub**（新建仓库后 `git init` → `git add .` → `git commit` → `git remote add origin <url>` → `git push`）。
  2. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录。
  3. 点击 **Add New → Project**，选择你的仓库。
  4. 保持默认（Framework: Next.js，Build 命令等不用改），点 **Deploy**。
  5. 几分钟后会得到一个 `https://xxx.vercel.app` 的链接，就是线上地址。
- **以后更新**：改代码后 `git push`，Vercel 会自动重新部署。

---

## 二、Netlify

- **优点**：免费、界面简单，对 Next.js 支持好。
- **步骤**：
  1. 代码在 GitHub 上。
  2. 打开 [netlify.com](https://www.netlify.com) → **Add new site → Import an existing project** → 选 GitHub 和仓库。
  3. Build 命令填：`npm run build`，发布目录填：`out`（若用静态导出，见下）或留空用 Netlify 默认的 Next 检测。
  4. 若**不用**静态导出：Netlify 会识别 Next.js，发布目录用默认即可，Deploy。
- 会得到 `https://xxx.netlify.app`。

---

## 三、静态导出 + 任意静态托管（如 GitHub Pages）

适合不想用 Vercel/Netlify、只想放纯静态文件时。

1. **开启静态导出**  
   在 `next.config.ts` 里加上 `output: "export"`，然后执行：
   ```bash
   npm run build
   ```
   会生成 `out` 文件夹（纯 HTML/CSS/JS）。

2. **托管**：
   - **GitHub Pages**：在仓库 Settings → Pages → Source 选 **GitHub Actions**，或用 **Actions** 跑一个「把 `out` 推到 `gh-pages` 分支」的 workflow；或把 `out` 内容推到 `gh-pages` 分支，在 Pages 里选该分支的根目录。
   - **Cloudflare Pages**：在 [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → Create project → 选「直接上传」或连 Git，构建命令 `npm run build`，输出目录 `out`。
   - 其他任何支持「上传静态文件」或「从 Git 发布静态站点」的服务都可以用 `out` 里的内容。

注意：静态导出后，没有 Node 服务端，所有页面都是构建时生成好的，对你当前项目完全够用。

---

## 四、简要对比

| 方式           | 难度 | 免费额度     | 适合场景           |
|----------------|------|--------------|--------------------|
| **Vercel**     | 低   | 有，够用     | 首选，省心         |
| **Netlify**    | 低   | 有           | 备选，体验类似     |
| **静态导出 + GitHub Pages / Cloudflare** | 中 | 有           | 想用纯静态 / 自有域名 |

---

## 五、发布前建议在本地先跑一遍构建

```bash
npm run build
npm run start
```

在本地用 `start` 看一遍没问题再推送、部署。若构建报错，先把错误修掉再发布。

---

总结：**想最少折腾就选 Vercel**：代码放 GitHub，在 Vercel 连仓库一键部署即可；若你更喜欢 Netlify 或想用 GitHub Pages/Cloudflare，也可以按上面对应步骤操作。

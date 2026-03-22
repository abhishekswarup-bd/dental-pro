#!/usr/bin/env node
/**
 * Dental Pro — Build Script
 * Minifies the single-file HTML app for production deployment.
 *
 * Input: src/index.html
 * Output: dist/index.html (minified)
 *         dist/404.html (copy for SPA-style GitHub Pages routing)
 */

const fs = require("fs");
const path = require("path");
const { minify } = require("html-minifier-terser");

const SRC = path.join(__dirname, "src", "index.html");
const DIST = path.join(__dirname, "dist");
const OUT = path.join(DIST, "index.html");
const FOUR04 = path.join(DIST, "404.html");

async function build() {
  const start = Date.now();
  console.log("🦷 Dental Pro — Build\n");

  // Ensure dist/ exists
  if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });

  // Read source
  let src = fs.readFileSync(SRC, "utf-8");
  const srcSize = Buffer.byteLength(src);
  console.log(` 📄 Source: ${(srcSize / 1024).toFixed(1)} KB`);

  // Inject API keys from environment variables (GitHub Secrets)
  const keyMap = {
    __GROQ_API_KEY__: process.env.GROQ_API_KEY || "",
    __GEMINI_API_KEY_1__: process.env.GEMINI_API_KEY_1 || "",
    __GEMINI_API_KEY_2__: process.env.GEMINI_API_KEY_2 || "",
    __OPENROUTER_API_KEY__: process.env.OPENROUTER_API_KEY || "",
  };
  let injected = 0;
  for (const [placeholder, value] of Object.entries(keyMap)) {
    if (value && src.includes(placeholder)) {
      src = src.replace(placeholder, value);
      injected++;
    }
  }
  console.log(` 🔑 API keys: ${injected} of ${Object.keys(keyMap).length} injected`);

  // Warn if keys missing (non-blocking — app still works with local fallback)
  if (injected === 0) {
    console.log("  ⚠️  No API keys found in env — AI search will use local fallback only");
  }

  // Minify
  const minified = await minify(src, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    minifyCSS: true,
    minifyJS: {
      compress: {
        drop_console: false, // keep console.log for auto-update system
        passes: 2,
      },
      mangle: false, // don't mangle — single-file app uses global names
    },
    sortAttributes: true,
    sortClassName: true,
  });

  const outSize = Buffer.byteLength(minified);
  const savings = ((1 - outSize / srcSize) * 100).toFixed(1);

  // Write output
  fs.writeFileSync(OUT, minified);
  fs.writeFileSync(FOUR04, minified); // GitHub Pages SPA fallback

  // Copy any additional assets from src/ (excluding index.html)
  const srcDir = path.join(__dirname, "src");
  fs.readdirSync(srcDir).forEach((file) => {
    if (file === "index.html") return;
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(DIST, file);
    if (fs.statSync(srcPath).isFile()) {
      fs.copyFileSync(srcPath, destPath);
      console.log(` 📋 Copied: ${file}`);
    }
  });

  // Copy extra root-level files into dist (blog, search, sitemap)
  const extras = ["blog.html", "sitemap.xml", "search-index.js", "search.js", "robots.txt"];
  extras.forEach((f) => {
    const fp = path.join(__dirname, f);
    if (fs.existsSync(fp)) {
      fs.copyFileSync(fp, path.join(DIST, f));
      console.log(` 📋 Copied: ${f}`);
    }
  });

  // Copy blog/ folder into dist/blog/
  const blogSrc = path.join(__dirname, "blog");
  if (fs.existsSync(blogSrc)) {
    const blogDist = path.join(DIST, "blog");
    if (!fs.existsSync(blogDist)) fs.mkdirSync(blogDist, { recursive: true });
    fs.readdirSync(blogSrc).forEach((f) => {
      fs.copyFileSync(path.join(blogSrc, f), path.join(blogDist, f));
    });
    console.log(` 📋 Copied: blog/ (${fs.readdirSync(blogSrc).length} files)`);
  }

  const elapsed = Date.now() - start;
  console.log(` 📦 Output: ${(outSize / 1024).toFixed(1)} KB (${savings}% smaller)`);
  console.log(`\n ✅ Build complete in ${elapsed}ms`);
  console.log(` 📁 Output directory: dist/\n`);
}

build().catch((err) => {
  console.error("❌ Build failed:", err.message);
  process.exit(1);
});

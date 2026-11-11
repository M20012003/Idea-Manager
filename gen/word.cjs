// Build a Word (.docx) file from a rendered report HTML.
// Each <section class="page"> is screenshotted to a full-A4 PNG (identical
// layout to the PDF) and embedded as one page of the Word document.
//
// Usage: node word.cjs <input.html> <output.docx>
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const { firefox } = require('playwright');

const ROOT = __dirname;
const toFileURL = (p) => 'file://' + p;

// ---------- OOXML constants ----------
const MM = 36000; // EMU per millimeter
const PAGE_W_MM = 210;
const PAGE_H_MM = 297;
// Leave a small safety margin so the paragraph mark never spills onto a blank page.
const IMG_W_MM = 205;
const IMG_H_MM = 288;
const CX = IMG_W_MM * MM;
const CY = IMG_H_MM * MM;

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function contentTypesXml(nImages) {
  const overrides = [];
  for (let i = 1; i <= nImages; i++) {
    overrides.push(
      `<Override PartName="/word/media/page-${String(i).padStart(2, '0')}.png" ContentType="image/png"/>`
    );
  }
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Default Extension="png" ContentType="image/png"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
${overrides.join('\n')}
</Types>`;
}

function rootRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
}

function documentRelsXml(nImages) {
  const rels = [];
  for (let i = 1; i <= nImages; i++) {
    const file = `media/page-${String(i).padStart(2, '0')}.png`;
    rels.push(
      `<Relationship Id="rIdImg${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${file}"/>`
    );
  }
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${rels.join('\n')}
</Relationships>`;
}

function pageDrawingXml(i) {
  return `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${CX}" cy="${CY}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${i}" name="Page${i}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${i}" name="Page${i}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdImg${i}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${CX}" cy="${CY}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
}

function documentXml(nPages) {
  const pages = [];
  for (let i = 1; i <= nPages; i++) {
    pages.push(pageDrawingXml(i));
  }
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
<w:body>
${pages.join('\n')}
<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="0" w:right="0" w:bottom="0" w:left="0" w:header="0" w:footer="0" w:gutter="0"/><w:cols w:num="1"/><w:docGrid w:type="lines" w:linePitch="312"/></w:sectPr>
</w:body>
</w:document>`;
}

// ---------- main ----------
async function main() {
  const [htmlArg, outArg] = process.argv.slice(2);
  if (!htmlArg || !outArg) {
    console.error('Usage: node word.cjs <input.html> <output.docx>');
    process.exit(1);
  }
  const htmlPath = path.resolve(ROOT, htmlArg);
  const outPath = path.resolve(ROOT, outArg);

  const browser = await firefox.launch();
  const page = await browser.newPage({
    viewport: { width: 794, height: 1123 },
    deviceScaleFactor: 2,
  });
  await page.goto(toFileURL(htmlPath));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  const count = await page.locator('section.page').count();
  console.log(`Rendering ${count} pages from ${path.basename(htmlPath)} ...`);

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'docxbuild-'));
  fs.mkdirSync(path.join(tmp, '_rels'), { recursive: true });
  fs.mkdirSync(path.join(tmp, 'word', '_rels'), { recursive: true });
  fs.mkdirSync(path.join(tmp, 'word', 'media'), { recursive: true });

  const pngs = [];
  for (let i = 0; i < count; i++) {
    const el = page.locator('section.page').nth(i);
    const png = await el.screenshot({ type: 'png' });
    pngs.push(png);
    process.stdout.write(`page ${i + 1}/${count} ok\n`);
  }
  await browser.close();

  const n = pngs.length;
  pngs.forEach((buf, idx) => {
    const name = `page-${String(idx + 1).padStart(2, '0')}.png`;
    fs.writeFileSync(path.join(tmp, 'word', 'media', name), buf);
  });

  fs.writeFileSync(path.join(tmp, '[Content_Types].xml'), contentTypesXml(n), 'utf8');
  fs.writeFileSync(path.join(tmp, '_rels', '.rels'), rootRelsXml(), 'utf8');
  fs.writeFileSync(path.join(tmp, 'word', '_rels', 'document.xml.rels'), documentRelsXml(n), 'utf8');
  fs.writeFileSync(path.join(tmp, 'word', 'document.xml'), documentXml(n), 'utf8');

  // Package: order matters little for OOXML, but store [Content_Types].xml first.
  const tmpDocx = path.join(tmp, 'book.docx');
  execFileSync('zip', ['-X', '-r', '-q', tmpDocx, '[Content_Types].xml', '_rels', 'word'], {
    cwd: tmp,
  });
  fs.copyFileSync(tmpDocx, outPath);
  fs.rmSync(tmp, { recursive: true, force: true });

  const sizeMb = (fs.statSync(outPath).size / 1024 / 1024).toFixed(2);
  console.log(`\nDOCX written: ${outPath} (${n} pages, ${sizeMb} MB)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// Builds a formal RTL Persian lab report for «نیم جمع‌کننده و تمام جمع‌کننده»
// following the plain academic structure of گزارشکار نهم, then renders it to
// PDF with Playwright Firefox (pixel-perfect Persian shaping) + pdf-lib.

const fs = require('fs');
const path = require('path');
const { firefox } = require('playwright');
const { PDFDocument } = require('pdf-lib');

const ROOT = __dirname;
const FONT_DIR = path.join(ROOT, '..', 'node_modules', '@fontsource', 'vazirmatn', 'files');
const toFileURL = (p) => 'file://' + p.split(path.sep).join('/');
const img = (f) => toFileURL(path.join(ROOT, 'img', f));

// Formal, classic academic page CSS (plain, student-like).
const css = `
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #dcdcdc; }
body {
  font-family: 'Vazirmatn', 'Noto Sans Arabic', Tahoma, sans-serif;
  color: #1a1a1a; line-height: 2; font-size: 13.5px;
}
.page {
  position: relative; width: 210mm; height: 297mm;
  padding: 18mm 18mm 16mm; margin: 0 auto 6mm; background: #fff;
  overflow: hidden; display: flex; flex-direction: column;
}
h1, h2, h3, h4 { margin: 0 0 10px; color: #111; line-height: 1.7; }
.sec { font-size: 16px; font-weight: 800; margin: 6px 0 12px; border-bottom: 1.5px solid #333; padding-bottom: 5px; }
.sub { font-size: 14px; font-weight: 700; margin: 14px 0 8px; color: #222; }
p { margin: 0 0 12px; text-align: justify; }
.center { text-align: center; }
.en { direction: ltr; unicode-bidi: embed; font-family: 'DejaVu Sans Mono', 'Courier New', monospace; }

/* جلد */
.cover { justify-content: flex-start; text-align: center; padding-top: 16mm; }
.cover .bism { font-size: 18px; font-weight: 700; color: #14532d; margin-bottom: 22px; }
.cover .uni { font-size: 22px; font-weight: 900; margin-bottom: 6px; }
.cover .faculty { font-size: 14px; color: #333; margin-bottom: 30px; }
.cover .lab-no { font-size: 16px; font-weight: 800; color: #7f1d1d; margin-bottom: 18px; }
.cover .title-box {
  border: 2px solid #1e3a8a; border-radius: 10px; padding: 20px 16px; margin: 10px auto 34px;
  max-width: 150mm; background: #f8fafc;
}
.cover .report-title { font-size: 21px; font-weight: 900; color: #1e3a8a; line-height: 1.9; }
.cover table.info { width: 158mm; margin: 0 auto; border-collapse: collapse; font-size: 14px; }
.cover table.info td { padding: 10px 14px; border: 1px solid #94a3b8; text-align: center; white-space: nowrap; }
.cover table.info td.k { background: #f1f5f9; font-weight: 700; }
.cover .semester { margin-top: 26px; font-size: 14px; font-weight: 700; }

/* جداول */
table.t { width: 100%; border-collapse: collapse; margin: 6px 0 14px; font-size: 12.5px; }
table.t th, table.t td { border: 1px solid #475569; padding: 6px 8px; text-align: center; }
table.t thead th { background: #e2e8f0; font-weight: 800; color: #0f172a; }
table.t .hd { background: #cbd5e1; font-weight: 800; }
table.t .val { direction: ltr; unicode-bidi: embed; font-family: 'DejaVu Sans Mono', monospace; }
table.t.ltr { direction: ltr; }
table.t.ltr th, table.t.ltr td { text-align: center; }
table.t.ltr .fa { direction: rtl; unicode-bidi: embed; }

/* لیست */
ul.dots { margin: 0 0 12px; padding-inline-start: 22px; }
ul.dots li { margin-bottom: 6px; text-align: justify; }

/* فرمول باکس */
.formula {
  background: #f8fafc; border: 1px solid #cbd5e1; border-inline-start: 4px solid #1e3a8a;
  border-radius: 6px; padding: 10px 14px; margin: 8px 0 14px; text-align: center;
  font-size: 15px; font-weight: 700;
}

/* تصاویر شبیه‌سازی */
.shot { display: block; width: 100%; max-height: 150mm; object-fit: contain; border: 1px solid #999; margin: 4px 0 6px; }
.shot-half { width: 100%; max-height: 118mm; object-fit: contain; border: 1px solid #999; }
figure { margin: 0 0 14px; }
figcaption { font-size: 11.5px; color: #334155; text-align: center; margin-top: 4px; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.foot { margin-top: auto; padding-top: 8px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 10.5px; color: #64748b; }
.end { text-align: center; font-weight: 900; color: #7f1d1d; font-size: 16px; margin-top: 20px; }
`;

const faDigits = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);

// ---------- pages ----------
function coverPage() {
  return `
  <section class="page cover">
    <div class="bism">بسم الله الرحمن الرحیم</div>
    <div class="uni">دانشگاه بین‌المللی امام خمینی (ره)</div>
    <div class="faculty">دانشکدهٔ فنی و مهندسی — گروه مهندسی کامپیوتر</div>
    <div class="lab-no">گزارش کار آزمایشگاه مدار منطقی — آزمایش شمارهٔ ۲</div>
    <div class="title-box">
      <div class="report-title">طراحی و شبیه‌سازی مدار نیم جمع‌کننده<br/>و تمام جمع‌کننده با گیت‌های منطقی</div>
    </div>
    <table class="info">
      <tr><td class="k">نام دانشجو</td><td>هلن عارف</td><td class="k">شماره دانشجویی</td><td>۴۰۴۶۱۲۷۰۰۱</td></tr>
      <tr><td class="k">نام دانشجو</td><td>محمد یکه فلاح</td><td class="k">شماره دانشجویی</td><td>۴۰۴۶۱۲۷۰۲۳</td></tr>
      <tr><td class="k">انجام شده توسط</td><td colspan="3">هلن عارف</td></tr>
      <tr><td class="k">نام استاد</td><td colspan="3">دکتر زهرا یعقوبی</td></tr>
    </table>
  </section>`;
}

function objectivePage() {
  return `
  <section class="page">
    <div class="sec">۱. هدف آزمایش</div>
    <p>
      هدف از این آزمایش، طراحی، تحلیل و شبیه‌سازی مدار <b>نیم جمع‌کننده</b> و <b>تمام جمع‌کننده</b> با استفاده
      از گیت‌های منطقی XOR، AND و OR و بررسی عملکرد صحیح آن‌ها در جمع کردن بیت‌های باینری و تولید بیت
      حاصل‌جمع (Sum) و بیت نقلی (Carry) می‌باشد. در ادامه با اتصال دو نیم جمع‌کننده، یک تمام جمع‌کننده
      ساخته شده و صحت خروجی‌های آن در تمام حالات ورودی در محیط پروتئوس راستی‌آزمایی می‌شود.
    </p>

    <div class="sec" style="margin-top:22px;">۲. قطعات مورد نیاز</div>
    <table class="t">
      <thead><tr><th>ردیف</th><th>نام قطعه</th><th>تعداد</th></tr></thead>
      <tbody>
        <tr><td>۱</td><td>XOR_2 (گیت یا انحصاری دو ورودی)</td><td>۳</td></tr>
        <tr><td>۲</td><td>AND_2 (گیت وای دو ورودی)</td><td>۳</td></tr>
        <tr><td>۳</td><td>OR_2 (گیت یا دو ورودی)</td><td>۱</td></tr>
        <tr><td>۴</td><td>Logic State (منطق ورودی)</td><td>۵</td></tr>
        <tr><td>۵</td><td>Logic Probe (نشانگر خروجی)</td><td>۴</td></tr>
      </tbody>
    </table>
  </section>`;
}

function theoryHalfPage() {
  return `
  <section class="page">
    <div class="sec">۳. تئوری آزمایش</div>
    <div class="sub">۳-۱. نیم جمع‌کننده (Half Adder)</div>
    <p>
      نیم جمع‌کننده ساده‌ترین مدار حسابی در سیستم دیجیتال است که وظیفهٔ جمع کردن دو بیت ورودی را بر عهده دارد.
      این مدار دو ورودی A و B و دو خروجی دارد: حاصل‌جمع <span class="en">S</span> و بیت نقلی
      <span class="en">C</span>. چون نیم جمع‌کننده بیت نقلی ورودی را در نظر نمی‌گیرد، تنها برای جمع دو بیت
      بدون توجه به نقلیِ مرحلهٔ قبل به کار می‌رود.
    </p>
    <div class="formula">S = A ⊕ B &nbsp;&nbsp;&nbsp; ، &nbsp;&nbsp;&nbsp; C = A · B</div>
    <p>
      بنابراین خروجی حاصل‌جمع با گیت XOR و بیت نقلی با گیت AND پیاده‌سازی می‌شود. در مدار شبیه‌سازی‌شده،
      گیت <span class="en">U1</span> (XOR) مقدار S و گیت <span class="en">U5</span> (AND) مقدار C را تولید می‌کند.
    </p>

    <div class="sub">جدول صحت نیم جمع‌کننده</div>
    <table class="t ltr">
      <thead><tr><th>A</th><th>B</th><th>حاصل‌جمع S</th><th>نقلی C</th><th class="val">A+B</th></tr></thead>
      <tbody>
        <tr><td class="val">0</td><td class="val">0</td><td class="val">0</td><td class="val">0</td><td class="val">00</td></tr>
        <tr><td class="val">0</td><td class="val">1</td><td class="val">1</td><td class="val">0</td><td class="val">01</td></tr>
        <tr><td class="val">1</td><td class="val">0</td><td class="val">1</td><td class="val">0</td><td class="val">01</td></tr>
        <tr><td class="val">1</td><td class="val">1</td><td class="val">0</td><td class="val">1</td><td class="val">10</td></tr>
      </tbody>
    </table>
    <p>
      مطابق جدول، تنها در حالتی که هر دو ورودی یک باشند، حاصل‌جمع صفر و بیت نقلی یک می‌شود؛ زیرا جمع
      ۱+۱ در باینری برابر ۱۰ است که رقم کم‌ارزش به S و رقم پرارزش به C منتقل می‌گردد.
    </p>
  </section>`;
}

function theoryFullPage() {
  return `
  <section class="page">
    <div class="sub">۳-۲. تمام جمع‌کننده (Full Adder)</div>
    <p>
      تمام جمع‌کننده مداری است که علاوه بر دو بیت ورودی A و B، بیت نقلی ورودی
      <span class="en">Cin</span> را نیز با می‌گیرد و در نتیجه می‌تواند برای جمع چند بیت متوالی
      (زنجیره‌ای) به کار رود. این مدار دو خروجی دارد: حاصل‌جمع <span class="en">S</span> و
      بیت نقلی خروجی <span class="en">Cout</span>.
    </p>
    <div class="formula">S = A ⊕ B ⊕ Cin</div>
    <div class="formula">Cout = (A · B) + (Cin · (A ⊕ B))</div>
    <p>
      برای ساخت تمام جمع‌کننده از دو نیم جمع‌کننده و یک گیت OR استفاده می‌شود. در مدار شبیه‌سازی‌شده،
      گیت‌های <span class="en">U2</span> و <span class="en">U3</span> (XOR) حاصل‌جمع را می‌سازند،
      گیت‌های <span class="en">U6</span> و <span class="en">U7</span> (AND) جملات نقلی را تولید کرده و
      گیت <span class="en">U8</span> (OR) بیت نقلی نهایی Cout را به دست می‌دهد.
    </p>

    <div class="sub">جدول صحت تمام جمع‌کننده</div>
    <table class="t ltr">
      <thead><tr><th>A</th><th>B</th><th>Cin</th><th>حاصل‌جمع S</th><th>نقلی Cout</th><th class="val">A+B+Cin</th></tr></thead>
      <tbody>
        <tr><td class="val">0</td><td class="val">0</td><td class="val">0</td><td class="val">0</td><td class="val">0</td><td class="val">0</td></tr>
        <tr><td class="val">0</td><td class="val">0</td><td class="val">1</td><td class="val">1</td><td class="val">0</td><td class="val">1</td></tr>
        <tr><td class="val">0</td><td class="val">1</td><td class="val">0</td><td class="val">1</td><td class="val">0</td><td class="val">1</td></tr>
        <tr><td class="val">0</td><td class="val">1</td><td class="val">1</td><td class="val">0</td><td class="val">1</td><td class="val">10</td></tr>
        <tr><td class="val">1</td><td class="val">0</td><td class="val">0</td><td class="val">1</td><td class="val">0</td><td class="val">1</td></tr>
        <tr><td class="val">1</td><td class="val">0</td><td class="val">1</td><td class="val">0</td><td class="val">1</td><td class="val">10</td></tr>
        <tr><td class="val">1</td><td class="val">1</td><td class="val">0</td><td class="val">0</td><td class="val">1</td><td class="val">10</td></tr>
        <tr><td class="val">1</td><td class="val">1</td><td class="val">1</td><td class="val">1</td><td class="val">1</td><td class="val">11</td></tr>
      </tbody>
    </table>
    <p>
      در این جدول حاصل جمع سه بیت ورودی به صورت عدد باینری دو رقمی نمایش داده شده است؛ رقم کم‌ارزش
      همان S و رقم پرارزش همان Cout است.
    </p>
  </section>`;
}

function workingPage() {
  return `
  <section class="page">
    <div class="sec">۴. توضیح عملکرد مدار</div>
    <div class="sub">۴-۱. عملکرد نیم جمع‌کننده</div>
    <ul class="dots">
      <li>ورودی‌های A و B هم‌زمان به گیت XOR (U1) و گیت AND (U5) داده می‌شوند.</li>
      <li>خروجی گیت XOR برابر حاصل‌جمع S است؛ یعنی وقتی دو ورودی متفاوت باشند S=1 و وقتی یکسان باشند S=0.</li>
      <li>خروجی گیت AND برابر بیت نقلی C است؛ تنها وقتی C=1 می‌شود که هر دو ورودی A و B برابر یک باشند.</li>
    </ul>
    <div class="sub">۴-۲. عملکرد تمام جمع‌کننده</div>
    <ul class="dots">
      <li>در مرحلهٔ نخست گیت XOR اول (U2) جمع A و B را محاسبه می‌کند: <span class="en">P = A ⊕ B</span>.</li>
      <li>گیت XOR دوم (U3) مقدار P را با نقلی ورودی Cin جمع می‌کند و حاصل‌جمع نهایی S را تولید می‌نماید: <span class="en">S = P ⊕ Cin</span>.</li>
      <li>گیت AND اول (U6) شرط <span class="en">A·B</span> و گیت AND دوم (U7) شرط <span class="en">Cin·(A⊕B)</span> را می‌سازد.</li>
      <li>گیت OR (U8) دو جملهٔ نقلی را ترکیب کرده و بیت نقلی خروجی Cout را به دست می‌دهد.</li>
      <li>بنابراین Cout هر زمان یک می‌شود که حداقل دو مورد از سه ورودی A، B و Cin برابر یک باشند.</li>
    </ul>
    <div class="callout" style="background:#f8fafc;border:1px solid #cbd5e1;border-inline-start:4px solid #7f1d1d;border-radius:6px;padding:10px 14px;margin-top:14px;">
      <p style="margin:0;">
        <b>نکته:</b> در تمام تصاویر شبیه‌سازی، نشانگرهای قرمز رنگ بیانگر منطق ۱ و نشانگرهای آبی/تیره بیانگر
        منطق ۰ هستند. با تغییر کلیدهای ورودی (Logic State) خروجی‌ها مطابق جدول صحت تغییر می‌کنند.
      </p>
    </div>
  </section>`;
}

// each simulation record: file, HA inputs/outputs, FA inputs/outputs, caption
const sims = [
  { f: 'ha_fa_01.jpg', ha: ['1', '1', '0', '1'], fa: ['0', '0', '0', '0', '0'], note: 'نیم جمع‌کننده: A=1، B=1 ⇒ S=0 و C=1 (۱+۱=۱۰). تمام جمع‌کننده: هر سه ورودی صفر ⇒ S=0 و Cout=0.' },
  { f: 'ha_fa_02.jpg', ha: ['0', '0', '0', '0'], fa: ['1', '1', '1', '1', '1'], note: 'نیم جمع‌کننده: A=0، B=0 ⇒ S=0 و C=0. تمام جمع‌کننده: A=1، B=1، Cin=1 ⇒ S=1 و Cout=1 (۱+۱+۱=۱۱).' },
  { f: 'ha_fa_03.jpg', ha: ['0', '0', '0', '0'], fa: ['1', '1', '0', '0', '1'], note: 'تمام جمع‌کننده: A=1، B=1، Cin=0 ⇒ S=0 و Cout=1 (۱+۱=۱۰).' },
  { f: 'ha_fa_04.jpg', ha: ['1', '0', '1', '0'], fa: ['0', '0', '1', '1', '0'], note: 'نیم جمع‌کننده: A=1، B=0 ⇒ S=1 و C=0. تمام جمع‌کننده: A=0، B=0، Cin=1 ⇒ S=1 و Cout=0.' },
  { f: 'ha_fa_05.jpg', ha: ['0', '0', '0', '0'], fa: ['1', '0', '0', '1', '0'], note: 'تمام جمع‌کننده: A=1، B=0، Cin=0 ⇒ S=1 و Cout=0.' },
  { f: 'ha_fa_06.jpg', ha: ['0', '0', '0', '0'], fa: ['1', '1', '0', '0', '1'], note: 'تمام جمع‌کننده: A=1، B=1، Cin=0 ⇒ S=0 و Cout=1.' },
  { f: 'ha_fa_07.jpg', ha: ['0', '0', '0', '0'], fa: ['0', '1', '1', '0', '1'], note: 'تمام جمع‌کننده: A=0، B=1، Cin=1 ⇒ S=0 و Cout=1 (۰+۱+۱=۱۰).' },
  { f: 'ha_fa_08.jpg', ha: ['1', '0', '1', '0'], fa: ['0', '1', '0', '1', '0'], note: 'نیم جمع‌کننده: A=1، B=0 ⇒ S=1 و C=0. تمام جمع‌کننده: A=0، B=1، Cin=0 ⇒ S=1 و Cout=0.' },
];

function simPageHeader() {
  return `
  <section class="page">
    <div class="sec">۵. شبیه‌سازی در محیط پروتئوس (Proteus)</div>
    <p>
      در ادامه، مدار نیم جمع‌کننده (بخش بالا شامل گیت‌های U1 و U5) و مدار تمام جمع‌کننده (بخش پایین شامل
      گیت‌های U2، U3، U6، U7 و U8) در محیط پروتئوس شبیه‌سازی شده و خروجی‌ها برای حالات مختلف ورودی با
      جدول صحت مقایسه می‌گردند. در هر شکل، دو نشانگر سمت راست مربوط به S و C نیم جمع‌کننده و دو نشانگر
      سمت چپ مربوط به S و Cout تمام جمع‌کننده است.
    </p>
    <figure>
      <img class="shot" src="${img(sims[0].f)}" alt="شبیه‌سازی حالت اول"/>
      <figcaption>شکل ۱</figcaption>
    </figure>
  </section>`;
}

function simImagePage(idx) {
  const s = sims[idx];
  return `
  <section class="page">
    <figure>
      <img class="shot" src="${img(s.f)}" alt="شبیه‌سازی حالت ${faDigits(idx + 1)}"/>
      <figcaption>شکل ${faDigits(idx + 1)}</figcaption>
    </figure>
  </section>`;
}

function conclusionPage() {
  return `
  <section class="page">
    <div class="sec">۶. نتیجه‌گیری</div>
    <p>
      در این آزمایش، مدارهای نیم جمع‌کننده و تمام جمع‌کننده با استفاده از گیت‌های منطقی XOR، AND و OR
      طراحی و در محیط پروتئوس شبیه‌سازی شدند. با اعمال ترکیب‌های مختلف به ورودی‌ها و مشاهدهٔ خروجی‌ها،
      تطابق کامل رفتار مدار با جدول صحت نظری تأیید گردید.
    </p>
    <ul class="dots">
      <li>نیم جمع‌کننده تنها دو ورودی را جمع می‌کند و بیت نقلی ورودی را پشتیبانی نمی‌نماید؛ به همین دلیل فقط برای جمع بیت کم‌ارزش مناسب است.</li>
      <li>تمام جمع‌کننده با در نظر گرفتن بیت نقلی ورودی، امکان جمع زنجیره‌ای بیت‌ها را فراهم می‌کند و پایهٔ ساخت جمع‌کننده‌های چندبیتی (مانند جمع‌کنندهٔ موازی) است.</li>
      <li>اتصال دو نیم جمع‌کننده به همراه یک گیت OR، ساده‌ترین روش پیاده‌سازی یک تمام جمع‌کننده است.</li>
    </ul>
    <p>
      در مجموع، صحت عملکرد هر دو مدار در تمامی حالات ورودی مشاهده شد و هدف آزمایش به‌طور کامل محقق گردید.
    </p>
    <div class="end">پایان</div>
  </section>`;
}

// ---------- assemble ----------
function buildHtml() {
  const fontFaces = ['400', '500', '700', '900']
    .map(
      (w) => `@font-face{font-family:'Vazirmatn';font-style:normal;font-weight:${w};src:url('${toFileURL(
        path.join(FONT_DIR, `vazirmatn-arabic-${w}-normal.woff2`)
      )}') format('woff2');}`
    )
    .join('\n');

  const body =
    coverPage() +
    objectivePage() +
    theoryHalfPage() +
    theoryFullPage() +
    workingPage() +
    simPageHeader() +
    sims.slice(1).map((_, i) => simImagePage(i + 1)).join('') +
    conclusionPage();

  return `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8"/>
<title>گزارش کار مدار منطقی — نیم جمع‌کننده و تمام جمع‌کننده</title>
<style>${fontFaces}\n${css}</style></head><body>${body}</body></html>`;
}

async function main() {
  fs.writeFileSync(path.join(ROOT, 'report-adder.html'), buildHtml(), 'utf8');
  const browser = await firefox.launch();
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
  await page.goto(toFileURL(path.join(ROOT, 'report-adder.html')));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  const count = await page.locator('section.page').count();
  const overflow = [];
  const pdf = await PDFDocument.create();

  for (let i = 0; i < count; i++) {
    const el = page.locator('section.page').nth(i);
    const box = await el.evaluate((node) => ({
      sh: node.scrollHeight,
      ch: node.clientHeight,
      title: (node.querySelector('.sec,.report-title') || {}).textContent || '',
    }));
    if (box.sh - box.ch > 2) overflow.push({ i, ...box });
    const png = await el.screenshot({ type: 'png' });
    const imgEmb = await pdf.embedPng(png);
    const pg = pdf.addPage([595.28, 841.89]);
    pg.drawImage(imgEmb, { x: 0, y: 0, width: 595.28, height: 841.89 });
    process.stdout.write(`page ${i + 1}/${count} ok\n`);
  }

  const bytes = await pdf.save();
  const out = path.join(ROOT, 'گزارش کار آزمایشگاه ۲ - هلن عارف.pdf');
  fs.writeFileSync(out, bytes);
  await browser.close();
  console.log('\nPDF written:', out);
  if (overflow.length) {
    console.log('\n⚠ OVERFLOW PAGES:');
    overflow.forEach((o) => console.log(`  page ${o.i + 1}: content ${o.sh} > ${o.ch}  (${o.title.trim().slice(0, 40)})`));
  } else {
    console.log('No overflow detected. ✅');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

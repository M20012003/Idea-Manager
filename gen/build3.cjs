// Builds «گزارش کار آزمایشگاه ۳ — کنترل دو LED به‌صورت مجزا» (RTL Persian HTML)
// and renders it to an A4 PDF with Playwright Firefox (pixel-perfect Persian
// shaping) + pdf-lib. Same visual style as گزارش کار ۱ (report.css), but the
// «مشخصات مدار» block is omitted from every problem page.

const fs = require('fs');
const path = require('path');
const { firefox } = require('playwright');
const { PDFDocument } = require('pdf-lib');
const { problems } = require('./data3.cjs');

const ROOT = __dirname;
const IMG_DIR = path.join(ROOT, 'img3');
const LOGO = path.join(ROOT, 'img', 'logo.png');
const FONT_DIR = path.join(ROOT, '..', 'node_modules', '@fontsource', 'vazirmatn', 'files');
const toFileURL = (p) => 'file://' + p.split(path.sep).join('/');

// ---------- Arduino/C++ syntax highlighter (single-pass, safe) ----------
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function highlight(code) {
  const rx =
    /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*")|\b(int|void|float|const|if|else|while|for|return|true|false|char|long|double|bool|unsigned|INPUT_PULLUP|INPUT|OUTPUT|HIGH|LOW)\b|\b([A-Za-z_]\w*)(?=\s*\()|\b(\d+(?:\.\d+)?)\b/g;
  let out = '';
  let last = 0;
  let m;
  while ((m = rx.exec(code)) !== null) {
    out += esc(code.slice(last, m.index));
    const [full, com, str, kw, fn, num] = m;
    if (com) out += `<span class="c-com">${esc(full)}</span>`;
    else if (str) out += `<span class="c-str">${esc(full)}</span>`;
    else if (kw) out += `<span class="c-kw">${esc(full)}</span>`;
    else if (fn) out += `<span class="c-fn">${esc(full)}</span>`;
    else if (num) out += `<span class="c-num">${esc(full)}</span>`;
    last = rx.lastIndex;
  }
  out += esc(code.slice(last));
  return out;
}
const faDigits = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);

// ---------- reusable HTML fragments ----------
function codeBlock(code, cols = 1) {
  const lines = highlight(code).split('\n');
  const rows = lines
    .map(
      (l, i) =>
        `<div class="cl"><span class="ln">${i + 1}</span><span class="lc">${
          l || '&nbsp;'
        }</span></div>`
    )
    .join('');
  return `<div class="code" dir="ltr" style="--cols:${cols}"><pre class="code-pre">${rows}</pre></div>`;
}

function problemPage(p) {
  const longCode = p.code.split('\n').length > 16;
  const notes = p.notes.map((x) => `<li>${x}</li>`).join('');
  return `
  <section class="page">
    <div class="runhead"><span>گزارش کار آزمایشگاه سیستم‌های دیجیتال — آزمایش شمارهٔ ۳</span><span>آردوینو</span></div>
    <div class="prob-head">
      <div class="prob-chip">مسئلهٔ ${p.n}</div>
      <h2 class="prob-title">${p.title}</h2>
    </div>
    <div class="prob-body">
      <div class="prob-main">
        <div class="block">
          <div class="block-tag">صورت مسئله</div>
          <p class="statement">${p.statement}</p>
        </div>
        <div class="block">
          <div class="block-tag">کد آردوینو</div>
          ${codeBlock(p.code, longCode ? 2 : 1)}
        </div>
      </div>
      <aside class="prob-side">
        <div class="notes">
          <div class="meta-title">نکات کلیدی</div>
          <ul>${notes}</ul>
        </div>
      </aside>
    </div>
    <div class="block explain-block">
      <div class="block-tag">توضیح عملکرد</div>
      <p class="explain">${p.explain}</p>
    </div>
    <figure class="shot-wrap">
      <img class="shot" src="${toFileURL(path.join(IMG_DIR, p.img))}" alt="شبیه‌سازی مسئله ${p.n}"/>
      <figcaption>شکل ${p.n}: محیط شبیه‌سازی Tinkercad Circuits — چیدمان بردبورد، سیم‌کشی و کد اجراشده</figcaption>
    </figure>
    <div class="pagefoot"><span>مهدیه غلامی — ۴۰۱۶۱۲۳۰۵۸</span><span class="grp">گروه ۶۰</span></div>
  </section>`;
}

// ---------- static pages ----------
function coverPage() {
  return `
  <section class="page cover">
    <div class="cover-top">
      <img class="uni-logo" src="${toFileURL(LOGO)}" alt="لوگوی دانشگاه بین‌المللی امام خمینی (ره)"/>
      <div class="bism">بسم الله الرحمن الرحیم</div>
      <div class="uni">دانشگاه بین‌المللی امام خمینی (ره)</div>
      <div class="faculty">دانشکدهٔ فنی و مهندسی — گروه مهندسی برق</div>
    </div>
    <div class="cover-mid">
      <div class="lab-badge">
        <svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><rect x="7" y="7" width="10" height="10" rx="2"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/></svg>
      </div>
      <div class="lab-no">گزارش کار آزمایشگاه — شمارهٔ ۳</div>
      <h1 class="cover-title">کنترل دو LED به‌صورت مجزا با آردوینو<br/>و زمان‌بندی مستقل خروجی‌های دیجیتال</h1>
      <div class="cover-sub">پیاده‌سازی حلقهٔ for، متغیرهای سراسری، کار با دکمه، سنسور دما و زمان‌بندی با millis() در محیط Tinkercad Circuits</div>
    </div>
    <div class="cover-meta">
      <div class="cm-row"><span class="cm-k">نام دانشجو</span><span class="cm-v">مهدیه غلامی</span></div>
      <div class="cm-row"><span class="cm-k">شمارهٔ دانشجویی</span><span class="cm-v">۴۰۱۶۱۲۳۰۵۸</span></div>
      <div class="cm-row"><span class="cm-k">نام استاد</span><span class="cm-v">جناب آقای مهندس سلیمانی الموتی</span></div>
      <div class="cm-row"><span class="cm-k">گروه</span><span class="cm-v">۶۰</span></div>
      <div class="cm-row"><span class="cm-k">درس</span><span class="cm-v">آزمایشگاه سیستم‌های دیجیتال</span></div>
      <div class="cm-row"><span class="cm-k">تاریخ</span><span class="cm-v">۱۵ آبان ۱۴۰۵</span></div>
    </div>
    <div class="cover-foot">۱۵ آبان ۱۴۰۵</div>
  </section>`;
}

function abstractPage() {
  const toc = [
    'مقدمه', 'هدف آزمایش', 'مبانی: digitalWrite، delay و حلقهٔ for',
    'متغیرهای سراسری و ریل Ground', 'شرح قسمت عملی آزمایش',
    'حل المسائل (تکالیف ۱ تا ۲)', 'نتایج شبیه‌سازی', 'تحلیل نتایج',
    'نتیجه‌گیری', 'پیشنهادات', 'منابع'
  ].map((t, i) => `<li><span class="toc-num">${faDigits(i + 1)}</span><span class="toc-t">${t}</span><span class="toc-dots"></span></li>`).join('');
  return `
  <section class="page">
    <div class="runhead"><span>گزارش کار آزمایشگاه سیستم‌های دیجیتال</span><span>چکیده و فهرست</span></div>
    <h2 class="sec-title"><span class="sec-bar"></span>چکیده</h2>
    <p class="para">در این گزارش، کنترل دو LED به‌صورت مجزا و مستقل با استفاده از میکروکنترلر آردوینو بررسی شده است. ابتدا فرمان‌های پایه مانند <code>pinMode</code>، <code>digitalWrite</code> و <code>delay</code> مرور و سپس مفهوم حلقهٔ <code>for</code> برای تکرار دستورات، متغیرهای سراسری برای کنترل پارامترها و ریل Ground روی بردبورد معرفی می‌شود. در ادامه، دوازده تکلیف عملی شامل کنترل مستقل دو LED، شمارش با حلقه، تعامل با دکمه، خواندن سنسور دما و زمان‌بندی هم‌زمان با <code>millis()</code> طراحی و در محیط شبیه‌سازی Tinkercad Circuits پیاده‌سازی گردیده‌اند. نتایج نشان می‌دهد که تمامی مدارها مطابق رفتار مورد انتظار عمل می‌کنند و هر خروجی به‌خوبی به‌صورت مستقل از دیگری قابل کنترل است.</p>
    <div class="kw-box">
      <span class="kw-label">کلیدواژه‌ها:</span>
      ${['آردوینو', 'کنترل مستقل LED', 'حلقهٔ for', 'متغیر سراسری', 'ریل Ground', 'دکمهٔ فشاری', 'سنسور دما', 'millis()'].map((k) => `<span class="kw">${k}</span>`).join('')}
    </div>
    <h2 class="sec-title"><span class="sec-bar"></span>فهرست مطالب</h2>
    <ul class="toc">${toc}</ul>
    <div class="pagefoot"><span>مهدیه غلامی — ۴۰۱۶۱۲۳۰۵۸</span><span class="grp">گروه ۶۰</span></div>
  </section>`;
}

function introPage() {
  return `
  <section class="page">
    <div class="runhead"><span>گزارش کار آزمایشگاه سیستم‌های دیجیتال</span><span>مقدمه و هدف</span></div>
    <h2 class="sec-title"><span class="sec-bar"></span>۱. مقدمه</h2>
    <p class="para">در جلسات پیش آموختیم چگونه یک یا چند LED را به‌صورت هم‌زمان روشن و خاموش کنیم. در این جلسه، هدف کنترل روشن و خاموش‌شدن دو LED به‌صورت مجزا و مستقل از یکدیگر است. برای این کار از دو پین جداگانهٔ آردوینو استفاده و با بهره‌گیری از فرمان‌های <code>digitalWrite()</code> و <code>delay()</code> رفتار هر LED مستقل تنظیم می‌شود.</p>
    <p class="para">برای ساخت مدار، دو LED و دو مقاومت به دو پین دیجیتال متصل می‌گردند. یک ریل Ground از پین GND آردوینو به یکی از ردیف‌های کناری بردبورد وصل می‌شود؛ سپس هر قطعه‌ای که به آن ردیف متصل شود، مانند اتصال به زمین عمل می‌کند. این ریل، اتصالات پیچیده را کاهش داده و وصل‌کردن تعداد زیادی قطعه را ساده می‌سازد.</p>
    <h2 class="sec-title"><span class="sec-bar"></span>۲. هدف آزمایش</h2>
    <div class="goal-grid">
      <div class="goal"><span class="goal-i">۱</span><p>کنترل مستقل دو LED روی دو پین متفاوت آردوینو.</p></div>
      <div class="goal"><span class="goal-i">۲</span><p>به‌کارگیری حلقهٔ <code>for</code> برای تکرار دقیق تعداد دفعات چشمک.</p></div>
      <div class="goal"><span class="goal-i">۳</span><p>استفاده از متغیرهای سراسری برای پارامترهای قابل‌تنظیم.</p></div>
      <div class="goal"><span class="goal-i">۴</span><p>تعامل با دکمه، خواندن سنسور دما و زمان‌بندی با <code>millis()</code>.</p></div>
    </div>
    <div class="callout">
      <span class="callout-i">💡</span>
      <p>نکته: تعریف متغیرها بیرون از توابع (سراسری) باعث می‌شود آن‌ها در کل برنامه قابل دسترس باشند و تنها با تغییر یک مقدار، رفتار کل مدار به‌روز شود.</p>
    </div>
    <div class="pagefoot"><span>مهدیه غلامی — ۴۰۱۶۱۲۳۰۵۸</span><span class="grp">گروه ۶۰</span></div>
  </section>`;
}

function conceptsPage() {
  return `
  <section class="page">
    <div class="runhead"><span>گزارش کار آزمایشگاه سیستم‌های دیجیتال</span><span>مبانی و مفاهیم</span></div>
    <h2 class="sec-title"><span class="sec-bar"></span>۳. مبانی: digitalWrite، delay و حلقهٔ for</h2>
    <div class="two-col">
      <div class="concept">
        <div class="concept-h"><code>digitalWrite(pin, val)</code></div>
        <p>وضعیت پین خروجی را روی <code>HIGH</code> (روشن) یا <code>LOW</code> (خاموش) می‌برد و پایهٔ کنترل مستقل هر LED است.</p>
      </div>
      <div class="concept">
        <div class="concept-h"><code>delay(ms)</code></div>
        <p>به مدت مشخصی (میلی‌ثانیه) توقف ایجاد می‌کند و مدت روشن یا خاموش بودن هر LED را تعیین می‌نماید.</p>
      </div>
      <div class="concept">
        <div class="concept-h"><code>for (init; test; step)</code></div>
        <p>برای تکرار یک بلوک دستورات به تعداد معین به کار می‌رود؛ مثلاً چشمک‌زدن ده‌بارهٔ یک LED.</p>
      </div>
      <div class="concept">
        <div class="concept-h"><code>millis()</code></div>
        <p>زمان سپری‌شده از شروع برنامه را برمی‌گرداند و امکان زمان‌بندی هم‌زمان چند LED را بدون توقف برنامه فراهم می‌کند.</p>
      </div>
    </div>
    <h3 class="sub-title">متغیرهای سراسری و ریل Ground</h3>
    <p class="para">برای دسترسی به شمارهٔ پین‌ها و تعداد دفعات در کل برنامه، آن‌ها را به‌صورت متغیر سراسری (Global) و بیرون از توابع تعریف می‌کنیم. در طرف سخت‌افزار نیز یک ریل Ground از پین GND به ردیف کناری بردبورد متصل می‌شود تا پایانهٔ مشترک همهٔ قطعات را به‌سادگی فراهم آورد.</p>
    ${codeBlock(`int redLED = 9;        // متغیر سراسری: پین LED قرمز
int yellowLED = 10;    // متغیر سراسری: پین LED زرد
int blinkCount = 5;    // تعداد دفعات چشمک (قابل تغییر)`)}
    <div class="pagefoot"><span>مهدیه غلامی — ۴۰۱۶۱۲۳۰۵۸</span><span class="grp">گروه ۶۰</span></div>
  </section>`;
}

function hardwarePage() {
  return `
  <section class="page">
    <div class="runhead"><span>گزارش کار آزمایشگاه سیستم‌های دیجیتال</span><span>سخت‌افزار و روش کار</span></div>
    <h2 class="sec-title"><span class="sec-bar"></span>۴. معرفی برد آردوینو و بردبورد</h2>
    <p class="para">در برد آردوینو Uno، پین‌های ۰ تا ۱۳ برای ورودی و خروجی دیجیتال در دسترس‌اند و در این آزمایش عمدتاً از پین‌های ۹ و ۱۰ برای دو LED استفاده شده است. پین‌های آنالوگ A0 تا A5 برای خواندن سنسور دما به کار می‌روند و پین GND نیز ریل زمین بردبورد را تأمین می‌کند.</p>
    <div class="hw-grid">
      <div class="hw-card"><div class="hw-h">پین‌های دیجیتال ۹ و ۱۰</div><p>خروجی کنترل LED قرمز و زرد؛ هرکدام با یک مقاومت محدودکنندهٔ جریان به زمین متصل می‌شوند.</p></div>
      <div class="hw-card"><div class="hw-h">پین ورودی ۲ (دکمه)</div><p>با پیکربندی <code>INPUT_PULLUP</code> حالت فشرده دکمه برابر LOW است و مقاومت خارجی لازم نیست.</p></div>
      <div class="hw-card"><div class="hw-h">پین آنالوگ A0 (سنسور دما)</div><p>خروجی سنسور LM35/TMP36 را با <code>analogRead</code> می‌خواند.</p></div>
      <div class="hw-card"><div class="hw-h">ریل Ground</div><p>سیم از پین GND به ردیف کناری بردبورد؛ همهٔ اتصالات منفی از این ریل استفاده می‌کنند.</p></div>
    </div>
    <h2 class="sec-title"><span class="sec-bar"></span>۵. شرح قسمت عملی آزمایش</h2>
    <p class="para">به دلیل در دسترس نبودن فیزیکی برد، تمامی مدارها در محیط شبیه‌سازی آنلاین <b>Tinkercad Circuits</b> طراحی و اجرا شده‌اند. روش کار در هر تکلیف به شرح زیر است:</p>
    <ol class="steps">
      <li>قرار دادن برد آردوینو Uno و بردبورد و اتصال ریل Ground از پین GND.</li>
      <li>افزودن دو LED با مقاومت (و در صورت نیاز دکمه یا سنسور دما) و سیم‌کشی مطابق صورت مسئله.</li>
      <li>تعریف متغیرهای سراسری پین‌ها و تنظیم آن‌ها به‌عنوان خروجی در تابع <code>setup</code>.</li>
      <li>اجرای شبیه‌سازی با دکمهٔ Start و مشاهدهٔ رفتار مستقل LEDها و Serial Monitor.</li>
    </ol>
    <div class="callout">
      <span class="callout-i">⚡</span>
      <p>نکتهٔ ایمنی: پایهٔ بلند LED (آند) به پین خروجی و پایهٔ کوتاه (کاتد) از طریق یک مقاومت حدود ۲۲۰ اهم به ریل Ground متصل می‌شود تا جریان از حد مجاز فراتر نرود.</p>
    </div>
    <div class="pagefoot"><span>مهدیه غلامی — ۴۰۱۶۱۲۳۰۵۸</span><span class="grp">گروه ۶۰</span></div>
  </section>`;
}

function analysisPage() {
  return `
  <section class="page">
    <div class="runhead"><span>گزارش کار آزمایشگاه سیستم‌های دیجیتال</span><span>نتایج و تحلیل</span></div>
    <h2 class="sec-title"><span class="sec-bar"></span>۷. نتایج شبیه‌سازی</h2>
    <p class="para">پس از اجرای هر دوازده تکلیف در محیط Tinkercad، رفتار مشاهده‌شده با انتظار منطقی هر مدار مطابقت داشت. خلاصهٔ نتایج در جدول زیر آمده است:</p>
    <table class="res-table">
      <thead><tr><th>مسئله</th><th>خروجی مورد انتظار</th><th>نتیجهٔ مشاهده‌شده</th><th>وضعیت</th></tr></thead>
      <tbody>
        <tr><td>۱</td><td>روشن/خاموش مستقل دو LED</td><td>هر LED جداگانه با ریتم یک‌ثانیه‌ای</td><td class="ok">✔ صحیح</td></tr>
        <tr><td>۲ و ۹</td><td>۱۰ بار قرمز، سپس یک بار زرد</td><td>شمارش دقیق با حلقهٔ for</td><td class="ok">✔ صحیح</td></tr>
        <tr><td>۳ و ۸</td><td>کنترل LED با دکمه</td><td>روشن/خاموش شدن در زمان درست</td><td class="ok">✔ صحیح</td></tr>
        <tr><td>۴ و ۱۰</td><td>زمان‌های ۵ و ۳ و ۵ ثانیه</td><td>ترتیب و مدت زمان درست</td><td class="ok">✔ صحیح</td></tr>
        <tr><td>۵ و ۶</td><td>۵ بار قرمز / تأخیر متفاوت</td><td>ریتم‌های مستقل و نامتقارن</td><td class="ok">✔ صحیح</td></tr>
        <tr><td>۷</td><td>تعداد چشمک با متغیر سراسری</td><td>تغییر فقط با مقدار blinkCount</td><td class="ok">✔ صحیح</td></tr>
        <tr><td>۱۱</td><td>هشدار دما بالای ۳۰ درجه</td><td>روشن‌شدن LED در آستانه</td><td class="ok">✔ صحیح</td></tr>
        <tr><td>۱۲</td><td>دو LED با ۱ و ۲ ثانیه (millis)</td><td>زمان‌بندی هم‌زمان و مستقل</td><td class="ok">✔ صحیح</td></tr>
      </tbody>
    </table>
    <h2 class="sec-title"><span class="sec-bar"></span>۸. تحلیل نتایج</h2>
    <p class="para">در همهٔ مدارها، کلید موفقیت «استقلال خروجی‌ها» بود؛ یعنی تغییر وضعیت یک پین نباید بر پین دیگر اثر بگذارد. حلقهٔ <code>for</code> برای شمارش محدود و تابع <code>loop</code> برای تکرار نامحدود به کار رفت. در مسئلهٔ ۱۲ نشان داده شد که <code>millis()</code> برتری چشمگیری بر <code>delay()</code> دارد، زیرا برخلاف delay، برنامه را متوقف نمی‌کند و می‌توان چند LED را هم‌زمان با ریتم‌های متفاوت زمان‌بندی کرد. در مسئلهٔ ۱۱ نیز مقدار آنالوگ سنسور به یک کمیت فیزیکی تبدیل و با یک آستانه مقایسه شد که همان منطق تصمیم‌گیری دیجیتال است.</p>
    <div class="pagefoot"><span>مهدیه غلامی — ۴۰۱۶۱۲۳۰۵۸</span><span class="grp">گروه ۶۰</span></div>
  </section>`;
}

function conclusionPage() {
  return `
  <section class="page">
    <div class="runhead"><span>گزارش کار آزمایشگاه سیستم‌های دیجیتال</span><span>نتیجه‌گیری و پیشنهادات</span></div>
    <h2 class="sec-title"><span class="sec-bar"></span>۹. نتیجه‌گیری</h2>
    <p class="para">این آزمایش نشان داد که می‌توان چند خروجی دیجیتال را به‌طور کاملاً مستقل از یکدیگر کنترل کرد. با ترکیب فرمان‌های سادهٔ <code>digitalWrite</code> و <code>delay</code> و به‌کارگیری حلقهٔ <code>for</code> و متغیرهای سراسری، رفتارهای متنوعی از جمله چشمک‌زدن با شمارش دقیق، کنترل با دکمه، هشدار دما و زمان‌بندی هم‌زمان چند LED ساخته شد. استفاده از <code>millis()</code> نیز روش حرفه‌ای زمان‌بندی بدون توقف برنامه را نشان داد.</p>
    <h2 class="sec-title"><span class="sec-bar"></span>۱۰. پیشنهادات</h2>
    <ul class="nice-list">
      <li>جایگزین کردن همهٔ <code>delay()</code>ها با زمان‌بندی مبتنی بر <code>millis()</code> برای اجرای هم‌زمان چند کار.</li>
      <li>افزودن منطق ضدپرش (Debounce) برای دکمه جهت حذف فرمان‌های اشتباه ناشی از پرش مکانیکی.</li>
      <li>به‌کارگیری <code>analogWrite</code> (PWM) برای کنترل شدت روشنایی LEDها به‌جای فقط روشن و خاموش.</li>
      <li>استفاده از آرایه برای مدیریت هم‌زمان تعداد بیشتری LED با کدی کوتاه‌تر و خواناتر.</li>
    </ul>
    <h2 class="sec-title"><span class="sec-bar"></span>۱۱. منابع</h2>
    <ol class="refs">
      <li>جزوهٔ درس آزمایشگاه سیستم‌های دیجیتال، بخش آردوینو (جلسهٔ ۳) — م.ح. سلیمانی الموتی.</li>
      <li>مستندات رسمی Arduino.cc — Reference: digitalWrite, delay, for, millis, analogRead.</li>
      <li>مستندات Autodesk Tinkercad Circuits.</li>
      <li>Margolis, J. <i>Arduino Cookbook</i>, O'Reilly Media.</li>
    </ol>
    <div class="end-mark">پایان</div>
    <div class="pagefoot"><span>مهدیه غلامی — ۴۰۱۶۱۲۳۰۵۸</span><span class="grp">گروه ۶۰</span></div>
  </section>`;
}

// ---------- assemble full document ----------
function buildHtml() {
  const css = fs.readFileSync(path.join(ROOT, 'report.css'), 'utf8');
  const fontFaces = ['400', '500', '700', '900']
    .map(
      (w) => `@font-face{font-family:'Vazirmatn';font-style:normal;font-weight:${w};src:url('${toFileURL(
        path.join(FONT_DIR, `vazirmatn-arabic-${w}-normal.woff2`)
      )}') format('woff2');}`
    )
    .join('\n');
  const body =
    coverPage() +
    abstractPage() +
    introPage() +
    conceptsPage() +
    hardwarePage() +
    problems.map(problemPage).join('') +
    analysisPage() +
    conclusionPage();
  return `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8"/>
<title>گزارش کار آزمایشگاه سیستم‌های دیجیتال — شمارهٔ ۳ — مهدیه غلامی</title>
<style>${fontFaces}\n${css}</style></head><body>${body}</body></html>`;
}

// ---------- render to PDF ----------
async function main() {
  fs.writeFileSync(path.join(ROOT, 'report3.html'), buildHtml(), 'utf8');
  const browser = await firefox.launch();
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
  await page.goto(toFileURL(path.join(ROOT, 'report3.html')));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  const count = await page.locator('section.page').count();
  const overflow = [];
  const pdf = await PDFDocument.create();

  for (let i = 0; i < count; i++) {
    const el = page.locator('section.page').nth(i);
    const box = await el.evaluate((node) => {
      return { sh: node.scrollHeight, ch: node.clientHeight, title: (node.querySelector('.prob-title,.sec-title,.cover-title') || {}).textContent || '' };
    });
    if (box.sh - box.ch > 2) overflow.push({ i, ...box });
    const png = await el.screenshot({ type: 'png' });
    const img = await pdf.embedPng(png);
    const pg = pdf.addPage([595.28, 841.89]);
    pg.drawImage(img, { x: 0, y: 0, width: 595.28, height: 841.89 });
    process.stdout.write(`page ${i + 1}/${count} ok\n`);
  }

  const bytes = await pdf.save();
  const out = path.join(ROOT, 'گزارش کار آزمایشگاه ۳ - مهدیه غلامی.pdf');
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

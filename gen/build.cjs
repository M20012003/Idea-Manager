// Builds a beautiful RTL Persian lab report (HTML) and renders it to PDF
// using Playwright Firefox for pixel-perfect Persian text shaping, then
// assembles the per-page screenshots into an A4 PDF with pdf-lib.

const fs = require('fs');
const path = require('path');
const { firefox } = require('playwright');
const { PDFDocument } = require('pdf-lib');
const { problems } = require('./data.cjs');

const ROOT = __dirname;
const FONT_DIR = path.join(ROOT, '..', 'node_modules', '@fontsource', 'vazirmatn', 'files');
const toFileURL = (p) => 'file://' + p.split(path.sep).join('/');

// ---------- Arduino/C++ syntax highlighter (single-pass, safe) ----------
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function highlight(code) {
  const rx =
    /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*")|\b(int|void|float|const|if|else|while|for|return|true|false|char|long|double|bool|INPUT_PULLUP|INPUT|OUTPUT|HIGH|LOW)\b|\b([A-Za-z_]\w*)(?=\s*\()|\b(\d+(?:\.\d+)?)\b/g;
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
const faDigits = (n) =>
  String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);

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

const explains = {
  '۱': 'ساده‌ترین الگوی کنترل خروجی دیجیتال در این مدار پیاده‌سازی شده است. پین ۱۳ که روی برد آردوینو به یک LED داخلی متصل است، در تابع setup با فرمان pinMode به‌عنوان خروجی پیکربندی می‌شود. سپس در حلقهٔ loop، پین با digitalWrite در سطح HIGH قرار گرفته و LED روشن می‌شود؛ پس از یک ثانیه مکث، همان پین روی LOW رفته و LED خاموش می‌گردد. چون این دستورهای چهارگانه به‌صورت پی‌در‌پی و بی‌پایان تکرار می‌شوند، LED هر ثانیه یک‌بار چشمک می‌زند. این پروژه نقطهٔ شروع درک چرخهٔ اجرای برنامهٔ آردوینو و مفهوم سطح منطقی ولتاژ است.',
  '۲': 'در این مسئله، زمان‌های روشن و خاموش بودن LED از پیش ثابت نیستند، بلکه در زمان اجرا و از طریق پورت سریال قابل تغییرند. برد در تابع setup ارتباط سریال را با نرخ ۹۶۰۰ باز می‌کند و از کاربر می‌خواهد دو عدد (زمان روشن و زمان خاموش، بر حسب میلی‌ثانیه) وارد کند. در هر دور از loop ابتدا با Serial.available بررسی می‌شود که آیا داده‌ای در بافر موجود است؛ در صورت مثبت بودن، با دو فراخوانی Serial.parseInt آن دو عدد خوانده می‌شوند و پس از اطمینان از بزرگ‌تر بودنشان از صفر، در متغیرهای onTime و offTime ذخیره می‌گردند. سپس LED دقیقاً با همین مقادیر تازه چشمک می‌زند. حلقهٔ while نیز باقیماندهٔ بافر را پاک می‌کند تا خواندن بعدی با خطا انجام نشود.',
  '۳': 'این مدار یک کلید کنترلی ساده می‌سازد؛ دکمه به پین ۲ (ورودی) و LED به پین ۱۳ (خروجی) متصل شده‌اند. در هر دور از loop، وضعیت دکمه با digitalRead خوانده و در متغیر buttonState ذخیره می‌شود. اگر دکمه فشرده باشد و ورودی در سطح HIGH قرار گیرد، LED روشن می‌شود و در غیر این صورت خاموش می‌ماند. بنابراین رفتار LED آینه‌وارِ وضعیت دکمه است؛ به‌محض فشار دادن روشن و به‌محض رها کردن خاموش می‌گردد. در عمل برای اطمینان از سطح منطقی مشخص در حالت آزاد، یک مقاومت پول‌داون روی خط دکمه در نظر گرفته می‌شود.',
  '۴': 'در این پروژه دکمه نقش یک کلید تعویض‌کننده (Toggle) را دارد: به‌جای آن‌که LED فقط هنگام فشار دادن روشن بماند، هر بار فشردن دکمه وضعیت را بین دو حالت جابه‌جا می‌کند. دو LED قرمز و سبز نشانهٔ دو وضعیت «روشن» و «خاموش» هستند. نکتهٔ کلیدی، تشخیص لحظهٔ فشار دادن (نه وضعیت فشرده‌بودن) است؛ به همین دلیل وضعیت فعلی دکمه با وضعیت پیشین (lastButtonState) مقایسه می‌شود و تنها در «لبهٔ» تغییر، متغیر state معکوس می‌گردد. با پیکربندی INPUT_PULLUP حالت عادی دکمه HIGH و حالت فشرده LOW است و تأخیر ۵۰ میلی‌ثانیه‌ای پرش‌های مکانیکی کلید را حذف می‌کند.',
  '۵': 'این مدار دو LED را به‌صورت مکمل و یک‌درمیان روشن می‌کند. در نیم‌چرخهٔ نخست LED1 روشن و LED2 خاموش می‌شود و به مدت یک ثانیه در همین حالت می‌ماند؛ سپس در نیم‌چرخهٔ دوم جای دو LED عوض می‌شود. چون در هر لحظه همیشه یکی روشن و دیگری خاموش است، الگوی چشمکی دوفازی ایجاد می‌شود که پایهٔ بسیاری از نشانگرها، تابلوها و مدارهای زمان‌بندی دیجیتال به شمار می‌رود.',
  '۶': 'این مسئله دو هدف را هم‌زمان دنبال می‌کند: محافظت از LED و زمان‌بندی دقیق. LED از پین ۳ کنترل می‌شود و یک مقاومت ۲۲۰ اهم به‌صورت سری با آن قرار می‌گیرد تا جریان از حد مجاز (معمولاً حدود ۲۰ میلی‌آمپر) فراتر نرود و LED آسیب نبیند. در کد، LED به مدت دو ثانیه روشن و سپس دو ثانیه خاموش می‌ماند. مقدار مقاومت از قانون اهم به‌دست می‌آید: با ولتاژ تغذیهٔ ۵ ولت، افت ولتاژ LED حدود ۲ ولت و جریان ۲۰ میلی‌آمپر، مقاومت مطلوب نزدیک به ۱۵۰ اهم است و انتخاب ۲۲۰ اهم حاشیهٔ اطمینان ایجاد می‌کند.',
  '۷': 'LED RGB از سه بخش نوردهندهٔ قرمز، سبز و آبی تشکیل شده که هر یک با یک پین جداگانه کنترل می‌شود. در این برنامه در هر مرحله فقط یکی از سه رنگ فعال می‌گردد: نخست قرمز، سپس سبز و در پایان آبی؛ هر رنگ به مدت یک ثانیه روشن می‌ماند. با توجه به اصل ترکیب جمعی (additive) رنگ‌ها، فعال‌کردن هم‌زمان دو یا سه پایه می‌تواند رنگ‌های ثانویه‌ای مانند زرد، فیروزه‌ای و ارغوانی را نیز تولید کند؛ بنابراین این مدار پایهٔ ساخت نمایشگرهای رنگی است.',
  '۸': 'این پروژه ترکیب دو مفهوم پیشین است: دو LED RGB که به‌صورت متناوب و مکمل چشمک می‌زنند. در گام نخست RGB اول روی قرمز روشن می‌شود در حالی‌که RGB دوم کاملاً خاموش است؛ پس از گذشت زمان onTime1 حالت برعکس می‌شود و این بار RGB دوم روی سبز روشن می‌گردد. با جدا در نظر گرفتن دو متغیر زمانی onTime1 و onTime2 می‌توان ریتم هر دو LED را به‌طور مستقل تنظیم کرد. این الگو در تابلوهای روان و سامانه‌های هشدار چندرنگ کاربرد فراوان دارد.',
  '۹': 'در این مدار، سنسور دما نقش یک ورودی آنالوگ را بازی می‌کند. خروجی سنسور به پین A0 متصل است و مقدار آن با analogRead خوانده می‌شود؛ چون مبدل آنالوگ‌به‌دیجیتال آردوینو ۱۰ بیتی است، عددی بین ۰ تا ۱۰۲ به‌دست می‌آید. این عدد نخست با نسبت ۵/۱۰۳ به ولتاژ و سپس با ضریب ۱۰۰ به دما تبدیل می‌شود (در سنسورهای این سری هر درجه سلسیوس معادل ۱۰ میلی‌ولت است). اگر دما از آستانهٔ ۳۰ درجه بیشتر شود، LED قرمز به‌عنوان هشدار روشن و LED سبز خاموش می‌گردد؛ در غیر این صورت LED سبز روشن می‌ماند. مقدار دما نیز برای پایش روی Serial Monitor چاپ می‌شود.',
  '۱۰': 'سنسور نور LDR مقاومتی متغیر دارد که با افزایش شدت نور کاهش می‌یابد. این سنسور به‌همراه یک مقاومت ثابت، یک تقسیم‌کنندهٔ ولتاژ می‌سازد که نقطهٔ میانی آن به پین آنالوگ A0 وصل است. در هر دور از loop، مقدار نور با analogRead خوانده و روی سریال نمایش داده می‌شود. اگر مقدار خوانده‌شده کمتر از آستانهٔ ۵۰۰ باشد (یعنی محیط نسبتاً تاریک باشد) LED روشن و در غیر این صورت خاموش می‌شود. به این ترتیب مدار مانند یک چراغ خودکار عمل می‌کند که در تاریکی روشن می‌شود.',
  '۱۱': 'این مسئله نسخهٔ پیشرفته‌تر و «ایمن» مسئلهٔ ۲ است؛ کاربر سرعت چشمک‌زدن LED را از طریق سریال تعیین می‌کند، اما مقدار واردشده باید در بازهٔ مجاز ۵۰۰ تا ۳۰۰ میلی‌ثانیه باشد. اگر عدد در این بازه قرار گیرد، در blinkTime ذخیره و پیام تأیید چاپ می‌شود؛ در غیر این صورت پیام خطا نمایش داده می‌شود و مقدار پیشین حفظ می‌گردد. سپس LED با زمان تازه‌شده چشمک می‌زند. این اعتبارسنجی ورودی، مدار را در برابر مقادیر نامعتبر و رفتارهای غیرقابل‌پیش‌بینی مقاوم می‌سازد.',
  '۱۲': 'در این پروژه یک سامانهٔ کنترل چندکاناله ساخته شده است: سه دکمهٔ ورودی و سه LED خروجی، به‌گونه‌ای که هر دکمه به‌طور مستقل یک LED را کنترل می‌کند (قرمز، سبز و آبی). همهٔ پین‌های دکمه با INPUT_PULLUP پیکربندی شده‌اند تا نیازی به مقاومت خارجی نباشد؛ در این حالت فشردن دکمه خط را به زمین وصل کرده و مقدار LOW تولید می‌کند، بنابراین منطق شرطی به‌صورت معکوس نوشته شده است. این ساختار، پایهٔ طراحی صفحه‌کلیدها و پنل‌های کنترل صنعتی محسوب می‌شود.'
};

function problemPage(p) {
  const longCode = p.code.split('\n').length > 16;
  const notes = p.notes.map((x) => `<li>${x}</li>`).join('');
  const explain = explains[p.n] || '';
  const img2 = p.img2
    ? `<img class="shot" src="${toFileURL(path.join(ROOT, 'img', p.img2))}" alt="شبیه‌سازی مسئله ${p.n}"/>`
    : '';
  return `
  <section class="page">
    <div class="runhead"><span>گزارش کار آزمایشگاه سیستم‌های دیجیتال — آزمایش شمارهٔ ۱</span><span>آردوینو</span></div>
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
      <p class="explain">${explain}</p>
    </div>
    <figure class="shot-wrap">
      ${img2 ? '<div class="shots2">' : ''}
      <img class="shot" src="${toFileURL(path.join(ROOT, 'img', p.img))}" alt="شبیه‌سازی مسئله ${p.n}"/>
      ${img2 ? img2 + '</div>' : ''}
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
      <img class="uni-logo" src="${toFileURL(path.join(ROOT, 'img', 'logo.png'))}" alt="لوگوی دانشگاه بین‌المللی امام خمینی (ره)"/>
      <div class="bism">بسم الله الرحمن الرحیم</div>
      <div class="uni">دانشگاه بین‌المللی امام خمینی (ره)</div>
      <div class="faculty">دانشکدهٔ فنی و مهندسی — گروه مهندسی برق</div>
    </div>
    <div class="cover-mid">
      <div class="lab-badge">
        <svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><rect x="7" y="7" width="10" height="10" rx="2"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/></svg>
      </div>
      <div class="lab-no">گزارش کار آزمایشگاه — شمارهٔ ۱</div>
      <h1 class="cover-title">آشنایی با میکروکنترلر آردوینو و<br/>پیاده‌سازی مدارهای دیجیتال روی بردبورد</h1>
      <div class="cover-sub">شبیه‌سازی و اجرای پروژه‌های LED، دکمه، سنسور نور و دما در محیط Tinkercad Circuits</div>
    </div>
    <div class="cover-meta">
      <div class="cm-row"><span class="cm-k">نام دانشجو</span><span class="cm-v">مهدیه غلامی</span></div>
      <div class="cm-row"><span class="cm-k">شمارهٔ دانشجویی</span><span class="cm-v">۴۰۱۶۱۲۳۰۵۸</span></div>
      <div class="cm-row"><span class="cm-k">نام استاد</span><span class="cm-v">جناب آقای مهندس سلیمانی الموتی</span></div>
      <div class="cm-row"><span class="cm-k">گروه</span><span class="cm-v">۶۰</span></div>
      <div class="cm-row"><span class="cm-k">درس</span><span class="cm-v">آزمایشگاه سیستم‌های دیجیتال</span></div>
      <div class="cm-row"><span class="cm-k">تاریخ</span><span class="cm-v">۷ آبان ۱۴۰۵</span></div>
    </div>
    <div class="cover-foot">۷ آبان ۱۴۰۵</div>
  </section>`;
}

function abstractPage() {
  const toc = [
    'مقدمه', 'هدف آزمایش', 'مبانی و مفاهیم برنامه‌نویسی آردوینو',
    'معرفی برد آردوینو و بردبورد', 'شرح قسمت عملی آزمایش',
    'حل المسائل (پروژه‌های ۱ تا ۱۲)', 'نتایج شبیه‌سازی', 'تحلیل نتایج',
    'نتیجه‌گیری', 'پیشنهادات', 'منابع'
  ].map((t, i) => `<li><span class="toc-num">${faDigits(i + 1)}</span><span class="toc-t">${t}</span><span class="toc-dots"></span></li>`).join('');
  return `
  <section class="page">
    <div class="runhead"><span>گزارش کار آزمایشگاه سیستم‌های دیجیتال</span><span>چکیده و فهرست</span></div>
    <h2 class="sec-title"><span class="sec-bar"></span>چکیده</h2>
    <p class="para">در این گزارش، آشنایی با میکروکنترلر آردوینو و پیاده‌سازی مدارهای دیجیتال ساده بر روی بردبورد بررسی شده است. ابتدا ساختار محیط توسعهٔ آردوینو شامل دو تابع اصلی <code>setup()</code> و <code>loop()</code> و فرمان‌های پایه مانند <code>pinMode</code>، <code>digitalWrite</code> و <code>digitalRead</code> معرفی می‌شود. سپس دوازده مسئلهٔ عملی شامل کنترل LED، کار با دکمه، LED چند رنگی (RGB)، سنسور نور (LDR) و سنسور دما طراحی و در محیط شبیه‌سازی Tinkercad Circuits پیاده‌سازی گردیده‌اند. نتایج به‌دست‌آمده نشان می‌دهد که تمامی مدارها مطابق با رفتار مورد انتظار و جدول صحت هر مسئله عمل می‌کنند و آردوینو به‌خوبی به‌عنوان کنترل‌کنندهٔ مرکزی مدارهای دیجیتال قابل استفاده است.</p>
    <div class="kw-box">
      <span class="kw-label">کلیدواژه‌ها:</span>
      ${['آردوینو', 'بردبورد', 'LED', 'دکمهٔ فشاری', 'سنسور نور LDR', 'سنسور دما', 'Tinkercad', 'مدار دیجیتال'].map((k) => `<span class="kw">${k}</span>`).join('')}
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
    <p class="para">امروزه میکروکنترلرها مغز متفکر بیشتر دستگاه‌های الکترونیکی هوشمند هستند. آردوینو به‌عنوان یکی از محبوب‌ترین پلتفرم‌های متن‌باز، امکان ساخت و کنترل مدارهای دیجیتال را بدون پیچیدگی‌های سخت‌افزاری فراهم می‌کند. در این آزمایش، با نحوهٔ کار با برد آردوینو، اتصال قطعات روی بردبورد و نوشتن برنامه‌های کنترلی آشنا می‌شویم.</p>
    <p class="para">مدارهای دیجیتال بر پایهٔ منطق صفر و یک کار می‌کنند. با ترکیب ورودی‌ها (مانند دکمه و سنسور) و خروجی‌ها (مانند LED و بازر) می‌توان رفتارهای منطقی متنوعی را پیاده‌سازی کرد. آردوینو با ارائهٔ پین‌های ورودی/خروجی دیجیتال و آنالوگ، بستری ایده‌آل برای درک این مفاهیم در اختیار می‌گذارد.</p>
    <h2 class="sec-title"><span class="sec-bar"></span>۲. هدف آزمایش</h2>
    <div class="goal-grid">
      <div class="goal"><span class="goal-i">۱</span><p>آشنایی با محیط توسعهٔ آردوینو و ساختار توابع <code>setup</code> و <code>loop</code>.</p></div>
      <div class="goal"><span class="goal-i">۲</span><p>یادگیری فرمان‌های پایهٔ <code>pinMode</code>، <code>digitalWrite</code> و <code>digitalRead</code>.</p></div>
      <div class="goal"><span class="goal-i">۳</span><p>کار با بردبورد و اتصال صحیح قطعات بدون لحیم‌کاری.</p></div>
      <div class="goal"><span class="goal-i">۴</span><p>کنترل LED، دکمه، RGB و سنسورها و استفاده از متغیرها و پورت سریال.</p></div>
    </div>
    <div class="callout">
      <span class="callout-i">💡</span>
      <p>نکته: در زبان برنامه‌نویسی آردوینو، نوشتار حروف بزرگ و کوچک حساسیت دارد؛ بنابراین دستورات باید دقیقاً به‌صورت صحیح نوشته شوند.</p>
    </div>
    <div class="pagefoot"><span>مهدیه غلامی — ۴۰۱۶۱۲۳۰۵۸</span><span class="grp">گروه ۶۰</span></div>
  </section>`;
}

function conceptsPage() {
  return `
  <section class="page">
    <div class="runhead"><span>گزارش کار آزمایشگاه سیستم‌های دیجیتال</span><span>مبانی و مفاهیم</span></div>
    <h2 class="sec-title"><span class="sec-bar"></span>۳. مبانی و مفاهیم برنامه‌نویسی آردوینو</h2>
    <div class="two-col">
      <div class="concept">
        <div class="concept-h"><code>void setup()</code></div>
        <p>این بخش فقط یک‌بار در ابتدای اجرای برنامه اجرا می‌شود و برای پیکربندی اولیهٔ پین‌ها و شروع ارتباط سریال به کار می‌رود.</p>
      </div>
      <div class="concept">
        <div class="concept-h"><code>void loop()</code></div>
        <p>دستورات این بخش به‌صورت مداوم و بدون توقف تکرار می‌شوند؛ منطق اصلی برنامه در اینجا نوشته می‌شود.</p>
      </div>
      <div class="concept">
        <div class="concept-h"><code>pinMode(pin, mode)</code></div>
        <p>نوع کارکرد یک پین را مشخص می‌کند: <code>OUTPUT</code> برای خروجی و <code>INPUT</code> برای ورودی.</p>
      </div>
      <div class="concept">
        <div class="concept-h"><code>digitalWrite / digitalRead</code></div>
        <p>فرمان اول وضعیت پین خروجی را روی <code>HIGH</code> (۵ ولت) یا <code>LOW</code> (صفر ولت) می‌برد و فرمان دوم وضعیت پین ورودی را می‌خواند.</p>
      </div>
    </div>
    <h3 class="sub-title">استفاده از متغیرها به‌جای مقادیر ثابت</h3>
    <p class="para">در پروژه‌های بزرگ‌تر، به‌جای نوشتن مقادیر ثابت (مانند شمارهٔ پین یا زمان تأخیر) از متغیرها استفاده می‌کنیم؛ در این صورت تنها با تغییر مقدار متغیر، کل مدار به‌روزرسانی می‌شود. رعایت اصول نام‌گذاری مانند CamelCase و انتخاب نام‌های معنادار (مانند <code>LEDpin</code> و <code>waitTime</code>) خوانایی کد را افزایش می‌دهد.</p>
    ${codeBlock(`int LEDpin = 13;      // نام معنادار با CamelCase
int waitTime = 1000;  // زمان تأخیر بر حسب میلی‌ثانیه`)}
    <div class="pagefoot"><span>مهدیه غلامی — ۴۰۱۶۱۲۳۰۵۸</span><span class="grp">گروه ۶۰</span></div>
  </section>`;
}

function hardwarePage() {
  return `
  <section class="page">
    <div class="runhead"><span>گزارش کار آزمایشگاه سیستم‌های دیجیتال</span><span>سخت‌افزار و روش کار</span></div>
    <h2 class="sec-title"><span class="sec-bar"></span>۴. معرفی برد آردوینو و بردبورد</h2>
    <p class="para">در برد آردوینو Uno، پین‌های ۰ تا ۱۳ برای ورودی و خروجی دیجیتال قابل استفاده هستند و پین ۱۳ به یک LED داخلی مجهز است. علاوه بر این، پین‌های آنالوگ A0 تا A5 برای خواندن سنسورها در دسترس‌اند.</p>
    <div class="hw-grid">
      <div class="hw-card"><div class="hw-h">پین‌های دیجیتال</div><p>پین‌های ۰ تا ۱۳؛ پین‌های دارای علامت PWM (~) قابلیت خروجی آنالوگ شبیه‌سازی‌شده را دارند.</p></div>
      <div class="hw-card"><div class="hw-h">پین‌های آنالوگ</div><p>پین‌های A0 تا A5 برای خواندن مقادیر سنسورها مانند نور و دما به کار می‌روند.</p></div>
      <div class="hw-card"><div class="hw-h">سوراخ‌های وسطی بردبورد</div><p>به‌صورت ستونی به هم متصل‌اند و برای قرار دادن پایه‌های قطعات استفاده می‌شوند.</p></div>
      <div class="hw-card"><div class="hw-h">ریل‌های کناری (VCC/GND)</div><p>به‌صورت افقی متصل‌اند و برای اتصال منابع تغذیه و زمین به کار می‌روند.</p></div>
    </div>
    <h2 class="sec-title"><span class="sec-bar"></span>۵. شرح قسمت عملی آزمایش</h2>
    <p class="para">به دلیل در دسترس نبودن فیزیکی برد، تمامی مدارها در محیط شبیه‌سازی آنلاین <b>Tinkercad Circuits</b> طراحی و اجرا شده‌اند. روش کار در هر مسئله به شرح زیر است:</p>
    <ol class="steps">
      <li>قرار دادن برد آردوینو Uno و بردبورد در محیط شبیه‌سازی.</li>
      <li>افزودن قطعات (LED، مقاومت، دکمه، سنسور) و سیم‌کشی مطابق صورت مسئله.</li>
      <li>نوشتن کد در ویرایشگر و تنظیم پین‌ها در تابع <code>setup</code>.</li>
      <li>اجرای شبیه‌سازی با دکمهٔ Start و مشاهدهٔ رفتار مدار و Serial Monitor.</li>
    </ol>
    <div class="callout">
      <span class="callout-i">⚡</span>
      <p>نکتهٔ ایمنی: پایهٔ بلند LED (آند) به سمت ولتاژ مثبت و پایۀ کوتاه (کاتد) به سمت زمین متصل می‌شود و همیشه یک مقاومت محدودکنندهٔ جریان (معمولاً ۲۲۰ اهم) سری با LED قرار می‌گیرد.</p>
    </div>
    <div class="pagefoot"><span>مهدیه غلامی — ۴۰۱۶۱۲۳۰۵۸</span><span class="grp">گروه ۶۰</span></div>
  </section>`;
}

function analysisPage() {
  return `
  <section class="page">
    <div class="runhead"><span>گزارش کار آزمایشگاه سیستم‌های دیجیتال</span><span>نتایج و تحلیل</span></div>
    <h2 class="sec-title"><span class="sec-bar"></span>۷. نتایج شبیه‌سازی</h2>
    <p class="para">پس از اجرای هر دوازده مسئله در محیط Tinkercad، رفتار مشاهده‌شده با انتظار منطقی هر مدار مطابقت داشت. خلاصهٔ نتایج در جدول زیر آمده است:</p>
    <table class="res-table">
      <thead><tr><th>مسئله</th><th>خروجی مورد انتظار</th><th>نتیجهٔ مشاهده‌شده</th><th>وضعیت</th></tr></thead>
      <tbody>
        <tr><td>۱</td><td>چشمک LED هر یک ثانیه</td><td>روشن/خاموش منظم</td><td class="ok">✔ صحیح</td></tr>
        <tr><td>۲</td><td>تغییر زمان با ورودی سریال</td><td>اعمال مقادیر واردشده</td><td class="ok">✔ صحیح</td></tr>
        <tr><td>۳ و ۴</td><td>کنترل LED با دکمه / Toggle</td><td>پاسخ درست به فشردن</td><td class="ok">✔ صحیح</td></tr>
        <tr><td>۵ و ۶</td><td>چشمک متناوب دو LED / زمان ۲ ثانیه</td><td>حالت مکمل و زمان‌بندی درست</td><td class="ok">✔ صحیح</td></tr>
        <tr><td>۷ و ۸</td><td>ترتیب رنگ‌های RGB و چشمک دو LED</td><td>قرمز/سبز/آبی به‌درستی</td><td class="ok">✔ صحیح</td></tr>
        <tr><td>۹ و ۱۰</td><td>واکنش به دما و نور</td><td>سوییچ در آستانهٔ ۳۰ درجه و مقدار نور</td><td class="ok">✔ صحیح</td></tr>
        <tr><td>۱۱ و ۱۲</td><td>سرعت متغیر / سه دکمه و سه LED</td><td>اعتبارسنجی ورودی و کنترل مستقل</td><td class="ok">✔ صحیح</td></tr>
      </tbody>
    </table>
    <h2 class="sec-title"><span class="sec-bar"></span>۸. تحلیل نتایج</h2>
    <p class="para">در مدارهای کنترلی، LED هنگامی روشن می‌شود که پین خروجی در وضعیت <code>HIGH</code> (حدود ۵ ولت) قرار گیرد. در سنسورها، مقدار آنالوگ خوانده‌شده توسط <code>analogRead</code> به یک کمیت فیزیک تبدیل و با یک آستانه مقایسه می‌شود؛ این همان منطق تصمیم‌گیری دیجیتال است. استفاده از <code>INPUT_PULLUP</code> در مسائل ۴ و ۱۲ باعث شد منطق دکمه معکوس شود و نیازی به مقاومت خارجی نباشد.</p>
    <div class="pagefoot"><span>مهدیه غلامی — ۴۰۱۶۱۲۳۰۵۸</span><span class="grp">گروه ۶۰</span></div>
  </section>`;
}

function conclusionPage() {
  return `
  <section class="page">
    <div class="runhead"><span>گزارش کار آزمایشگاه سیستم‌های دیجیتال</span><span>نتیجه‌گیری و پیشنهادات</span></div>
    <h2 class="sec-title"><span class="sec-bar"></span>۹. نتیجه‌گیری</h2>
    <p class="para">این آزمایش نشان داد که میکروکنترلر آردوینو ابزاری قدرتمند و انعطاف‌پذیر برای پیاده‌سازی مدارهای دیجیتال است. با ترکیب فرمان‌های سادهٔ ورودی/خروجی دیجیتال و آنالوگ، توانستیم رفتارهای متنوعی از جمله چشمک‌زن، کنترل با دکمه، نمایشگر RGB و سامانهٔ هشدار دما و نور را بسازیم. استفاده از متغیرها و پورت سریال نیز امکان ساخت مدارهای پویا و قابل تنظیم را فراهم می‌کند.</p>
    <h2 class="sec-title"><span class="sec-bar"></span>۱۰. پیشنهادات</h2>
    <ul class="nice-list">
      <li>استفاده از فرمان <code>analogWrite</code> (PWM) برای کنترل شدت روشنایی LED به‌جای فقط روشن و خاموش کردن.</li>
      <li>افزودن بازر (Buzzer) برای تبدیل هشدارهای نوری به هشدارهای صوتی در سنسور دما.</li>
      <li>پیاده‌سازی منطق ضدپرش (Debounce) پیشرفته‌تر با تابع <code>millis()</code> به‌جای <code>delay()</code>.</li>
      <li>طراحی گیت‌های منطقی AND، OR و NAND با ترکیب چند ورودی دیجیتال.</li>
    </ul>
    <h2 class="sec-title"><span class="sec-bar"></span>۱۱. منابع</h2>
    <ol class="refs">
      <li>جزوهٔ درس آزمایشگاه سیستم‌های دیجیتال، بخش آردوینو — م.ح. سلیمانی الموتی.</li>
      <li>مستندات رسمی Arduino.cc — Reference: digitalWrite, pinMode, analogRead.</li>
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
<title>گزارش کار آزمایشگاه سیستم‌های دیجیتال — مهدیه غلامی</title>
<style>${fontFaces}\n${css}</style></head><body>${body}</body></html>`;
}

// ---------- render to PDF ----------
async function main() {
  fs.writeFileSync(path.join(ROOT, 'report.html'), buildHtml(), 'utf8');
  const browser = await firefox.launch();
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
  await page.goto(toFileURL(path.join(ROOT, 'report.html')));
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
  const out = path.join(ROOT, 'گزارش کار آزمایشگاه ۱ - مهدیه غلامی.pdf');
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

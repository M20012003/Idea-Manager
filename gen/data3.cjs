// Report data + content for «گزارش کار آزمایشگاه ۳ — کنترل دو LED به‌صورت مجزا با آردوینو».
// هر ورودی با یک تکلیف حل‌شده و تصویر شبیه‌سازی Tinkercad آن مطابق است.

const problems = [
  {
    n: '۱', img: 'l3_01.png',
    title: 'کنترل دو LED به‌صورت مجزا',
    statement: 'مداری طراحی کنید که دو LED به پین‌های مختلف آردوینو متصل شده باشند؛ این دو LED باید به‌طور مستقل از یکدیگر روشن و خاموش شوند.',
    code:
`int redLED = 9;
int yellowLED = 10;

void setup() {
  pinMode(redLED, OUTPUT);
  pinMode(yellowLED, OUTPUT);
}

void loop() {
  digitalWrite(redLED, HIGH);
  delay(1000);

  digitalWrite(redLED, LOW);
  delay(1000);

  digitalWrite(yellowLED, HIGH);
  delay(1000);

  digitalWrite(yellowLED, LOW);
  delay(1000);
}`,
    notes: [
      'هر LED به یک پین دیجیتال مستقل (پین ۹ و پین ۱۰) متصل شده و در <code>setup</code> به‌عنوان خروجی پیکربندی می‌شود.',
      'دستور <code>digitalWrite</code> سطح منطقی هر پین را جداگانه روی HIGH یا LOW می‌برد.',
      'با <code>delay(1000)</code> هر LED یک ثانیه روشن و یک ثانیه خاموش می‌ماند تا رفتار مستقل آن‌ها دیده شود.'
    ],
    explain: 'در این مدار، دو LED قرمز و زرد روی پین‌های ۹ و ۱۰ نشان داده شده‌اند و یک ریل Ground روی بردبورد، پایانهٔ منفی هر دو LED را به زمین آردوینو متصل می‌کند. چون فرمان‌های روشن و خاموش‌کردن برای هر LED به‌صورت پیاپی و مستقل نوشته شده‌اند، در هر لحظه فقط یک پین تغییر وضعیت می‌دهد و LED دیگر بدون تأثیر باقی می‌ماند. این ساده‌ترین نمونهٔ کنترل مستقل خروجی‌های دیجیتال است.'
  },
  {
    n: '۲', img: 'l3_02.png',
    title: 'چشمک زدن LED قرمز ۱۰ بار و سپس LED زرد یک بار',
    statement: 'LED قرمز باید ۱۰ بار چشمک بزند و سپس LED زرد یک بار چشمک بزند. برای تکرار دستورات از حلقهٔ <code>for</code> استفاده کنید.',
    code:
`int redLED = 9;
int yellowLED = 10;

void setup() {
  pinMode(redLED, OUTPUT);
  pinMode(yellowLED, OUTPUT);
}

void loop() {
  for (int i = 0; i < 10; i++) {
    digitalWrite(redLED, HIGH);
    delay(500);

    digitalWrite(redLED, LOW);
    delay(500);
  }

  digitalWrite(yellowLED, HIGH);
  delay(500);

  digitalWrite(yellowLED, LOW);
  delay(500);
}`,
    notes: [
      'حلقهٔ <code>for (int i = 0; i < 10; i++)</code> دقیقاً ده بار اجرا می‌شود و LED قرمز را ده بار چشمک می‌کند.',
      'پس از پایان حلقه، دستورات مربوط به LED زرد اجرا می‌شوند تا تنها یک بار روشن و خاموش شود.',
      'تأخیر ۵۰۰ میلی‌ثانیه‌ای، ریتم چشمک‌زدن را تندتر و قابل‌تشخیص می‌کند.'
    ],
    explain: 'این تمرین کاربرد حلقهٔ for برای تکرار یک بلوک دستورات را نشان می‌دهد. تا زمانی که شمارنده i کوچک‌تر از ۱۰ است، بدنهٔ حلقه تکرار شده و LED قرمز روشن و خاموش می‌شود. به‌محض رسیدن i به ۱۰، حلقه پایان می‌یابد و اجرای برنامه به دستورات بعدی می‌رود؛ بنابراین LED زرد فقط یک بار چشمک می‌زند. چون همهٔ این کارها درون loop است، این الگو بی‌پایان تکرار می‌شود.'
  },
  {
    n: '۳', img: 'l3_03.png',
    title: 'کنترل LED با دکمه (روشن شدن به مدت ۲ ثانیه)',
    statement: 'یک دکمه را به آردوینو وصل کنید. وقتی دکمه فشرده می‌شود، یک LED روشن شود؛ این LED باید به مدت ۲ ثانیه روشن بماند و سپس خاموش شود.',
    code:
`int button = 2;
int led = 9;

void setup() {
  pinMode(button, INPUT_PULLUP);
  pinMode(led, OUTPUT);
}

void loop() {
  if (digitalRead(button) == LOW) {
    digitalWrite(led, HIGH);
    delay(2000);
    digitalWrite(led, LOW);
  }
}`,
    notes: [
      'با <code>INPUT_PULLUP</code> پین دکمه در حالت آزاد HIGH و هنگام فشار LOW می‌شود؛ پس شرط با == LOW نوشته شده است.',
      'به‌محض تشخیص فشردن دکمه، LED روشن و دقیقاً ۲ ثانیه (<code>delay(2000)</code>) روشن می‌ماند.',
      'پس از پایان تأخیر، LED خاموش می‌شود تا چرخهٔ بعدی انتظار فشار دوباره را بکشد.'
    ],
    explain: 'در این مدار، دکمه به پین ۲ و LED به پین ۹ متصل شده است. در هر دور از loop وضعیت دکمه با digitalRead خوانده می‌شود؛ اگر کاربر دکمه را فشار داده باشد، ورودی روی LOW رفته و بدنهٔ شرط اجرا می‌گردد. در نتیجه LED روشن شده، دو ثانیه روشن می‌ماند و سپس خاموش می‌شود. این پروژه نخستین گام در جهت تعامل با ورودی‌های دیجیتال و پاسخ‌دهی برنامه به عملکرد کاربر است.'
  },
  {
    n: '۴', img: 'l3_04.png',
    title: 'روشن بودن LED قرمز ۵ ثانیه و سپس LED زرد ۳ ثانیه',
    statement: 'مداری طراحی کنید که در آن یک LED به مدت ۵ ثانیه روشن بماند و سپس خاموش شود؛ پس از آن LED دیگری به مدت ۳ ثانیه روشن شود.',
    code:
`int redLED = 9;
int yellowLED = 10;

void setup() {
  pinMode(redLED, OUTPUT);
  pinMode(yellowLED, OUTPUT);
}

void loop() {
  digitalWrite(redLED, HIGH);
  delay(5000);

  digitalWrite(redLED, LOW);

  digitalWrite(yellowLED, HIGH);
  delay(3000);

  digitalWrite(yellowLED, LOW);
}`,
    notes: [
      'LED قرمز با <code>delay(5000)</code> پنج ثانیه روشن می‌ماند و سپس خاموش می‌شود.',
      'بلافاصله پس از خاموش‌شدن قرمز، LED زرد روشن و سه ثانیه (<code>delay(3000)</code>) روشن می‌ماند.',
      'تغییر زمان‌ها تنها با ویرایش مقادیر delay انجام می‌شود و ساختار کد ثابت می‌ماند.'
    ],
    explain: 'این تمرین ترتیب زمانی روشن‌شدن دو خروجی را نشان می‌دهد. در نیمهٔ نخست، پین قرمز روی HIGH رفته و پنج ثانیه صبر می‌کند؛ سپس روی LOW قرار می‌گیرد. در نیمهٔ دوم، پین زرد روشن شده و پس از سه ثانیه خاموش می‌شود. چون این توالی در loop تکرار می‌شود، الگوی «پنج ثانیه قرمز، سپس سه ثانیه زرد» به‌طور پیوسته ادامه می‌یابد.'
  },
  {
    n: '۵', img: 'l3_05.png',
    title: 'چشمک LED قرمز هر ۵۰۰ میلی‌ثانیه (۵ بار) و سپس LED زرد ۱ ثانیه',
    statement: 'LED قرمز باید هر ۵۰۰ میلی‌ثانیه روشن و خاموش شود. پس از ۵ بار تکرار، LED زرد به مدت ۱ ثانیه روشن بماند و سپس خاموش شود.',
    code:
`int redLED = 9;
int yellowLED = 10;

void setup() {
  pinMode(redLED, OUTPUT);
  pinMode(yellowLED, OUTPUT);
}

void loop() {
  for (int i = 0; i < 5; i++) {
    digitalWrite(redLED, HIGH);
    delay(500);

    digitalWrite(redLED, LOW);
    delay(500);
  }

  digitalWrite(yellowLED, HIGH);
  delay(1000);

  digitalWrite(yellowLED, LOW);
}`,
    notes: [
      'حلقهٔ <code>for</code> با حد ۵، دقیقاً پنج دور چشمک برای LED قرمز می‌سازد.',
      'هر دور شامل یک روشن و یک خاموش با تأخیر ۵۰۰ میلی‌ثانیه است.',
      'پس از پایان حلقه، LED زرد یک ثانیه روشن مانده و خاموش می‌شود.'
    ],
    explain: 'در این پروژه، تعداد دفعات چشمک با شمار حلقه کنترل می‌شود. بدنهٔ حلقه پنج بار اجرا شده و LED قرمز را با ریتم ۵۰۰ میلی‌ثانیه‌ای چشمک می‌کند. پس از تکمیل حلقه، نوبت به LED زرد می‌رسد که یک‌بار به مدت یک ثانیه روشن می‌ماند. این نمونه ترکیب «تکرار» و «ترتیب زمانی» را در یک برنامهٔ ساده نشان می‌دهد.'
  },
  {
    n: '۶', img: 'l3_06.png',
    title: 'چشمک متناوب دو LED با زمان‌های تأخیر متفاوت',
    statement: 'مداری طراحی کنید که دو LED به پین‌های مختلف آردوینو متصل شوند. این LEDها باید به‌طور متناوب و با زمان‌های تأخیر متفاوت روشن و خاموش شوند.',
    code:
`int redLED = 9;
int yellowLED = 10;

void setup() {
  pinMode(redLED, OUTPUT);
  pinMode(yellowLED, OUTPUT);
}

void loop() {
  digitalWrite(redLED, HIGH);
  delay(1000);

  digitalWrite(redLED, LOW);

  digitalWrite(yellowLED, HIGH);
  delay(2000);

  digitalWrite(yellowLED, LOW);
}`,
    notes: [
      'LED قرمز یک ثانیه و LED زرد دو ثانیه روشن می‌ماند؛ یعنی دو زمان تأخیر متفاوت.',
      'در هر لحظه فقط یکی از LEDها روشن است، بنابراین رفتار به‌صورت متناوب دیده می‌شود.',
      'با تغییر مقادیر delay می‌توان ریتم هر LED را مستقل تنظیم کرد.'
    ],
    explain: 'این مدار دو LED را به‌شکل نوبتی و با ریتم‌های ناهمسان روشن می‌کند. نخست LED قرمز به مدت یک ثانیه روشن و سپس خاموش می‌شود؛ بلافاصله LED زرد به مدت دو ثانیه روشن می‌ماند. چون طول دو نیم‌چرخه برابر نیست، الگوی چشمکی نامتقارن و «متناوب با تأخیر متفاوت» ایجاد می‌شود که پایهٔ بسیاری از نشانگرهای زمان‌بندی است.'
  },
  {
    n: '۷', img: 'l3_07.png',
    title: 'کنترل تعداد چشمک با متغیر سراسری (Global)',
    statement: 'با استفاده از یک متغیر سراسری، تعداد دفعات چشمک‌زدن LED را کنترل کنید. مقدار پیش‌فرض را ۵ قرار دهید و سپس آن را تغییر دهید.',
    code:
`int led = 9;
int blinkCount = 5;

void setup() {
  pinMode(led, OUTPUT);
}

void loop() {
  for (int i = 0; i < blinkCount; i++) {
    digitalWrite(led, HIGH);
    delay(500);

    digitalWrite(led, LOW);
    delay(500);
  }

  delay(2000);
}`,
    notes: [
      'متغیر <code>blinkCount</code> بیرون از توابع تعریف شده و یک متغیر سراسری (Global) است.',
      'عدد آن در ابتدای برنامه ۵ قرار داده شده و تعداد چشمک‌ها را کنترل می‌کند.',
      'برای تغییر رفتار مدار کافی است تنها مقدار همین یک متغیر عوض شود.'
    ],
    explain: 'در این پروژه، تعداد دفعات چشمک از پیش در کد پخش نشده، بلکه در یک متغیر سراسری به نام blinkCount ذخیره شده است. حلقهٔ for تا رسیدن شمارنده به مقدار این متغیر تکرار می‌شود. با تغییر عدد ۵ به هر مقدار دیگر، بدون دست‌زدن به بقیهٔ کد، تعداد چشمک‌ها عوض می‌شود؛ این همان مزیت استفاده از متغیر در برابر مقادیر ثابت است.'
  },
  {
    n: '۸', img: 'l3_08.png',
    title: 'روشن شدن LED به مدت ۲ ثانیه و خاموش شدن با دکمه',
    statement: 'مداری طراحی کنید که یک LED به مدت ۲ ثانیه روشن باشد و پس از آن با فشردن یک دکمه، همان LED خاموش شود.',
    code:
`int led = 9;
int button = 2;

void setup() {
  pinMode(led, OUTPUT);
  pinMode(button, INPUT_PULLUP);

  digitalWrite(led, HIGH);
  delay(2000);
}

void loop() {
  if (digitalRead(button) == LOW) {
    digitalWrite(led, LOW);
  }
}`,
    notes: [
      'روشن‌شدن اولیهٔ LED و تأخیر دو ثانیه در تابع <code>setup</code> انجام می‌شود که فقط یک بار اجرا می‌گردد.',
      'در <code>loop</code> وضعیت دکمه پایش می‌شود و با فشردن آن، LED خاموش می‌گردد.',
      'استفاده از <code>INPUT_PULLUP</code> باعث شده حالت فشرده دکمه برابر LOW باشد.'
    ],
    explain: 'تفاوت ظریف این پروژه با پروژه‌های پیشین، قرار دادن بخش روشن‌کردن LED در تابع setup است. چون setup تنها یک بار در ابتدای اجرا صدا زده می‌شود، LED بلافاصله روشن شده، دو ثانیه روشن می‌ماند و سپس برنامه وارد loop می‌شود. در loop، آردوینو منتظر می‌ماند تا کاربر دکمه را فشار دهد؛ به‌محض فشردن، فرمان digitalWrite(led, LOW) اجرا شده و LED خاموش می‌شود.'
  },
  {
    n: '۹', img: 'l3_09.png',
    title: 'تکرار چرخهٔ «۱۰ بار قرمز، سپس یک ثانیه زرد» در حلقه',
    statement: 'LED قرمز باید ۱۰ بار روشن و خاموش شود، سپس LED زرد به مدت ۱ ثانیه روشن بماند. این عملیات باید در حلقه تکرار شود.',
    code:
`int redLED = 9;
int yellowLED = 10;

void setup() {
  pinMode(redLED, OUTPUT);
  pinMode(yellowLED, OUTPUT);
}

void loop() {
  for (int i = 0; i < 10; i++) {
    digitalWrite(redLED, HIGH);
    delay(500);

    digitalWrite(redLED, LOW);
    delay(500);
  }

  digitalWrite(yellowLED, HIGH);
  delay(1000);

  digitalWrite(yellowLED, LOW);
}`,
    notes: [
      'حلقهٔ <code>for</code> ده بار LED قرمز را چشمک می‌کند.',
      'سپس LED زرد یک ثانیه روشن مانده و خاموش می‌شود.',
      'چون کل این ترتیب در تابع <code>loop</code> است، الگو بی‌پایان تکرار می‌شود.'
    ],
    explain: 'این پروژه همان الگوی مسئلهٔ ۲ است، اما با تأکید بر تکرار بی‌پایان آن. تابع loop به‌خودی‌خود پس از رسیدن به خط پایانی، از ابتدا اجرا می‌شود؛ بنابراین چرخهٔ «ده بار چشمک قرمز، سپس یک ثانیه روشن بودن زرد» بدون توقف تکرار می‌گردد. این رفتار، تفاوت حلقهٔ for (تکرار محدود) و تابع loop (تکرار نامحدود) را به‌خوبی نشان می‌دهد.'
  },
  {
    n: '۱۰', img: 'l3_10.png',
    title: 'روشن شدن نوبتی دو LED با چرخهٔ ۵ ثانیه‌ای',
    statement: 'مداری طراحی کنید که هر ۵ ثانیه یک LED روشن شود و پس از ۵ ثانیه خاموش گردد؛ سپس LED دیگری همین چرخه را تکرار کند.',
    code:
`int led1 = 9;
int led2 = 10;

void setup() {
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
}

void loop() {
  digitalWrite(led1, HIGH);
  delay(5000);

  digitalWrite(led1, LOW);

  digitalWrite(led2, HIGH);
  delay(5000);

  digitalWrite(led2, LOW);
}`,
    notes: [
      'هر LED پنج ثانیه روشن می‌ماند و سپس خاموش می‌شود.',
      'دستورات به‌ترتیب نوشته شده‌اند تا اول LED یک و بعد LED دو نوبت بگیرد.',
      'چرخه در تابع <code>loop</code> به‌طور مداوم تکرار می‌شود.'
    ],
    explain: 'در این مدار دو LED به‌شکل زنجیره‌ای و با زمان برابر روشن می‌شوند. نخست led1 پنج ثانیه روشن مانده و خاموش می‌شود، سپس led2 پنج ثانیه روشن شده و خاموش می‌گردد. چون این توالی در loop قرار دارد، پس از خاموش‌شدن led2 دوباره led1 روشن می‌شود و چرخهٔ پنج‌ثانیه‌ای بی‌پایان ادامه می‌یابد.'
  },
  {
    n: '۱۱', img: 'l3_11.png',
    title: 'روشن شدن LED بر اساس سنسور دما (بالاتر از ۳۰ درجه)',
    statement: 'با استفاده از یک سنسور دما (مانند LM35/TMP36) دمای محیط را بخوانید؛ اگر دما بیشتر از ۳۰ درجه شد، LED قرمز روشن شود.',
    code:
`int sensorPin = A0;
int ledPin = 9;

float voltage;
float temperature;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int sensorValue = analogRead(sensorPin);

  voltage = sensorValue * (5.0 / 1023.0);

  temperature = (voltage - 0.5) * 100;

  Serial.print("Temperature: ");
  Serial.println(temperature);

  if (temperature > 30) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }

  delay(1000);
}`,
    notes: [
      'خروجی سنسور به پین آنالوگ A0 وصل است و با <code>analogRead</code> عددی بین ۰ تا ۱۰۲۳ خوانده می‌شود.',
      'عدد خام نخست به ولتاژ و سپس با فرمول <code>(voltage - 0.5) * 100</code> به دما تبدیل می‌شود (جبران آفست ۰٫۵ ولت سنسور TMP36).',
      'اگر دما از آستانهٔ ۳۰ درجه بیشتر شود، LED هشدار روشن می‌گردد.'
    ],
    explain: 'این پروژه مفهوم خواندن ورودی آنالوگ و تصمیم‌گیری دیجیتال را با هم ترکیب می‌کند. سنسور دما ولتاژ متناسب با دما تولید می‌کند؛ مبدل آنالوگ‌به‌دیجیتال ۱۰ بیتی آردوینو این ولتاژ را به عددی بین صفر تا ۱۰۳ تبدیل می‌کند. در کد، این عدد به ولتاژ و سپس با کسر آفست ۰٫۵ ولت و ضرب در ۱۰۰ به درجهٔ سلسیوس تبدیل می‌شود. در پایان، مقدار دما روی Serial Monitor چاپ شده و در صورت عبور از ۳۰ درجه، LED قرمز به‌عنوان هشدار روشن می‌شود.'
  },
  {
    n: '۱۲', img: 'l3_12.png',
    title: 'چشمک دو LED با تأخیر متفاوت با استفاده از millis()',
    statement: 'مداری طراحی کنید که دو LED با تأخیر متفاوت چشمک بزنند؛ LED اول هر ۱ ثانیه و LED دوم هر ۲ ثانیه روشن و خاموش شود.',
    code:
`int led1 = 9;
int led2 = 10;

unsigned long previousTime1 = 0;
unsigned long previousTime2 = 0;

int state1 = LOW;
int state2 = LOW;

void setup() {
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
}

void loop() {
  unsigned long currentTime = millis();

  if (currentTime - previousTime1 >= 1000) {
    previousTime1 = currentTime;

    state1 = !state1;
    digitalWrite(led1, state1);
  }

  if (currentTime - previousTime2 >= 2000) {
    previousTime2 = currentTime;

    state2 = !state2;
    digitalWrite(led2, state2);
  }
}`,
    notes: [
      'تابع <code>millis()</code> زمان سپری‌شده از شروع برنامه (بر حسب میلی‌ثانیه) را برمی‌گرداند و برخلاف delay مانع اجرای بقیهٔ کد نمی‌شود.',
      'هر LED یک متغیر زمانی و یک وضعیت مستقل دارد تا با ریتم متفاوت (۱ و ۲ ثانیه) کار کند.',
      'با <code>state = !state</code> وضعیت هر LED در هر بازهٔ زمانی معکوس می‌شود.'
    ],
    explain: 'این پروژه پیشرفته‌ترین روش زمان‌بندی در آردوینو را نشان می‌دهد. به‌جای استفاده از delay که کل برنامه را متوقف می‌کند، از millis() برای اندازه‌گیری زمان استفاده شده است. در هر دور از loop، زمان جاری خوانده و با زمانِ آخرین تغییر هر LED مقایسه می‌شود؛ اگر اختلاف از آستانهٔ مربوطه (۱۰۰۰ یا ۲۰۰۰ میلی‌ثانیه) بیشتر باشد، وضعیت آن LED معکوس شده و زمان مرجع آن به‌روز می‌شود. چون دو بازهٔ زمانی مستقل‌اند، LEDها با ریتم‌های متفاوت و هم‌زمان چشمک می‌زنند.'
  }
];

module.exports = { problems };

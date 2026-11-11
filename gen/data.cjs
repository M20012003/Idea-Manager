// Report data + content for the Arduino digital-systems lab report (Persian, RTL).
// Each entry maps to a solved homework problem with its simulation screenshot.

const problems = [
  {
    n: '۱', img: 'p01.png', title: 'روشن و خاموش کردن LED با تأخیر یک‌ثانیه‌ای',
    statement: 'یک مدار ساده طراحی کنید که یک LED را به پین ۱۳ آردوینو متصل کرده و با استفاده از کد آردوینو آن را به‌صورت متناوب روشن و خاموش کند؛ زمان هر حالت یک ثانیه باشد.',
    pins: [['پین', '۱۳ (LED داخلی برد)'], ['نوع', 'خروجی دیجیتال'], ['قطعات', 'LED + مقاومت ۲۲ اهم']],
    code:
`int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);
  delay(1000);
  digitalWrite(ledPin, LOW);
  delay(1000);
}`,
    notes: [
      'در تابع setup پین ۱۳ با فرمان pinMode به‌عنوان خروجی پیکربندی می‌شود.',
      'دستور digitalWrite با مقدار HIGH ولتاژ ۵ ولت و با LOW صفر ولت تولید می‌کند.',
      'تابع delay(1000) دقیقاً یک ثانیه مکث ایجاد می‌کند و این چرخه در loop تکرار می‌شود.'
    ]
  },
  {
    n: '۲', img: 'p02a.png', img2: 'p02b.png', title: 'تغییر زمان روشن و خاموش بودن LED از طریق پورت سریال',
    statement: 'مداری طراحی کنید که یک LED را به پین ۹ آردوینو متصل کرده و زمان روشن و خاموش شدن آن را به‌صورت متغیر، از طریق ورودی سریال (Serial) تغییر دهد.',
    pins: [['پین', '۹ (PWM)'], ['ارتباط', 'Serial 9600 baud'], ['ورودی', 'دو عدد: زمان روشن و خاموش (ms)']],
    code:
`const int LEDpin = 9;
int onTime = 1000;
int offTime = 1000;

void setup() {
  pinMode(LEDpin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Enter ON time and OFF time in ms:");
  Serial.println("Example: 500 1000");
}

void loop() {
  if (Serial.available() > 0) {
    int newOnTime = Serial.parseInt();
    int newOffTime = Serial.parseInt();
    if (newOnTime > 0 && newOffTime > 0) {
      onTime = newOnTime;
      offTime = newOffTime;
      Serial.print("ON time: ");
      Serial.println(onTime);
      Serial.print("OFF time: ");
      Serial.println(offTime);
    }
    while (Serial.available() > 0) {
      Serial.read();
    }
  }
  digitalWrite(LEDpin, HIGH);
  delay(onTime);
  digitalWrite(LEDpin, LOW);
  delay(offTime);
}`,
    notes: [
      'با Serial.available() بررسی می‌شود که داده‌ای از مانیتور سریال ارسال شده است یا خیر.',
      'فرمان Serial.parseInt() دو عدد ورودی را به‌عنوان زمان روشن و خاموش شدن می‌خواند.',
      'حلقهٔ while باقیماندهٔ بافر سریال را پاک‌سازی می‌کند تا خواندن بعدی درست انجام شود.'
    ]
  },
  {
    n: '۳', img: 'p03.png', title: 'کنترل LED با استفاده از یک دکمه',
    statement: 'یک دکمه به پین ۲ آردوینو متصل کنید؛ به‌گونه‌ای که با فشار دادن دکمه، LED روشن و با رها کردن آن، LED خاموش شود.',
    pins: [['پین LED', '۱۳'], ['پین دکمه', '۲ (ورودی دیجیتال)'], ['منطق', 'دکمه فشرده = LED روشن']],
    code:
`int ledPin = 13;
int buttonPin = 2;
int buttonState = 0;

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT);
}

void loop() {
  buttonState = digitalRead(buttonPin);
  if (buttonState == HIGH) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
}`,
    notes: [
      'دستور digitalRead وضعیت منطقی پین دکمه را می‌خواند و در متغیر buttonState ذخیره می‌کند.',
      'در این پیاده‌سازی مستقیم، LED آینه‌وار وضعیت دکمه را نشان می‌دهد.',
      'برای اطمینان از رفتار صحیح، معمولاً یک مقاومت پول‌داون روی خط دکمه در نظر گرفته می‌شود.'
    ]
  },
  {
    n: '۴', img: 'p04.png', title: 'نمایش وضعیت با دو LED و یک دکمه (Toggle)',
    statement: 'مداری بسازید که از دو LED استفاده کند؛ یکی نشانهٔ «روشن» و دیگری نشانهٔ «خاموش». هر بار که دکمه فشرده می‌شود، وضعیت بین دو حالت جابه‌جا شود.',
    pins: [['LED قرمز', 'پین ۲'], ['LED سبز', 'پین ۳'], ['دکمه', 'پین ۴ با INPUT_PULLUP']],
    code:
`const int redLED = 2;
const int greenLED = 3;
const int buttonPin = 4;
int state = 0;
int lastButtonState = HIGH;

void setup() {
  pinMode(redLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
  digitalWrite(redLED, LOW);
  digitalWrite(greenLED, HIGH);
}

void loop() {
  int buttonState = digitalRead(buttonPin);
  if (buttonState == LOW && lastButtonState == HIGH) {
    state = !state;
    if (state == 1) {
      digitalWrite(redLED, HIGH);
      digitalWrite(greenLED, LOW);
    } else {
      digitalWrite(redLED, LOW);
      digitalWrite(greenLED, HIGH);
    }
    delay(50);
  }
  lastButtonState = buttonState;
}`,
    notes: [
      'با INPUT_PULLUP، حالت عادی دکمه HIGH و حالت فشرده LOW است.',
      'شرط buttonState == LOW && lastButtonState == HIGH لبهٔ افت ولتاژ (فشار دکمه) را تشخیص می‌دهد.',
      'دستور delay(50) برای حذف پرش‌های مکانیکی دکمه (Debounce) به کار رفته است.'
    ]
  },
  {
    n: '۵', img: 'p05.png', title: 'چشمک‌زن متناوب با دو LED',
    statement: 'مداری بسازید که در آن دو LED به‌طور متناوب روشن و خاموش شوند (یکی روشن و دیگری خاموش و بالعکس)؛ مدت زمان روشن بودن هر LED یک ثانیه باشد.',
    pins: [['LED اول', 'پین ۲'], ['LED دوم', 'پین ۳'], ['زمان', '۱۰۰ میلی‌ثانیه هر حالت']],
    code:
`int LED1 = 2;
int LED2 = 3;

void setup() {
  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);
}

void loop() {
  digitalWrite(LED1, HIGH);
  digitalWrite(LED2, LOW);
  delay(1000);

  digitalWrite(LED1, LOW);
  digitalWrite(LED2, HIGH);
  delay(1000);
}`,
    notes: [
      'در نیم‌چرخهٔ اول، LED1 روشن و LED2 خاموش می‌شود و پس از یک ثانیه حالت معکوس می‌گردد.',
      'این رفتار مکمل، پایهٔ ساخت نشانگرهای وضعيت و مدارهای چشمکی دو فاز است.'
    ]
  },
  {
    n: '۶', img: 'p06.png', title: 'محافظت از LED با مقاومت و زمان‌بندی دو ثانیه',
    statement: 'مداری طراحی کنید که از یک LED و یک مقاومت ۲۲۰ اهم برای محافظت استفاده کند؛ کد به‌گونه‌ای باشد که LED به مدت دو ثانیه روشن و سپس خاموش شود.',
    pins: [['پین LED', '۳'], ['مقاومت', '۲۲۰ اهم سری با LED'], ['زمان', '۲۰۰۰ میلی‌ثانیه']],
    code:
`int LED = 3;

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  digitalWrite(LED, HIGH);
  delay(2000);
  digitalWrite(LED, LOW);
  delay(2000);
}`,
    notes: [
      'مقاومت ۲۲۰ اهم جریان عبوری از LED را محدود کرده و از سوختن آن جلوگیری می‌کند.',
      'محاسبهٔ ساده: R = (۵ − ۲)/۰٫۰۲ ≈ ۱۵۰ اهم؛ مقدار ۲۲۰ اهم حاشیهٔ اطمینان ایجاد می‌کند.'
    ]
  },
  {
    n: '۷', img: 'p07.png', title: 'کنترل LED چند رنگی (RGB)',
    statement: 'یک LED RGB به آردوینو وصل کنید و با استفاده از پین‌های مناسب، رنگ‌های مختلف را کنترل نمایید؛ به‌ترتیب قرمز، سپس سبز و بعد آبی.',
    pins: [['پین قرمز', '۹'], ['پین سبز', '۱۰'], ['پین آبی', '۱۱']],
    code:
`int redPin = 9;
int greenPin = 10;
int bluePin = 11;

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
}

void loop() {
  // Red
  digitalWrite(redPin, HIGH);
  digitalWrite(greenPin, LOW);
  digitalWrite(bluePin, LOW);
  delay(1000);
  // Green
  digitalWrite(redPin, LOW);
  digitalWrite(greenPin, HIGH);
  digitalWrite(bluePin, LOW);
  delay(1000);
  // Blue
  digitalWrite(redPin, LOW);
  digitalWrite(greenPin, LOW);
  digitalWrite(bluePin, HIGH);
  delay(1000);
}`,
    notes: [
      'هر رنگ LED RGB از یک کاتد مشترک و سه پایهٔ جداگانه تشکیل شده است.',
      'با فعال‌سازی هم‌زمان ترکیب این سه پایه می‌توان رنگ‌های ثانویه (زرد، فیروزه‌ای، ارغوانی) تولید کرد.'
    ]
  },
  {
    n: '۸', img: 'p08.png', title: 'چشمک‌زن با دو LED RGB',
    statement: 'مداری طراحی کنید که دو LED RGB به‌طور متناوب چشمک بزنند (یکی قرمز و دیگری سبز)؛ زمان روشن بودن هر LED به‌صورت جداگانه تنظیم شود.',
    pins: [['RGB اول', 'پین‌های ۹، ۱۱، ۱۰'], ['RGB دوم', 'پین‌های ۳، ۶، ۵'], ['زمان', 'onTime1 و onTime2']],
    code:
`int red1 = 9, green1 = 11, blue1 = 10;
int red2 = 3, green2 = 6, blue2 = 5;
int onTime1 = 1000;
int onTime2 = 1000;

void setup() {
  pinMode(red1, OUTPUT);
  pinMode(green1, OUTPUT);
  pinMode(blue1, OUTPUT);
  pinMode(red2, OUTPUT);
  pinMode(green2, OUTPUT);
  pinMode(blue2, OUTPUT);
}

void loop() {
  // LED RGB اول: قرمز
  digitalWrite(red1, HIGH);
  digitalWrite(green1, LOW);
  digitalWrite(blue1, LOW);
  // LED RGB دوم: خاموش
  digitalWrite(red2, LOW);
  digitalWrite(green2, LOW);
  digitalWrite(blue2, LOW);
  delay(onTime1);
  // LED RGB اول: خاموش
  digitalWrite(red1, LOW);
  digitalWrite(green1, LOW);
  digitalWrite(blue1, LOW);
  // LED RGB دوم: سبز
  digitalWrite(red2, LOW);
  digitalWrite(green2, HIGH);
  digitalWrite(blue2, LOW);
  delay(onTime2);
}`,
    notes: [
      'با تفکیک زمان onTime1 و onTime2 می‌توان ریتم چشمک‌زن را به‌صورت مستقل تنظیم کرد.',
      'این الگو پایهٔ ساخت تابلوهای روان و نشانگرهای چند رنگ است.'
    ]
  },
  {
    n: '۹', img: 'p09.png', title: 'کنترل LED بر اساس سنسور دما',
    statement: 'یک سنسور دما (مانند LM35/TMP36) به آردوینو وصل کنید؛ وقتی دمای محیط بالاتر از ۳۰ درجهٔ سلسیوس شد، LED قرمز روشن و در غیر این صورت LED سبز روشن باشد.',
    pins: [['پین سنسور', 'A0 (آنالوگ)'], ['LED قرمز', 'پین ۸'], ['LED سبز', 'پین ۹']],
    code:
`int tempPin = A0;
int redLED = 8;
int greenLED = 9;
int sensorValue;
float voltage;
float temperatureC;

void setup() {
  pinMode(redLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  sensorValue = analogRead(tempPin);
  voltage = sensorValue * (5.0 / 1023.0);
  temperatureC = voltage * 100.0;

  Serial.print("Temperature: ");
  Serial.print(temperatureC);
  Serial.println(" C");

  if (temperatureC > 30) {
    digitalWrite(redLED, HIGH);
    digitalWrite(greenLED, LOW);
  } else {
    digitalWrite(redLED, LOW);
    digitalWrite(greenLED, HIGH);
  }
  delay(1000);
}`,
    notes: [
      'مبدل آنالوگ به دیجیتال آردوینو ۱۰ بیت است؛ بنابراین analogRead مقداری بین ۰ تا ۱۰۲۳ برمی‌گرداند.',
      'سنسورهای سری TMP/LM35 به ازای هر درجهٔ سلسیوس ۱۰ میلی‌ولت خروجی می‌دهند؛ پس temperature = voltage × ۱۰۰.',
      'شرط if دمای آستانهٔ ۳۰ درجه را به یک هشدار بصری (قرمز/سبز) تبدیل می‌کند.'
    ]
  },
  {
    n: '۱۰', img: 'p10.png', title: 'کنترل LED با سنسور نور (LDR)',
    statement: 'یک سنسور نور (LDR) به آردوینو وصل کنید؛ برنامه‌ای بنویسید که در صورت کم بودن نور محیط، LED روشن و در صورت زیاد بودن نور، LED خاموش شود.',
    pins: [['پین LDR', 'A0 (آنالوگ)'], ['پین LED', '۸'], ['آستانه', 'lightValue < 500']],
    code:
`int LDRpin = A0;
int LEDpin = 8;
int lightValue;

void setup() {
  pinMode(LEDpin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  lightValue = analogRead(LDRpin);
  Serial.println(lightValue);

  if (lightValue < 500) {
    digitalWrite(LEDpin, HIGH);
  } else {
    digitalWrite(LEDpin, LOW);
  }
  delay(200);
}`,
    notes: [
      'سنسور LDR با یک مقاومت، یک تقسیم‌کنندهٔ ولتاژ می‌سازد که خروجی آن به پین آنالوگ A0 داده می‌شود.',
      'در تاریکی مقاومت LDR زیاد و مقدار خوانده‌شده تغییر می‌کند؛ با یک آستانه، LED روشن می‌شود.'
    ]
  },
  {
    n: '۱۱', img: 'p11.png', title: 'چشمک‌زن با سرعت متغیر از طریق سریال',
    statement: 'مداری بسازید که LED با سرعت متغیر (از ۵۰۰ میلی‌ثانیه تا ۳ ثانیه) چشمک بزند؛ برای تغییر سرعت، زمان تأخیر را از طریق ورودی سریال وارد کنید.',
    pins: [['پین LED', '۹'], ['محدودهٔ ورودی', '۵۰۰ تا ۳۰۰ میلی‌ثانیه'], ['ارتباط', 'Serial 9600']],
    code:
`int LEDpin = 9;
int blinkTime = 1000;

void setup() {
  pinMode(LEDpin, OUTPUT);
  Serial.begin(9600);
  Serial.println("Enter delay between 500 and 3000 ms:");
}

void loop() {
  if (Serial.available() > 0) {
    int newTime = Serial.parseInt();
    if (newTime >= 500 && newTime <= 3000) {
      blinkTime = newTime;
      Serial.print("New delay: ");
      Serial.println(blinkTime);
    } else {
      Serial.println("Enter a value between 500 and 3000.");
    }
    while (Serial.available() > 0) {
      Serial.read();
    }
  }
  digitalWrite(LEDpin, HIGH);
  delay(blinkTime);
  digitalWrite(LEDpin, LOW);
  delay(blinkTime);
}`,
    notes: [
      'اعتبارسنجی ورودی (newTime >= 500 && newTime <= 3000) از مقادیر نامعتبر جلوگیری می‌کند.',
      'پیام بازخورد در Serial Monitor به کاربر کمک می‌کند تا مقدار صحیح را وارد کند.'
    ]
  },
  {
    n: '۱۲', img: 'p12.png', title: 'سیستم کنترل با چند دکمه و چند LED',
    statement: 'سه دکمه به آردوینو متصل کنید؛ به‌گونه‌ای که با فشردن هر دکمه، یک LED متفاوت روشن شود (دکمهٔ اول LED قرمز، دکمهٔ دوم LED سبز و دکمهٔ سوم LED آبی).',
    pins: [['دکمه‌ها', 'پین‌های ۲، ۳، ۴'], ['LEDها', 'پین‌های ۸، ۹، ۱۰'], ['نوع ورودی', 'INPUT_PULLUP']],
    code:
`int redButton = 2;
int greenButton = 3;
int blueButton = 4;
int redLED = 8;
int greenLED = 9;
int blueLED = 10;

void setup() {
  pinMode(redButton, INPUT_PULLUP);
  pinMode(greenButton, INPUT_PULLUP);
  pinMode(blueButton, INPUT_PULLUP);

  pinMode(redLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
  pinMode(blueLED, OUTPUT);
}

void loop() {
  digitalWrite(redLED, digitalRead(redButton) == LOW ? HIGH : LOW);
  digitalWrite(greenLED, digitalRead(greenButton) == LOW ? HIGH : LOW);
  digitalWrite(blueLED, digitalRead(blueButton) == LOW ? HIGH : LOW);
}`,
    notes: [
      'هر دکمه به‌صورت مستقل یک LED را کنترل می‌کند و ساختار ورودی/خروجی یک‌به‌یک حفظ شده است.',
      'با INPUT_PULLUP، فشردن دکمه خط را به زمین وصل کرده و مقدار LOW تولید می‌کند؛ بنابراین منطق معکوس شده است.'
    ]
  }
];

module.exports = { problems };

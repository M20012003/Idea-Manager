const path=require('path');const { firefox }=require('playwright');
(async()=>{const b=await firefox.launch();const p=await b.newPage({viewport:{width:794,height:1123},deviceScaleFactor:1.4});
await p.goto('file://'+path.join(__dirname,'report.html').split(path.sep).join('/'));
await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);
for(const n of [1,6]){await p.locator('section.page').nth(n-1).screenshot({path:`gen/pv_${n}.png`});}
await b.close();console.log('done');})();

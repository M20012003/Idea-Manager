const { firefox } = require('playwright');
(async () => {
  const b = await firefox.launch();
  const p = await b.newPage();
  await p.setContent('<html dir="rtl"><body style="font-family:sans-serif"><h1>سلام</h1></body></html>');
  try { await p.pdf({ path: 'gen/pw.pdf', format: 'A4' }); console.log('PDF_OK'); }
  catch (e) { console.log('PDF_FAIL:', e.message.split('\n')[0]); }
  await b.close();
})().catch(e=>{console.log('ERR', e.message.split('\n')[0]); process.exit(1);});

// const puppeteer = require('puppeteer');

// // process.on('click', () => {

// // })

// const KOINEX_URL = 'https://koinex.in/';

// const buttonsXpaths = {
//   signInButton: '//E[contains(text(), "SIGN IN")]',
//   iUnderstandButtons: '//button[contains(text(), "I understand")]',
//   iUnderstandButtonsClass: 'button.solidBtn'
// }

// puppeteer.launch({ headless: false, slowMo: 100 }).then(async browser => {
//   const page = await browser.newPage();
//   await page.setViewport({width: 1024, height: 786});
//   await page.goto(KOINEX_URL);
//   await page.waitFor(2 * 1000);

//   const iUnderstandPopups = await page.$$(buttonsXpaths.iUnderstandButtonsClass);
//   if (iUnderstandPopups.length) {
//     for (const popup of iUnderstandPopups) {
//       popup.click();
//       await page.waitFor(1 * 1000);
//     }
//   }
//   // await iUnderstandPopups[0].click();
//   // await page.waitFor(100);
//   // await iUnderstandPopups[1].click();  
//   // const signInButton = await page.$x(buttonsXpaths.signInButton);
//   // await signInButton.click();.
//   await page.waitFor(10 * 1000)
// });


// const obj = { a: 'a', b: 'b' };

// const aa = (opts) => { const options = { ...obj, ...opts}; console.log({ options  })}

// aa({ a: 'c'})

import Redis from 'ioredis';
const r = new Redis();

console.log(r);
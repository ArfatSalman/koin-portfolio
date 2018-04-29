const CircularQueue = require('circular-queue');
const puppeteer = require('puppeteer');

// process.on('click', () => {

// })

const KOINEX_URL = 'https://koinex.in/';

const buttonsXpaths = {
  signInButton: '//E[contains(text(), "SIGN IN")]',
  iUnderstandButtons: '//button[contains(text(), "I understand")]',
  iUnderstandButtonsClass: 'button.solidBtn'
}

puppeteer.launch({ headless: false, slowMo: 100 }).then(async browser => {
  const page = await browser.newPage();
  await page.setViewport({width: 1024, height: 786});
  await page.goto(KOINEX_URL);
  await page.waitFor(2 * 1000);

  const iUnderstandPopups = await page.$$(buttonsXpaths.iUnderstandButtonsClass);
  if (iUnderstandPopups.length) {
    for (const popup of iUnderstandPopups) {
      popup.click();
      await page.waitFor(1 * 1000);
    }
  }
  // await iUnderstandPopups[0].click();
  // await page.waitFor(100);
  // await iUnderstandPopups[1].click();  
  // const signInButton = await page.$x(buttonsXpaths.signInButton);
  // await signInButton.click();.
  await page.waitFor(10 * 1000)
});


const obj = { a: 'a', b: 'b' };

const aa = (opts) => { const options = { ...obj, ...opts}; console.log({ options  })}

aa({ a: 'c'})

import Redis from 'ioredis';
const r = new Redis();

console.log(r);

const x = [9, 8, 7, 6, 5, 4, 3, 2, 1];
const y = [44000.00, 43504.00, 43505.00, 43650.00, 43700.00, 43702.00, 43701.00, 43702.00, 43702.00]

const slope = (x1, y1, x2, y2) => (y2 - y1) / (x2 - x1)

for (let i = 0; i < x.length - 1; i++) {

    console.log(slope(x[i], y[i], x[i+1], y[i+1]));
}

const a = new CircularQueue(3);

a.offer(1)
a.offer(2)
a.offer(3)
a.offer(4)


console.log(a)
//const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { parse } = require('node-html-parser')
puppeteer.use(StealthPlugin())
const fs = require('fs')
const {createServer} = require('http');

const hostname = '127.0.0.1';
const port = 3000;
var page = null;
var resData = fs.createWriteStream('result_data.txt')
var allItems = []
const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

const scrapOne = async (id) => {
  await page.click('#' + id)
  await page.waitForTimeout(5000)
  const curURL = await page.url()
  console.log(curURL)
  await page.waitForSelector('#product-page > div > h-back-button > button')
  await page.click('#product-page > div > h-back-button > button')
  await page.waitForTimeout(5000)
}

(async () => {
  const browser = await puppeteer.launch({
    // args: ['--disable-infobars'],
    ignoreDefaultArgs: ["--enable-automation"],
    // // product: 'firefox',
    // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    ignoreHTTPSErrors: true,
    slowMo: 0,
    args: ['--window-size=1400,900',
    '--remote-debugging-port=9222',
    "--remote-debugging-address=0.0.0.0", // You know what your doing?
    '--disable-gpu', "--disable-features=IsolateOrigins,site-per-process", '--blink-settings=imagesEnabled=true']
  })
  
  page = await browser.newPage()
  await page.waitForTimeout(5000)
  await page.goto('https://www.hermes.com/jp/ja/', {
    waitUntil: 'load',
  })
  // await page.goto('https://www.hermes.com/jp/ja/search/?s=%E3%83%94%E3%82%B3%E3%82%BF%E3%83%B3#|', {
  //   waitUntil: 'load',
  // })
  await page.waitForTimeout(3000)
  await page.waitForSelector('#block-hermes-commerce-nav-search')
  await page.type('#block-hermes-commerce-nav-search', "ピコタン")
  await page.waitForTimeout(3000)
  await page.keyboard.press('Enter')
  await page.waitForNavigation({
    waitUntil: 'load',
  });
  await page.waitForTimeout(3000)
  const eleAllSelector = '//*[@id="main-content"]/h-grid-page/div[2]/h-grid-results/div[1]'
  await page.waitForXPath(eleAllSelector)
  let elHandle = await page.$x(eleAllSelector);
  let contents = await page.evaluate(el => el.innerHTML, elHandle[0])
  await page.waitForTimeout(5000)
  const htmlpage = parse(contents)
  const allItemDivs = htmlpage.querySelectorAll('.product-grid-list-item')
  allItemDivs.map(item => {
    allItems.push(item.id)
  })

  console.log(allItems)
  const currentURL = page.url()
  for(let i=0; i<allItems.length; i++){
    await scrapOne(allItems[i])
  }
  await page.waitForTimeout(3000)
  await page.waitForTimeout(300000)
  await browser.close

})();
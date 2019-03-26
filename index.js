const puppeteer = require('puppeteer');

debugger;
(async function main() {
  try {
    // Begin with puppeteer Code

    // Launch the Chromium browser - have a browser object
    // show browser with: headless:false
    const browser = await puppeteer.launch({
      headless: false,
    });

    // Create a new page in the browser - have a page object
    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 800 });


    /* This Multi-comment section deals with scraping youtube channels of their videos, and doing stuff with it
   
    await page.goto('https://www.youtube.com/channel/UC730MnII4-CDUtUKGhPCNsA');
   
    // We know the page is loaded up when the container of "Home, videos, playlist,..." is found
    await page.waitForSelector('div#tabsContainer')
   
    console.log('Page is showing!')
   
    // "Getting" that SINGULAR$ "tabs container" that has MULTIPLE$$ tabs "Home,videos,..."
    const tabContainer = await page.$('div#tabsContainer')
   
    // Get ALL MULTIPLE$$ "button tabs" inside the container, that have the following paths, put it inside a variable
    const btnTabs = await page.$$('div.tab-content')
    //btnTabs.length = 5
   
    // Getting inner text
    // const firstButtonName = await page.evaluate( button => button.innerText, button)
    // console.log('First Button Name: ', firstButtonName) // HOME
   
    // The 2nd item in this list is the "Videos" tab
    // btnTabs[1].click()
    // Problem - it doesn't wait for pre-loading! This view gives us 13 videos
   
   
    // This view gives us 32 videos
    const preloadRes = await Promise.all([
     page.waitForNavigation({"waitUntil" : "networkidle0"}),
     btnTabs[1].click(),
   ]);
   
   
    // Below is the same as above! - except using goto()
    // bypassing clicking the tab - gives me 32 videos
    // await page.goto('https://www.youtube.com/channel/UC730MnII4-CDUtUKGhPCNsA/videos', {"waitUntil" : "networkidle0"});
   
   
   
    // Page is fully loaded when bottom is loaded
    await page.waitForSelector('ytd-app')
   
    console.log('new page')
   
    // This view gives us 65 videos
    // I added the line: 'await async function scrollFunc() {...}'
    await scrollFunc()
   
    // Get the SINGULAR$ container that holds the MULTIPLE$$ videos
    const ytVideoCont = await page.$('ytd-browse')
   
    // Get the MULTIPLE$$ videos
    const ytVideos = await page.$$('a#thumbnail')
   
    // Keep scrolling to get the full length
    console.log(ytVideos.length)
   
    // EXP1: Get all of the hrefs, put them into an array
    const hrefs = await page.$$eval('a#thumbnail', aThumbs => aThumbs.map(a => a.href))
   
    console.log(hrefs)
   
    End of multi-line comment
    */


    // Go to a video with a lot of comments, use scroll function

    await page.goto('https://www.youtube.com/watch?v=QVA33KFZhUo');

    // We know this page is loaded when the below selector renders on screen
    await page.$('yt-visibility-monitor#visibility-monitor')

    await console.log('video is in view!')
    // yt-visibility-monitor id="visibility-monitor"

    // a delay function to let the video render, so we can click it to pause it (not needed during headless)
    function delay(time) {
      return new Promise(function (resolve) {
        setTimeout(resolve, time)
      });
    }

    // time to let the video render
    await delay(1000);

    // Get the video element
    const videoBtn = await page.$('video.video-stream')

    // stop the video
    await videoBtn.click()

    // Below will mute the video
    // const muteBtn = await page.$('button.ytp-mute-button')
    // muteBtn.click()

    // The Scroll function that we will be using in our application, so that stuff will load as we are scrolling - may need to be updated
    async function scrollFunc() {
      await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
          try {
            const maxScroll = Number.MAX_SAFE_INTEGER;
            let lastScroll = 0;

            const interval = setInterval(() => {
              window.scrollBy(0, 100); //scroll amount
              const scrollTop = document.documentElement.scrollTop;
              if (scrollTop === maxScroll || scrollTop === lastScroll) {
                clearInterval(interval);
                resolve();
              } else {
                lastScroll = scrollTop;
              }
            }, 100); //scroll time

          } catch (err) {
            console.log(err);
            reject(err.toString());
          }
        });
      });
    }

    // Scroll all the way down
    await scrollFunc()

    await console.log('scroll completed?')

  } catch (error) {
    console.log("our error", error)
  }

})();


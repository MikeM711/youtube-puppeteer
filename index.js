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

    // await page.setViewport({ width: 1280, height: 800 });


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

    // Controversial videos, like politics, tend to have a lot of "show more replies"
    // https://www.youtube.com/watch?v=U1_ZvIVQHuI

    // Go to a video with a lot of comments, use scroll function
    // Here's a nature video: https://www.youtube.com/watch?v=Ce-l9VpZn84

    // large video test: https://www.youtube.com/watch?v=th5QV1mnWXo
    await page.goto('https://www.youtube.com/watch?v=U1_ZvIVQHuI');

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
    await delay(1500);

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
              window.scrollBy(0, 1000); //scroll amount
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

    console.log('scrolling...')

    let active = true

    while (active) {
      await scrollFunc()

      // below will gather a new $('context') at each iteration, and test to see if visible or not
      let buffer = await page.$('yt-next-continuation.ytd-item-section-renderer')

      if (!buffer) {
        console.log("no more 'continuation' tags")
        active = false
      }

    }

    console.log('out of while loop')

    // The "context" of all "View # replies" buttons in the below selector, a long rectangle 'div-like' selector - AKA expander
    let expander = await page.$$('ytd-expander.ytd-comment-replies-renderer')

    console.log('clicking buttons')

    // iterate thru all visible reply buttons
    if (expander) {
      for (let i = 0; i < expander.length; i++) {

        // inside the expander context, there's a "View # replies" button in the below selector
        let showMore = await expander[i].$('div.more-button')

        // click that "View # replies" button
        await showMore.click()

        // how many replies are found after we click the particular "View # replies" button?
        let clickedReplies = await expander[i].$$('ytd-comment-renderer.ytd-comment-replies-renderer')
        // console.log(clickedReplies.length) - I return 0 almost all of the time

        /* Note: If we click too many, too fast - the program will mis-click
          To slow the program down, we will keep the exeuction in a while-loop until a reply renders out */
        while(clickedReplies == 0){
          clickedReplies = await expander[i].$$('ytd-comment-renderer.ytd-comment-replies-renderer')
        }

        // replies have been rendered out, execution will continue
        
        await console.log('spinner disappeared')

        await console.log(`${i + 1} " out of " ${expander.length} "comments"`)
      }
    }

    // need more time to correctly gather up "Show more replies" buttons
    // Add in something other than a delay time???
    // The issue: sometimes showMoreRep can equal ZERO!
    await delay(300)
    
    // all currently visible "Show more replies" buttons
    let showMoreRep = await page.$$('yt-formatted-string.yt-next-continuation')

    // total amount of replies currently
    let totRep = await page.$$('ytd-comment-renderer.ytd-comment-replies-renderer')

    console.log(showMoreRep.length)

    // If "Show more replies" button is visible (1 or more butttons are visible), enter while loop
    while (showMoreRep.length > 0) {
      // iterate thru all visible "Show more replies" buttons


      // Problem: too many buttons to click - not enough in view
      if (showMoreRep.length > 0) {
        for (let i = 0; i < showMoreRep.length; i++) {
          
          // don't click so fast...
          await showMoreRep[i].click()
          //await delay(300);
          
          /* Execution can continue if:
            1. (yt-formatted-string.yt-next-continuation) turns to -1 
              - 1 less "show more replies" buttons displayed
            2. OR (ytd-comment-renderer.ytd-comment-replies-renderer) is great than previously!
              - More replies have been displayed now, since pressing the "show more button" than before we pressed it
          */

          // All currently visible "Show more replies" buttons - After click
          let showMoreRepAfter = await page.$$('yt-formatted-string.yt-next-continuation')

          // All currently visible replies - After click
          let totRepAfter = await page.$$('ytd-comment-renderer.ytd-comment-replies-renderer')


          let showMoreRepActive = true

          while(showMoreRepActive){
            showMoreRepAfter = await page.$$('yt-formatted-string.yt-next-continuation')
            totRepAfter = await page.$$('ytd-comment-renderer.ytd-comment-replies-renderer')
            // exit loop if one less "show more replies" button OR if we end up with more replies than before
            if(showMoreRepAfter.length == showMoreRep.length - 1 
              || totRep < totRepAfter){
              showMoreRepActive = false
            }

          // Once we know that our page updated, we need to set the default criteria for next time
          showMoreRep = await showMoreRepAfter
          totRep = await totRepAfter
          }
          
          console.log('out of while loop')

          console.log(`${i + 1} " out of " ${showMoreRep.length} "comments"`)
        }

        console.log('out of loop')
        // Get a new count of "Show more replies" buttons
        showMoreRep = await page.$$('paper-button.yt-next-continuation')
      }
    }

    await console.log('comments expanded?')

    // Every post: yt-formatted-string#content-text

    // I don't think i need to open up all  "Read more" buttons!
    // Youtube comment # does not match actual comments (?)

  } catch (error) {
    console.log("our error", error)
  }

})();


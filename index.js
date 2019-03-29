const puppeteer = require('puppeteer');

debugger;
(async function main() {
  try {
    // Begin with puppeteer Code

    // Launch the Chromium browser - have a browser object
    // show browser with: headless:false
    const browser = await puppeteer.launch({
      headless: false,
      // slowMo: 250 // slow down by 250ms
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
    // quick video test: https://www.youtube.com/watch?v=az8DrhofHeY
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
        await delay(100) // some "breathing time" for execution after render
        
        await console.log('spinner disappeared')

        await console.log(`${i + 1} " out of " ${expander.length} "comments"`)
      }
    }

    // need more time to correctly gather up "Show more replies" buttons
    // Add in something other than a delay time???
    // The issue: sometimes showMoreRep can equal ZERO!
    await delay(2000) // default: 2000

    console.log('clicking "show more replies" buttons')


    // all currently visible "Show more replies" buttons
    let showMoreRep = await page.$$('yt-formatted-string.yt-next-continuation')

    // total amount of replies currently
    // let totRep = await page.$$('ytd-comment-renderer.ytd-comment-replies-renderer')

    active = true

    while (active) {

      let singleMoreRep = await page.$('yt-formatted-string.yt-next-continuation')
      if (singleMoreRep) {

        // All replies before button click
        let preTotRep = await page.$$('ytd-comment-renderer.ytd-comment-replies-renderer')
        // All "Show More Replies" buttons before button click
        let preTotMoreRep = await page.$$('yt-formatted-string.yt-next-continuation')

        singleMoreRep.click()

        

        renderActive = true;
        while (renderActive) {
          // All replies after button click
          let afterTotRep = await page.$$('ytd-comment-renderer.ytd-comment-replies-renderer')

          // All "Show More Replies" buttons before button click
          let afterTotMoreRep = await page.$$('yt-formatted-string.yt-next-continuation')

          

          // If more posts have been rendered than pre-button click, allow execution to move on
          if (preTotRep.length < afterTotRep.length) {
            renderActive = false;
          }

          if (afterTotMoreRep.length == preTotMoreRep.length - 1){
            renderActive = false;
            // If problems, add a delay here
          }

        }
        await delay(200) // Even though everything is rendered properly at this point, this gives some "breathing room", before next execution

        // Check if there is another level-deep of "Show more replies"
        showMoreRep = await page.$$('yt-formatted-string.yt-next-continuation')
        console.log(`${showMoreRep.length} "show more replies" buttons visible`)

      } else {
        active = false
      }

    }

    await console.log('comments expanded?')
    // ctrl+f "show more replies" = 1


    // total amount of replies currently
    const totRep = await page.$$('ytd-comment-renderer.ytd-comment-replies-renderer') // 212 (total - 1)

    const toPosts = await page.$$('ytd-comment-thread-renderer.ytd-item-section-renderer') // 159

    const allComments = await page.$$('yt-formatted-string#content-text')

    console.log("We have found: ", allComments.length , "comments")

    // Put comments into an object to be rendered

    /* Each comment thread: 
      ytd-comment-renderer.ytd-comment-thread-renderer (37)

      Comment thread body (carries all information): "
      "ytd-comment-thread-renderer.ytd-item-section-renderer 

      ytd-comment-renderer.ytd-comment-thread-renderer div#body"

      //////////////////////////////////////////////////////////

      Comment thread text FULL PATH: (37)
      "ytd-comment-thread-renderer.ytd-item-section-renderer 
      
      ytd-comment-renderer.ytd-comment-thread-renderer div#body div#main ytd-expander#expander div#content yt-formatted-string#content-text"

      //////////////////////////////////////////////////////////

      Comment replies FULL PATH: (23)
      "ytd-comment-thread-renderer.ytd-item-section-renderer 
      
      div#replies ytd-comment-replies-renderer ytd-expander div#content div div#loaded-replies ytd-comment-renderer"
    */

    const allOPCommentContainers = await page.$$('ytd-comment-thread-renderer.ytd-item-section-renderer')

    for(let i = 0; i < allOPCommentContainers.length; i++){

      // const comment = allOPCommentContainers[i].$()

      // Does this post have replies?
      const hasReplies = await allOPCommentContainers[i].$('div#replies ytd-comment-replies-renderer ytd-expander div#content div div#loaded-replies ytd-comment-renderer')

      if(hasReplies){
        console.log('Replies found for',(i+1))
      }
      if(!hasReplies){
        console.log('No replies found for', (i+1))
      }

    }


    
  } catch (error) {
    console.log("our error", error)
  }

})();


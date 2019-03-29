# youtube-puppeteer
A YouTube scraper using Google's Puppeteer

## Some Goals
- Scrape all comments of a video
  - Output in a similar fashion to how youtube does
- Scrape all uploader comments on all uploader videos

## Tests
- Working with comment threads that have multiple "show more replies"

## Todos
1. Cycle through "Show more replies", until none is found
2. Instead of a delay, stop/mute the video once the page is fully rendered (I believe that is an accurate time to stop)
  - May not need this for `headless:true` for production
3. Might be able to trim the fat off the scroll function

## Solutions
- "View # Replies" buttons are not clicked too quickly anymore!
  - Before: If we were to click all of the "View # Replies" buttons too quickly, many "paper-spinners" (the progress icon) become loaded.  At a certain point, too many of these "reply" comment threads can render out, and puppeteer may end up clicking random things, instead of the "View # Replies" buttons.
  - Now: Inside the `for` loop, a `while` loop stops the execution and waits for replies to be rendered; and then moves on once replies have been found. Therefore, only one paper-spinner can be loaded at maximum.
- "Show more replies" buttons are also not clicked too quickly
  - Once clicked, execution moves only if there is a change in the number of "Show More Replies" buttons, or, a change in the number of "replies" on the video
  - **Note:** YouTube has this quirk, where sometimes a "Show more replies" button would reveal ZERO replies - my code takes care of that (1st criteria above)
- Overall: Once a button is clicked and HTML is fully rendered, I added some "time to breathe" (time delay) after new YouTube HTML gets rendered. If we click too quickly (clicking another button right after render), puppeteer may miss-click and not recognize the HTML element.
  
## Future
Applications:
1. An Application that scrapes all comments of a particular YouTube video
  - Displays all comments
2. An Application that looks through every video from an uploader, and finds that uploader's comments
  - Displays all uploaders comments

Frontend:
- Comments to be displayed: Features username/date/vote-count(#likes)/context(url) of comment
  - Similar to how youtube displays comments
- Indicate video title/url at the top
- Progress bar

## Further in Future
Search features
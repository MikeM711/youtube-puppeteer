# youtube-puppeteer
A YouTube scraper using Google's Puppeteer

## Some Goals
- Scrape all comments of a video
  - Output in a similar fashion to how youtube does
- Scrape all uploader comments on all uploader videos

## Tests
- Working with comment threads that have multiple "show more replies"

## Todos
- Cycle through "Show more replies", until none is found

## Achievements
- "View # Replies" buttons are not clicked too quickly anymore!
  - Before: If we were to click all of the "View # Replies" buttons too quickly, many "paper-spinners" (the progress icon) become loaded.  At a certain point, too many of these "reply" comment threads can render out, and puppeteer may end up clicking random things, instead of the "View # Replies" buttons.
  - Now: Inside the `for` loop, a `while` loop stops the execution and waits for replies to be rendered; and then moves on once replies have been found. Therefore, only one paper-spinner can be loaded at maximum.
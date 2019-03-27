# youtube-puppeteer
A YouTube scraper using Google's Puppeteer

## Some Goals
- Scrape all comments of a video
  - Output in a similar fashion to how youtube does
- Scrape all uploader comments on all uploader videos

## Tests
- Working with comment threads that have multiple "show more replies"

## Notes
- L.174: Buttons are clicked too quickly. 
- Goal: 
  - `*click` one "view replies" button 
  - `*wait` for paper-spinner#spinner to disappear
    - or, atleast, be able to incorporate a delay within the `for loop`
  - `*click` another "view replies" button
- Try: More promises
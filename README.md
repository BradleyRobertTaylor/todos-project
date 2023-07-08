# Overview

Run `npm install` at the terminal from root directory of the project and make
sure you're running Node version `v10.24.1`. Afterward run `npm start` and navigate
to `http://localhost:3000` in your browser.

Because I was constatly re-rendering the page as new HTML I went ahead and used
event delegation for the whole page. I put a click event on the body and that
served for all of my events. The event listener did get very complex and probably
hard to maintain but for the purposes of this project I think it worked.

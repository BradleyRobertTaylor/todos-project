# Overview

Run `npm install` at the terminal from root directory of the project and make
sure you're running Node version `v10.24.1`. Afterward run `npm start` and navigate
to `http://localhost:3000` in your browser. 

I went ahead and used the html/css that was provided. Looking at that I assumed
that the best way to do it would be to somehow have an object that represented
the current context to render the Handlebars template correctly. I used my 
`TodoData` class to accomplish this. `TodoData` was the context object, `App`
handled all the event listeners and rendering of the DOM, and `DataBase` was
in charge of interacting with the API. `TodoData` also took care of any filtering
or ordering of todos.

Because I was constatly re-rendering the page as new HTML I went ahead and used
event delegation for the whole page. I put a click event on the body and that
served for all of my events. The event listener did get very complex and probably
hard to maintain but for the purposes of this project I think it worked.

## Assumptions

The only assumption that I really had was the ordering of the todo items. In the
demo app I didn't see any specific order except that completed todos would be last.
Because of that, I didn't concern myself with ordering todos by date. I did make
sure that the todo groups in the sidebar were ordered with `No Due Date`s coming
first.


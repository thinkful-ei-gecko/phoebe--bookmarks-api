const express = require('express');
const bookmarksRouter = express.Router();
const BookmarksService =  require('./bookmarks-service')
const xss = require('xss');

//Weird structure here is per it being one line (despite the object taking up multiple lines)
const serializedBookmark = bookmark => ({
  description: xss(bookmark.description), 
  ...bookmark
})

bookmarksRouter
  .route('/')
  .get((req, res, next) => {
    BookmarksService.getAllBookmarks(req.app.get('db'))
      .then(bookmarks => {
        //Weird syntax after map is per w/o a callback, this doing the same thing
        res.json(bookmarks.map(serializedBookmark))
      })
      .catch(next);
  })

// bookmarksRouter
//   .route(`/:bookmarkID`)

module.exports = bookmarksRouter; 
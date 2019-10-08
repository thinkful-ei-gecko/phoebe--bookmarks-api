const path = require('path');
const express = require('express');
const xss = require('xss');

const BookmarksService =  require('./bookmarks-service')

const bookmarksRouter = express.Router();
const responseJson = express.json();
  

//Weird structure here is per it being one line (despite the object taking up multiple lines)
const serializeBookmark = bookmark => ({
  description: xss(bookmark.description), 
  ...bookmark
})

bookmarksRouter
  .route('/')
  .get((req, res, next) => {
    BookmarksService.getAllBookmarks(req.app.get('db'))
      .then(bookmarks => {
        //Weird syntax after map is per w/o a callback, this doing the same thing
        res.json(bookmarks.map(serializeBookmark))
      })
      .catch(next);
  })
  .post(responseJson, (req, res, next) => {
    const { title, url, description, rating, id } = req.body;
    const newBookmark = { title, url, rating };

    for (const [key, value] of Object.entries(newBookmark)) {
      if (value == null) {
        return res.status(404).json({
          error: { message: `Missing ${key} in request body`}
        })
      }
    }

    newBookmark.description = description;
    newBookmark.id = id;

    BookmarksService.insertBookmark(
      req.app.get('db'), 
      newBookmark
    )
      .then(bookmark => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl + `/${bookmark.id}`))
          .json(serializeBookmark(bookmark))
      })
      .catch(next);
  })

bookmarksRouter
  .route(`/:bookmark_id`)
  .all((req, res, next) => {
    BookmarksService.getById(
      req.app.get('db'), 
      req.params.bookmark_id
    )
      .then(bookmark => {
        if (!bookmark) {
          return res.status(404).json({
            error: { message: 'Bookmark does not exist'}
          })
        }
        res.bookmark = bookmark;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeBookmark(res.bookmark));
  })


module.exports = bookmarksRouter; 
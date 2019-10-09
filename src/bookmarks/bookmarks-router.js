const path = require('path');
const express = require('express');
const xss = require('xss');

const BookmarksService =  require('./bookmarks-service')

const bookmarksRouter = express.Router();
const jsonParser = express.json();
  

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
  .post(jsonParser, (req, res, next) => {
    const { title, url, description, rating, id } = req.body;
    const newBookmark = { title, url, rating };
    const ratingNum = parseInt(rating)

    for (const [key, value] of Object.entries(newBookmark)) {
      if (value == null) {
        return res.status(404).json({
          error: { message: `Missing ${key} in request body`}
        })
      }
    }

    if (typeof(title) !== 'string' || typeof(url) !== 'string' || typeof(description) !== 'string') {
      return res.status(400).json({
        error: { message: `Title, url, and description must be strings`}
      })
    }
    if (ratingNum > 5 || ratingNum < 1) {
      return res.status(400).json({
        error: { message: `Rating must be an integer between 1 and 5`}
      })
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
  .delete((req, res, next) => {
    BookmarksService.deleteBookmark(
      req.app.get('db'),
      req.params.bookmark_id
    )
      .then(() => {
        res.status(204).end()
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, url, rating, description } = req.body;
    const fieldsToUpdate = { title, url, rating, description }

    const numOfValues = Object.values(fieldsToUpdate).filter(Boolean).length;
    if (numOfValues === 0) {
      return res
        .status(400)
        .json({
          error: {
            message: `Request body must either contain title, url, rating, or description`
          }
        })
    }
    
    BookmarksService.updateBookmark(
      req.app.get('db'), 
      req.params.bookmark_id,
      fieldsToUpdate
    )
      .then(() => {
        res.status(204).end()
      })
  })


module.exports = bookmarksRouter; 
const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");

const makeBoomarksArray = require("./bookmarks.fixtures");

describe("Bookmarks endpoints", () => {
	let db;

	before("Make a knex instance", () => {
		db = knex({
			client: "pg",
			connection: process.env.TEST_DB_URL
		});
		app.set("db", db);
	});

	beforeEach("Empty db", () => db("bookmarks").truncate());

	afterEach("Empty db", () => db("bookmarks").truncate());

	after("disconnect from db", () => db.destroy());

	describe("GET /bookmarks", () => {
		context("Given there are no bookmarks in the table", () => {
			it("GET /bookmarks responds with a 200 and an empty array", () => {
				return supertest(app)
					.get("/bookmarks")
					.expect(200, []);
			});
		});

		context("Given there are bookmarks in the table", () => {
			const testBookmarks = makeBoomarksArray();

			beforeEach("insert bookmarks", () => {
				return db
					.into("bookmarks")
					.insert(testBookmarks)
					.select("*");
			});

			it("GET /bookmarks responds with a 200 and all bookmarks are returned", () => {
				return supertest(app)
					.get("/bookmarks")
					.expect(results => {
            let description;
            let title;
            let url; 
            let rating;
            
            const actual = results.body.map(res => ({
              description: res.dscription,
              title: res.title, 
              url: res.url, 
              rating: res.rating
            }));
						const expected = testBookmarks.map(bookmark => ({
              description: bookmark.dscription,
              title: bookmark.title, 
              url: bookmark.url, 
              rating: bookmark.rating
            }));

						expect(actual).to.be.eql(expected);
					})
					.expect(200);
			});
		});
  });
  
  describe('POST /bookmarks', () => {
    it('POST /bookmarks creates and returns a bookmark and a 201 status', () => {
      const newBookmark = {
        title: 'Glossier',
        url: 'https://glossier.com',
        description: 'cool girl makeup',
        rating: 5
      }

      return supertest(app)
        .post('/bookmarks')
        .send(newBookmark)
        .expect(201)
        .expect(res => {
          const expected = {
            title: res.body.title,
            url: res.body.url,
            description: res.body.description, 
            rating: res.body.rating,
          }
          expect(expected).to.be.eql(newBookmark)
        })
        .then(postRes => {
          supertest(app)
            .get(`/bookmarks/${postRes.body.id}`)
            .expect(postRes.body)
        })
    })
  })

  describe('GET /bookmarks/:bookmarkId', () => {
    context('Given no articles', () => {
      const bookmark_id = 2;
      it('GET /bookmarks/:bookmarks_id returns a 404 and an error message', () => {
        return supertest(app)
          .get(`/bookmarks/${bookmark_id}`)
          .expect(404, {
            error: { message: 'Bookmark does not exist'}
          })
      })
    })

    context('Given articles', () => {

      const testBookmarks = makeBoomarksArray();
      beforeEach("insert bookmarks", () => {
        return db
          .into("bookmarks")
          .insert(testBookmarks)
          .select("*");
      });

      it('GET /bookmarks/:bookmark_id returns a 200 and an article with the matching id is returned', () => {
        const bookmark_id = 2;
        const expectedBookmark = ({
          id: bookmark_id,
          description: testBookmarks[bookmark_id].description,
          title: testBookmarks[bookmark_id].title, 
          url: testBookmarks[bookmark_id].url, 
          rating: testBookmarks[bookmark_id].rating
        })

        return supertest(app)
        .get(`/bookmarks/${bookmark_id}`)
        .expect(200, expectedBookmark);
      });
    });
  });
})

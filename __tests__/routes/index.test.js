const request = require('supertest')
const app = require('../../app')

describe('/', () => {
  it('Should show landing page', done => {
    request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(res => expect(res.text).toMatch(/Thumbnail Generator API/))
      .expect(200)
      .end(done)
  })
})

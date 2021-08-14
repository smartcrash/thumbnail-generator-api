const request = require('supertest')
const app = require('../../app')
const { resolve } = require('path')

const createRequest = () => request(app).post('/generator')

const getFile = fileName => resolve(`__tests__/routes/files/${fileName}`)

const assertSuccessResponse = res => {
  const { success, id, thumbnails } = res.body

  console.log(`res.body`, res.body)

  expect(success).toBe(true)
  expect(typeof id).toBe('string')
  expect(thumbnails).toHaveLength(3)

  for (const thumbnail of thumbnails) {
    expect(typeof thumbnail).toBe('string')
    expect(thumbnail).toContain(id)
    expect(thumbnail).toMatch(/(http:|https:)+[^\s]+[\w]/)
  }

  // Each element of "thumbnails" is an URL pointing to that image
  expect(thumbnails[0]).toContain('400x300')
  expect(thumbnails[1]).toContain('160x120')
  expect(thumbnails[2]).toContain('120x120')
}

const assertErrorResponse = (res, expectedMessage) => {
  expect(res.body).toEqual({
    error: true,
    message: expectedMessage,
  })
}

describe('POST /generator', () => {
  describe('only accepts PNG and JPEG files', () => {
    it('allows PNG files', done => {
      createRequest().attach('image', getFile('a-png.png')).expect(200).end(done)
    })

    it('allows JPG/JPEG files', done => {
      createRequest().attach('image', getFile('a-jpg.jpg')).expect(200).end(done)
    })

    it('does not allow any other file type', done => {
      createRequest()
        .attach('image', getFile('a-pdf.pdf'))
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(res => assertErrorResponse(res, `Invalid file extension. Allowed extensions: PNG, JPG, JPEG`))
        .end(done)
    })
  })

  it('must reject input file bigger than 5mb', done => {
    createRequest()
      .attach('image', getFile('a-very-large-file.png'))
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(res => assertErrorResponse(res, 'The image is too large. Max size 5MB'))
      .end(done)
  })

  it('gives 3 new images with the following dimensions: 400x300, 160x120, 120x120', done => {
    createRequest()
      .attach('image', getFile('a-png.png'))
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(assertSuccessResponse)
      .end(done)
  })
})

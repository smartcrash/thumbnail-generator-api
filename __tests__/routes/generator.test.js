const request = require('supertest')
const app = require('../../app')
const { resolve } = require('path')
const { v4: uuid } = require('uuid')
const imageSize = require('image-size')
const { createWriteStream, statSync, rmdir, mkdir, mkdirSync } = require('fs')

const getFile = fileName => resolve(`__tests__/routes/files/${fileName}`)

const assertSuccessResponse = res => {
  const { success, id, thumbnails } = res.body

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

describe('POST /', () => {
  describe('only accepts PNG and JPEG files', () => {
    it('allows PNG files', done => {
      request(app).post('/').attach('image', getFile('a-png.png')).expect(200).end(done)
    })

    it('allows JPG/JPEG files', done => {
      request(app).post('/').attach('image', getFile('a-jpg.jpg')).expect(200).end(done)
    })

    it('does not allow any other file type', done => {
      request(app)
        .post('/')
        .attach('image', getFile('a-pdf.pdf'))
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(res => assertErrorResponse(res, `Invalid file extension. Allowed extensions: PNG, JPG, JPEG`))
        .end(done)
    })
  })

  it('must reject input file bigger than 5mb', done => {
    request(app)
      .post('/')
      .attach('image', getFile('a-very-large-file.png'))
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(res => assertErrorResponse(res, 'The image is too large. Max size 5MB'))
      .end(done)
  })

  it('gives 3 new images with the following dimensions: 400x300, 160x120, 120x120', done => {
    request(app)
      .post('/')
      .attach('image', getFile('a-png.png'))
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(assertSuccessResponse)
      .end(done)
  })
})

describe('GET /:id/:size?', () => {
  it('returns previously generated thumbnails by ID', async () => {
    const response = await request(app)
      .post('/')
      .attach('image', getFile('a-jpg.jpg'))
      .expect(200)
      .expect('Content-Type', /json/)

    const { id } = response.body

    return request(app).get(`/${id}`).expect(200).expect('Content-Type', /image/)
  })

  describe('accepts `size` optional paramenter to return the image in the following dimensions: 400x300, 160x120, 120x120', () => {
    const tmpdir = resolve('tmp/')
    let id

    beforeAll(done => {
      mkdirSync(tmpdir, { recursive: true })

      request(app)
        .post('/')
        .attach('image', getFile('a-jpg.jpg'))
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => (id = res.body.id))
        .end(done)
    })

    afterAll(done => rmdir(tmpdir, { recursive: true, force: true }, done))
    ;[
      [400, 300],
      [160, 120],
      [120, 120],
    ].forEach(size => {
      it(size.join('x'), done => {
        const fileName = `${tmpdir}/${uuid()}.jpeg`
        const writeStream = createWriteStream(fileName)

        request(app)
          .get(`/${id}/${size.join('x')}`)
          .expect(200)
          .expect('Content-Type', /image/)
          .pipe(writeStream, { end: true })

        writeStream.on('finish', () => {
          const { width, height } = imageSize(fileName)
          expect([width, height]).toEqual(size)
          done()
        })
      })
    })
  })
})

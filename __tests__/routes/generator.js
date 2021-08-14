const request = require('supertest')
const app = require('../../app')
const { resolve } = require('path')

const createRequest = () => request(app).post('/generator')

describe('POST /generator', () => {
  describe('only accepts PNG and JPEG files', () => {
    it('allows PNG files', done => {
      createRequest()
        .attach('image', resolve('__tests__/routes/files/a-png.png'))
        .expect(200)
        .end(done)
    })

    it('allows JPG/JPEG files', done => {
      createRequest()
        .attach('image', resolve('__tests__/routes/files/a-jpg.jpg'))
        .expect(200)
        .end(done)
    })

    it('does not allow any other file type', done => {
      createRequest()
        .attach('image', resolve('__tests__/routes/files/a-pdf.pdf'))
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(res =>
          expect(res.body).toEqual({
            status: 400,
            error: 'BadRequest',
            message: `Invalid file extension. Allowed extensions: PNG, JPG, JPEG`,
          })
        )
        .end(done)
    })
  })

  it('must reject input file bigger than 5mb', done => {
    createRequest()
      .attach('image', resolve('__tests__/routes/files/a-very-large-file.png'))
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(res =>
        expect(res.body).toEqual({
          status: 400,
          error: 'BadRequest',
          message: 'The image is too large. Max size 5MB',
        })
      )
      .end(done)
  })
})

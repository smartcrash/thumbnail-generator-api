const express = require('express')
const router = express.Router()
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ dest: 'uploads/', storage })
const { v4: uuid } = require('uuid')
const { writeFile, mkdir } = require('fs').promises
const { resolve } = require('path')
const sharp = require('sharp')

const fullURL = req => req.protocol + '://' + req.get('host')

const allowMimeTypes = ['image/jpeg', 'image/jpg', 'image/png']
const validateMimeType = (mimetype = '') => allowMimeTypes.includes(mimetype)

const createThumbnails = (buffer, sizes) => {
  const buffers = Promise.all(
    sizes.map(size => {
      return sharp(buffer)
        .resize(...size)
        .jpeg({ mozjpeg: true })
        .toBuffer()
    })
  )

  return buffers
}

/**
 * @openapi
 * /:
 *   get:
 *     description: Returns a previously generated thumbnail by `id` and `size`
 */
router.get('/:id/:size?', (req, res) => {
  const { id, size = '400x300' } = req.params

  res.sendFile(resolve(`public/thumbnails/${id}/${size}.jpeg`))
})

/**
 * @openapi
 * /:
 *   post:
 *     description: Generates a thumbnail from a source image
 *     responses:
 *       200:
 *         description: Returns converted image in varioures dimentions
 */
router.post('/', upload.single('image'), async (req, res, next) => {
  const { file } = req
  const { mimetype, size: sizeInBytes, buffer: fileBuffer } = file
  const sizeInMB = sizeInBytes / (1024 * 1024)

  if (!validateMimeType(mimetype)) {
    res.status(400).json({
      error: true,
      message: `Invalid file extension. Allowed extensions: PNG, JPG, JPEG`,
    })
    return
  }

  if (sizeInMB > 5) {
    res.status(400).json({
      error: true,
      message: 'The image is too large. Max size 5MB',
    })
    return
  }

  try {
    const dimentions = [
      [400, 300],
      [160, 120],
      [120, 120],
    ]

    const id = uuid()
    const url = fullURL(req)
    const buffers = await createThumbnails(fileBuffer, dimentions)

    const directory = resolve(`public/thumbnails/${id}`)
    await mkdir(directory, { recursive: true })
    await Promise.all([
      writeFile(`${directory}/400x300.jpeg`, buffers[0]),
      writeFile(`${directory}/160x120.jpeg`, buffers[1]),
      writeFile(`${directory}/120x120.jpeg`, buffers[2]),
    ])

    const thumbnails = [`${url}/thumbnails/${id}/400x300`, `${url}/${id}/160x120`, `${url}/${id}/120x120`]

    res.status(200).json({
      success: true,
      id,
      thumbnails,
    })
  } catch (error) {
    res.status(400).json({
      error: true,
      message: 'Oops! Something went wrong, please try later.',
    })
  }
})

module.exports = router

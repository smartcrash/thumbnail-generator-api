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
 * @swagger
 * /{id}/{size}:
 *   get:
 *     summary: Get thumbnail by ID
 *     description: ''
 *     produces:
 *       - image/jpeg
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *       - name: size
 *         in: path
 *         required: true
 *         type: string
 *         enum: [400x300, 160x120, 120x120]
 *         default: 400x300
 *     responses:
 *       200:
 *         description: The image in the requested dimention
 *       404:
 *          description: Not Found
 */
router.get('/:id/:size?', (req, res) => {
  const { id, size = '400x300' } = req.params

  res.sendFile(resolve(`public/thumbnails/${id}/${size}.jpeg`))
})

/**
 * @swagger
 * /:
 *   post:
 *     summary: 'Generates a thumbnails from a source image'
 *     description: ''
 *     operationId: 'createThumbnails'
 *     consumes:
 *       - 'multipart/form-data'
 *     produces:
 *       - 'application/json'
 *     parameters:
 *       - in: 'formData'
 *         name: 'image'
 *         description: 'The source image'
 *         type: 'file'
 *         required: true
 *     responses:
 *       '200':
 *         description: 'Successful operation'
 *         schema:
 *           type: 'object'
 *           properties:
 *             success:
 *               type: 'boolean'
 *             id:
 *               type: 'string'
 *               description: 'This is the ID of the created image. This is used to request the thumbnails'
 *             thumbnails:
 *               type: 'array'
 *               description: 'A list containing the URL to request the thumbnails'
 *               items:
 *                 type: 'string'
 *               uniqueItems: true
 *               maxItems: 3
 *               minItems: 3
 *       '405':
 *         description: 'Invalid image'
 *         schema:
 *           type: 'object'
 *           properties:
 *             error:
 *               type: 'boolean'
 *             message:
 *               type: 'string'
 */
router.post('/', upload.single('image'), async (req, res, next) => {
  const { file } = req
  const { mimetype, size: sizeInBytes, buffer: fileBuffer } = file
  const sizeInMB = sizeInBytes / (1024 * 1024)

  if (!validateMimeType(mimetype)) {
    res.status(405).json({
      error: true,
      message: `Invalid file extension. Allowed extensions: PNG, JPG, JPEG`,
    })
    return
  }

  if (sizeInMB > 5) {
    res.status(405).json({
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

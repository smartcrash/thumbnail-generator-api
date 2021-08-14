const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const allowMimeTypes = ['image/jpeg', 'image/jpg', 'image/png']
const validateMimeType = (mimetype = '') => allowMimeTypes.includes(mimetype)

/**
 * @openapi
 * /generator:
 *   post:
 *     description: Generates a thumbnail from a source image
 *     responses:
 *       200:
 *         description: Returns converted image in varioures dimentions
 */
router.post('/', upload.single('image'), function (req, res, next) {
  const { file } = req
  const { mimetype, size: sizeInBytes } = file
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

  res.json({
    status: 200,
    error: '',
    message: 'No message available',
  })
})

module.exports = router

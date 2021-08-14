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
  const { mimetype } = file

  // If `file` is falsy means that all files were filtered out
  // by the `fileFilter` function, meaning that no valid file
  // was uploaded
  if (!validateMimeType(mimetype)) {
    res.status(400).json({
      status: 400,
      error: 'BadRequest',
      message: 'Invalid file extension',
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
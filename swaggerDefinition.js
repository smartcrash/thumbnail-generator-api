const { writeFileSync, write } = require('fs')
const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    swagger: '2.0',
    info: {
      title: 'Thumbnail Generator API',
      version: '1.0.0',
    },
  },
  apis: ['./routes/*.js'],
}

const openapiSpecification = swaggerJsdoc(options)
writeFileSync('./api-docs.json', JSON.stringify(openapiSpecification, null, 2))

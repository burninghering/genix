const swaggerUi = require("swagger-ui-express")
const swaggereJsdoc = require("swagger-jsdoc")

const options = {swaggerDefinition: {openapi: "3.0.0",
    info: {version: "1.0.0",
      title: "Genix",
      description:
        "Genix",},
    servers: [ {url: "https://192.168.0.232:3000", // 요청 URL
      }, ],},
  apis: [ "./routes/*.js" ], //Swagger 파일 연동
}
const specs = swaggereJsdoc(options)

module.exports = { swaggerUi, specs }
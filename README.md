# Simple API that generates thumbnails from a source image

## Requirements

- [x] **The API should provide at least 1 endpoint where the user will be able to POST the original image(\*)**
- [x] **The API only accept PNG and JPEG files(\*)**
- [x] **The API must reject input file bigger than 5mb(\*)**
- [x] **The API should give the user 3 new images with the following dimensions(\*)**
  - [x] **400x300(\*)**
  - [x] 160x120
  - [x] 120x120
- [x] It includes **Swagger** documentation
- [ ] It includes configuration files / scripts for deploying it on **AWS**
- [ ] It’s serverless! (**AWS Lambda + API Gateway**)
- [ ] It relies on **Serverless Framework**
- [x] It’s Dockerized for local development / testing
- [ ] It leverages cloud services (ie: AWS S3, SNS, SQS, etc…)
- [x] It’s asynchronic
- [x] It’s fast (<~500ms after upload finishes)
- [x] It includes testing with at least 70% coverage
- [ ] It has an auth implementation using Auth0
- [ ] It includes a configuration file / script to setup a CI/CD process on AWS
- [ ] It includes three different kinds of tests (unit, integration and performance)
  - [ ] Unit
  - [x] Integration
  - [ ] Performance

## Most of the requirements are optional except for those marked with (\*)

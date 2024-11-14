module.exports = {
  frontend: {
    hosting: {
      S3AndCloudFront: {
        buildCommand: 'npm run build',
        distributionDir: '.next',
        baseDirectory: '.next'
      }
    }
  }
}

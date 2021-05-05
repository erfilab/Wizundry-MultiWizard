module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  css: {
    loaderOptions: {
      scss: {
        additionalData: `@import "~@/variables.scss";`
      }
    }
  }
}

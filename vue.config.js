module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
  ? '/5c-niv-calculator/'
  : '/',
  "transpileDependencies": [
    "vuetify"
  ]
}
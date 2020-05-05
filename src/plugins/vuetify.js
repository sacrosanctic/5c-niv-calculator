import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

// https://vuetifyjs.com/en/customization/theme/
export default new Vuetify({
  // theme: {
  //   options: {
  //     themeCache: {
  //       get: key => localStorage.GetItem(key),
  //       set: (key, value) => localStorage.setItem(key, value),
  //     }
  //   },
  //   dark: true,
  //   themes: {
  //     dark: {
  //       primary: '#0081CF',
  //       secondary: '#63B5FF',
  //           tertiary:'',
  //       accent: '#DBF2FF',
  //       error: '#C6577F',
  //       info: '#E6F4F1',
  //       success: '#2B8982',
  //       warning: '#DEA01E',
  //       custom1: '#2196F3',
  //     }
  //   }
  // },
  icons: {
    iconfont: 'mdi',
  },
});

import '@mdi/font/css/materialdesignicons.css';
import { createApp } from 'vue';
import App from './App.vue';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import vuetify from './plugins/vuetify';
import { loadFonts } from './plugins/webfontloader'
import router from './router'

loadFonts()


Amplify.configure(awsExports);

createApp(App).use(router).use(vuetify).mount('#app');

import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const vuetify = createVuetify({
    theme: {
        defaultTheme: 'dark', // 👈 Set dark as default theme
        themes: {
            dark: {
                dark: true,
                colors: {
                    background: '#121212',
                    surface: '#1E1E1E',
                    primary: '#BB86FC',
                    secondary: '#03DAC6',
                    error: '#CF6679',
                },
            },
        },
    },
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: { mdi },
    },
})

export default vuetify

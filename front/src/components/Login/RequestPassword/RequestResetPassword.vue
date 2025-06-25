<template>
    <v-container class="d-flex justify-center align-center fill-height">
        <v-card width="400" class="pa-6">
            <v-card-title class="text-h5">Forgot Password</v-card-title>
            <v-card-text>
                <v-form @submit.prevent="requestCode">
                    <v-text-field
                        v-model="email"
                        label="Email"
                        type="email"
                        required
                        prepend-inner-icon="mdi-email"
                    />
                    <v-alert v-if="error" type="error" class="mt-2" dense>{{ error }}</v-alert>

                    <v-btn type="submit" color="primary" block :loading="loading" class="mt-4">
                         Next
                    </v-btn>
                </v-form>
            </v-card-text>

        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Auth } from 'aws-amplify';

const email = ref<string>('')
const loading= ref<boolean>(false)
const error = ref<string>('');

const router = useRouter();

const requestCode = async():Promise<void> => {
    error.value=''
    loading.value= true

    try{
        await Auth.forgotPassword(email.value)
        router.push({path: '/reset-password', query: { email: email.value }})

    } catch(err:any){
        error.value=err.message
    } finally{
        loading.value=false
    }
} 


</script>
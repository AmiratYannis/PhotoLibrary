<template>
    <v-container class="d-flex justify-center align-center fill-height">
        <v-card width="400" class="pa-6">
            <v-card-title class="text-h5">Reset Password</v-card-title>
            <v-card-text>
                <v-form @submit.prevent="resetPassword">
                    <v-text-field
                        v-model="code"
                        label="ConfirmationCode"
                        required
                        prepend-inner-icon="mdi-shield-key-outline"
                    />
                    <v-text-field
                        v-model="newPassword"
                        label="New Password"
                        type="password"
                        required
                        prepend-inner-icon="mdi-shield-key-reset"
                    />

                     <v-text-field
                        v-model="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        required
                        prepend-inner-icon="mdi-shield-key-check"
                    />

                    <v-alert v-if="error" type="error" class="mt-2" dense>{{ error }}</v-alert>
                    <v-alert v-if="success" type="success" class="mt-2" dense>{{ success }}</v-alert>

                    <v-btn type="submit" color="success" block :loading="loading" class="mt-4">
                        Reset Password
                    </v-btn>

                    <v-btn text block class="mt-2" @click="goToLogin">Back to Login</v-btn>

                </v-form>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Auth } from 'aws-amplify';

const route = useRoute();
const router = useRouter();

const email = ref<string>((route.query.email as string) || '');


const code = ref<string>('')
const newPassword = ref<string>('')
const confirmPassword = ref<string>('')
const success = ref<string>('')
const error = ref<string>('')
const loading = ref<boolean>(false)

const resetPassword = async(): Promise<void> => {
     if (newPassword.value !== confirmPassword.value) {
        error.value = 'Passwords do not match.';
        return;
    }

    loading.value=true
    error.value=''
    success.value=''

    try{
        await Auth.forgotPasswordSubmit(email.value,code.value,newPassword.value)
        success.value="Password has been reset."
        setTimeout(() => router.push('/'), 2000);

    }catch(err:any){
        error.value=err.message
    }finally{
        loading.value=false
    }
}

const goToLogin = ():void =>{
    router.push('/')
}

</script>
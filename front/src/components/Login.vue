<template>
    <v-container class="d-flex justify-center align-center fill-height">
        <v-card width="400" class="pa-6">
            <v-card-title class="text-h5">Login</v-card-title>

            <v-card-text>
                <v-form @submit.prevent="signIn">
                    <v-text-field v-model="email" label="Email" type="email" required prepend-inner-icon="mdi-email" />

                    <v-text-field v-model="password" label="Password" type="password" required
                        prepend-inner-icon="mdi-lock" />

                    <v-text-field v-if="showNewPasswordForm" v-model="newPassword" label="New Password" type="password" required prepend-inner-icon="mdi-lock-reset"/>

                    <v-text-field v-if="showNewPasswordForm" v-model="confirmPassword" label="Confirm Password" type="password" required prepend-inner-icon="mdi-lock-check"/>

                      <div class="text-right mb-2">
                        <v-btn text class="text-caption" @click="goToForgotPassword">Reset Password</v-btn>
                      </div>


                    <v-alert v-if="error" type="error" class="mt-2" dense>
                        {{ error }}
                    </v-alert>

                    <v-btn type="submit" color="primary" class="mt-4" block :loading="loading">
                        Login
                    </v-btn>
                </v-form>

                <v-btn text block class="mt-4" @click="goToSignup">
                    Create Account
                </v-btn>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { CognitoUser } from 'amazon-cognito-identity-js';

import { Auth} from 'aws-amplify';


const email = ref<string>('');
const password = ref<string>('');
const newPassword = ref<string>('');
const confirmPassword = ref<string>('');
const error = ref<string>('');
const loading = ref<boolean>(false);
const showNewPasswordForm = ref<boolean>(false);
const currentUser = ref<CognitoUser | null>(null);

const router = useRouter();

const emit = defineEmits<{
  (e: 'login-success'): void;
}>();



const signIn = async (): Promise<void> => {
  error.value = '';
  loading.value = true;

  try {
    const user = await Auth.signIn(email.value, password.value);

    if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
      currentUser.value = user;
      showNewPasswordForm.value = true;
      return;
    }

    emit('login-success');
    router.push('/home');
  } catch (err: any) {
    error.value = err.message || 'Login failed';
  } finally {
    loading.value = false;
  }
};

const goToSignup = (): void => {
  router.push('/signUp');
};

const goToForgotPassword = (): void => {
  router.push('/forgot-password');
};

   
</script>
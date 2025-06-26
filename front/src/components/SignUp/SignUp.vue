<template>
    <v-container class="d-flex justify-center align-center fill-height">
        <v-card width="400" class="pa-6">
            <v-card-title class="text-h5">Sign Up</v-card-title>

            <v-card-text>
                <v-form @submit.prevent="signUp">
                    <v-text-field v-model="email" label="Email" type="email" required prepend-inner-icon="mdi-email" />

                    <v-text-field v-model="password" label="Password" type="password" required
                        prepend-inner-icon="mdi-lock" />

                    <v-text-field v-model="confirmPassword" label="Confirm Password" type="password" required prepend-inner-icon="mdi-lock-check" />


                    <v-alert v-if="error" type="error" class="mt-2" dense>
                        {{ error }}
                    </v-alert>

                    <v-btn type="submit" color="primary" class="mt-4" block :loading="loading">
                        Sign up
                    </v-btn>
                </v-form>

                <div v-if="signUpComplete">
                <v-alert type="info" dense class="mb-4">
                    A confirmation code has been sent to your email.
                </v-alert>
                <v-text-field v-model="code" label="Confirmation Code" type="text" required/>
                <v-btn @click="confirmCode" color="success" block class="mt-2" :loading="loading">Confirm</v-btn>
                </div>
      </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Auth } from 'aws-amplify';
import { useRouter } from 'vue-router';
import axios from 'axios';

const emit = defineEmits<{
  (e: 'signup-complete'): void;
}>();

const router = useRouter();

const email = ref<string>('');
const password = ref<string>('');
const confirmPassword = ref<string>('');
const code = ref<string>('');

const error = ref<string>('');
const success = ref<string>('');
const loading = ref<boolean>(false);
const signUpComplete = ref<boolean>(false);

const signUp = async (): Promise<void> => {
  error.value = '';
  success.value = '';

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.';
    return;
  }

  loading.value = true;
  try {
    await Auth.signUp({
      username: email.value,
      password: password.value,
      attributes: { email: email.value },
    });
    signUpComplete.value = true;
    emit('signup-complete');
  } catch (err: any) {
    error.value = err.message || 'Signup failed.';
  } finally {
    loading.value = false;
  }
};

const confirmCode = async (): Promise<void> => {
  try {
    await Auth.confirmSignUp(email.value, code.value);

    const user= await Auth.signIn(email.value, password.value)

    console.log("user",user)

    

    axios.post('http://localhost:3000/api/users',{ userId: user.attributes.sub, email: user.attributes.email })
    .then((res)=>{
      console.log("User added ")
    })
    .catch((err)=>{
      console.log("User not existing")
    })



    success.value = 'Email confirmed! You can now log in.';
    router.push('/');
  } catch (err: any) {
    error.value = err.message || 'Confirmation failed.';
  }
};
</script>

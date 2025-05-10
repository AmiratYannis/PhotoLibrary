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

<script>
import { defineComponent, ref } from 'vue';
import { Auth } from 'aws-amplify';
import router from '@/router';

export default defineComponent({
  emits:['signup-complete'], 
  setup(props, { emit }) {   
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('')
    const code = ref('');

    const error = ref('');
    const success= ref('')
    const loading = ref(false);
    const signUpComplete = ref(false)

    const signUp = async () => {
      error.value = '';
      success.value = '';

      if (password.value !== confirmPassword.value) {
        console.log("password",password.value)
        console.log("confirmPassword", confirmPassword.value)
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

        signUpComplete.value=true


      } catch (err) {
        error.value = err.message || 'Signup failed.';
      } finally {
        loading.value = false;
      }
    };

    const confirmCode = async () => {
        try {
            await Auth.confirmSignUp(email.value, code.value);
            success.value = 'Email confirmed! You can now log in.';
            router.push('/');
        } catch (err) {
            error.value = err.message || 'Confirmation failed.';
        }
    };

    return { email, password,confirmPassword, code, success ,error, loading, signUp, confirmCode, signUpComplete };
  },
});
</script>
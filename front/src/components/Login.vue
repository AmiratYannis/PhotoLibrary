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

<script>
import { defineComponent, ref } from 'vue';
import { Auth } from 'aws-amplify';
import router from '@/router';


export default defineComponent({
  emits: ['login-success'], 
  setup(props, { emit }) {   
    const email = ref('');
    const password = ref('');
    const newPassword = ref('');
    const confirmPassword = ref('');
    const error = ref('');
    const loading = ref(false);
    const currentUser = ref(null)
    const showNewPasswordForm = ref(false)

    const signIn = async () => {
      error.value = '';
      loading.value = true;

      try {
        const user=await Auth.signIn(email.value, password.value);

        if(user.challengeName === 'NEW_PASSWORD_REQUIRED'){
          console.log("CHANGE PASSWORD")
          currentUser=user
          showNewPasswordForm=true
          return
        }

        emit('login-success'); 
        router.push('/home')
      } catch (err) {
        error.value = err.message || 'Login failed';
      } finally {
        loading.value = false;
      }
    };

    const goToSignup = () => {
      router.push('/signUp');
    };

    const changePassword = async() => {
      if(newPassword.value !== confirmPassword.value){
        error.value="Password doesn't match"
        return;
      }

      try{
        loading.value=true
        await Auth.completeNewPassword(currentUser.value, newPassword.value)
        emit('login-success')
        router.push('/home')
      }catch(err){
        error.value =err.message
      }finally{
        loading.value=false
      }

    };

    return { email, password, error, loading, signIn, goToSignup };
  },

  
});
</script>
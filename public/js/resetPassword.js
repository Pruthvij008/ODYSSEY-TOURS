/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const resetPassword = async (token, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/resetPassword/${token}`,
      data: {
        password,
        passwordConfirm
      }
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        'Please go to login page and enter token with password in reset password'
      );
      window.setTimeout(() => {
        location.assign('/login');
      }, 200);
    }
  } catch (err) {
    showAlert('error', err.response.data.message || 'Password reset failed.');
  }
};

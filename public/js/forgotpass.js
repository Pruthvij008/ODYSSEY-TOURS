/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const pass = async email => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/forgotPassword',
      data: {
        email
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
    showAlert('error', err.response.data.message);
  }
};

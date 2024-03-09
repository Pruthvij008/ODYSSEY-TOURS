/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const deleteUser = async userId => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/users/${userId}`
    });
    console.log(res.data); // Log the response from the server
    if (res.data.status === 'success') {
      // Use strict comparison operator (===) here
      window.setTimeout(() => {
        location.assign('/profile');
      }, 200);
    }
  } catch (err) {
    showAlert('error', err.response.data.message || 'Something went wrong.');
    console.error(err); // Log any errors occurred during deletion
  }
};

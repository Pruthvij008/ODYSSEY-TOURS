/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const updateUserRole = async (userId, newRole) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${userId}`,
      data: {
        role: newRole
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'User role updated successfully!');
      //   Optionally, you can reload the page or perform any other action after updating the user role
      window.location.reload();
    }
  } catch (err) {
    showAlert('error', err.response.data.message || 'Something went wrong.');
    console.error(err); // Log any errors occurred during updating the user role
  }
};

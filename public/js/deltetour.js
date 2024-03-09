/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const deleteTour = async tourId => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/tours/${tourId}`
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Tour deleted successfully!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message || 'Something went wrong.');
  } finally {
    // Ensure that the page is reloaded no matter what
    window.location.reload();
  }
};

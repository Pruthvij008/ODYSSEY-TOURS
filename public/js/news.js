// tourUpdateForm.js
/* eslint-disable */
import axios from 'axios';

export const submitForm = async (name, email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/news/',
      data: {
        name,
        email
      }
    });

    return res.data.status === 'success';
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
};

/* eslint-disable */
// import axios from 'axios';

// import { showAlert } from './alerts';

// export const sign = async (name, email, password, passwordConfirm) => {
//   try {
//     const res = await axios({
//       method: 'POST',
//       url: '/api/v1/users/signup',
//       data: {
//         name: name,
//         email,
//         password,
//         passwordConfirm
//       }
//     });
//     if (res.data.status === 'success') {
//       showAlert('success', 'signup sucessfull');
//       window.setTimeout(() => {
//         location.assign('/home');
//       }, 400);
//     }
//   } catch (err) {
//     showAlert('error', err.response.data.message);
//   }
// };

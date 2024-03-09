/* eslint-disable */
import '@babel/polyfill';

import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { sign } from './sign';
import { pass } from './forgotpass';
import { resetPassword } from './resetPassword';
import { deleteTour } from './deltetour'; // Import the deleteTour function
import { deleteUser } from './profile';
import { updateUserRole } from './updaterole';
import { submitForm } from './news';

// DOM ELEMENTS
const form = document.getElementById('tour-update-form');
const submitBtn = document.getElementById('submit-btn');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const forgotpass = document.querySelector('.form--pass');
const bookBtn = document.getElementById('book-tour');
const reset = document.getElementById('.form--res');

// DELEGATION
if (submitBtn) {
  // Add event listener only if the element exists
  submitBtn.addEventListener('click', async () => {
    const name = document.querySelector('#name-form02-2c').value;
    const email = document.querySelector('#email-form02-2c').value;

    const success = await submitForm(name, email);

    if (success) {
      alert('Thankyou! will let you know about the new tours ');
      form.reset();
    } else {
      alert('Failed to submit your data. Please try again later.');
    }
  });
} else {
  console.error('Error: Submit button not found.');
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('resetPasswordForm');

  if (form) {
    // Check if the form exists
    form.addEventListener('submit', async e => {
      e.preventDefault();

      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('passwordConfirm').value;

      const token = window.location.pathname.split('/').pop(); // Extract token from URL
      console.log(passwordConfirm);
      console.log(password);
      console.log(token);

      await resetPassword(token, password, passwordConfirm);
    });
  }
});

if (forgotpass) {
  forgotpass.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    pass(email);
  });
}

if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (signupForm) {
  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    sign(name, email, password, passwordConfirm);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm) {
  userDataForm.addEventListener('submit', async e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);

    // Check if a file is selected before appending it to the form data
    const photoInput = document.getElementById('photo');
    if (photoInput.files.length > 0) {
      form.append('photo', photoInput.files[0]);
    }

    // console.log(form);
    await updateSettings(form, 'data');
  });
}

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn)
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

// Call the deleteTour function when the delete buttons are clicked
document.querySelectorAll('.btn--red').forEach(btn => {
  btn.addEventListener('click', async () => {
    const tourId = btn.dataset.tourId;
    if (confirm('Are you sure you want to delete this tour?')) {
      await deleteTour(tourId);
    }
  });
});

document.querySelectorAll('.btn--del').forEach(btn => {
  btn.addEventListener('click', async () => {
    const userId = btn.dataset.userId;
    if (confirm('Are you sure you want to delete this user?')) {
      await deleteUser(userId);
    }
  });
});
document.querySelectorAll('.update-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const userId = btn.dataset.id;
    const newRole = btn.parentElement.querySelector('select').value;
    await updateUserRole(userId, newRole);
  });
});

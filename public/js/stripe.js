/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51OTizaSJfjO2zkeIkneUjXe5ZePjSJbk8dVOdygdNr6bceUNHHaPhaFMsUS8EZvUsNsD03uJKFSVeyqGG0gAPYET00IYD8z7S8'
);

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};

//stripe takes about 2.89 percent of the total amount that we have

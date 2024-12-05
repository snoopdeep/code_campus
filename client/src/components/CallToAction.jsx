// import { Button } from 'flowbite-react';

// export default function CallToAction() {
//   return (
//     <div className='flex flex-col sm:flex-row p-3 border border-teal-500 justify-center items-center rounded-tl-3xl rounded-br-3xl text-center'>
//         <div className="flex-1 justify-center flex flex-col">
//             <h2 className='text-2xl'>
//             Support CodeCampus
//             </h2>
//             <p className='text-black my-2'>
//             Your contributions help us maintain and improve the platform. If you found the interview experiences helpful, consider supporting us with a small donation.            </p>
//             <Button gradientDuoTone='purpleToPink' className='rounded-tl-xl rounded-bl-none'>
//                 <a href="https://www.100jsprojects.com" target='_blank' rel='noopener noreferrer'>
//                 Buy Me a Coffee
//                 </a>
//             </Button>
//         </div>
//         <div className="p-7 flex-1">
//             <img src="https://nocode.b-cdn.net/nocode/tools/Buy%20me%20a%20coffee-thumbnail-4.png" />
//         </div>
//     </div>
//   )
// }

import { Button } from 'flowbite-react';
import { useState } from 'react';

export default function CallToAction() {
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    setLoading(true);
    try {
      // Make an API request to create an order on the server
      const response = await fetch('/create-order', { method: 'POST' });
      const data = await response.json();

      // Razorpay options
      const options = {
        key: 'your_key_id', // Replace with your Razorpay key
        amount: data.amount, // Amount in paise
        currency: 'INR',
        order_id: data.order_id,
        name: 'CodeCampus Donation',
        description: 'Support CodeCampus and help us grow!',
        handler: function (response) {
          console.log('Payment successful', response);
          // Handle payment success, maybe notify the user or update the database
        },
        prefill: {
          name: 'Donor Name',
          email: 'donor@example.com',
        },
      };

      // Open Razorpay payment gateway
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error initiating donation', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col sm:flex-row p-3 border border-teal-500 justify-center items-center rounded-tl-3xl rounded-br-3xl text-center'>
      <div className="flex-1 justify-center flex flex-col">
        <h2 className='text-2xl'>
          Support CodeCampus
        </h2>
        <p className='text-black my-2'>
          Your contributions help us maintain and improve the platform. If you found the interview experiences helpful, consider supporting us with a small donation.
        </p>
        <Button 
          gradientDuoTone='purpleToPink' 
          className='rounded-tl-xl rounded-bl-none' 
          onClick={handleDonate} 
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Donate'}
        </Button>
      </div>
      <div className="p-7 flex-1">
        <img 
          src="https://nocode.b-cdn.net/nocode/tools/Buy%20me%20a%20coffee-thumbnail-4.png" 
          alt="Buy Me A Coffee"
        />
      </div>
    </div>
  );
}

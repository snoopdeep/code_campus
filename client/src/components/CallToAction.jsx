import { Button, TextInput } from "flowbite-react";
import { useState } from "react";

export default function CallToAction() {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");

  const handleDonate = async () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid donation amount");
      return;
    }

    setLoading(true);
    try {
      // Make an API request to create an order on the server
      const response = await fetch("http://localhost:3000/api/users/create-order", {
        method: "POST",
        credentials:"include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: Number(amount) * 100 }), // Convert INR to paise
      });
      console.log('this is calltoAction ',response);

      const data = await response.json();
      console.log('data is ::',data);
      // Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_API_KEY, // Replace with your Razorpay key
        amount: data.amount, // Amount in paise
        currency: "INR",
        order_id: data.order_id,
        name: "CodeCampus Donation",
        description: "Support CodeCampus and help us grow!",
        handler: function (response) {
          console.log("Payment successful", response);
          // Handle payment success, maybe notify the user or update the database
        },
        prefill: {
          name: "Donor Name",
          email: "donor@example.com",
        },
      };

      // Open Razorpay payment gateway
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error initiating donation", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row p-3 border border-teal-500 justify-center items-center rounded-tl-3xl rounded-br-3xl text-center">
      <div className="flex-1 justify-center flex flex-col">
        <h2 className="text-2xl">Support CodeCampus</h2>
        <p className="text-black my-2">
          Your contributions help us maintain and improve the platform. If you
          found the interview experiences helpful, consider supporting us with a
          small donation.
        </p>
        <TextInput
          type="number"
          placeholder="Enter donation amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mb-4"
        />
        <Button
          gradientDuoTone="purpleToPink"
          className="rounded-tl-xl rounded-bl-none"
          onClick={handleDonate}
          disabled={loading}
        >
          {loading ? "Processing..." : "Donate"}
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

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Alert } from "flowbite-react";
import { useNavigate } from "react-router-dom";

const FeedbackForm = () => {
  const [rating, setRating] = useState(0);
  const [contentRating, setContentRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const { currentUser } = useSelector((state) => state.user);
  const [successMessage, setSuccessMessage] = useState(null);
  const [failureMessage, setFailureMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setFailureMessage("Please login to give a feedback");
      return;
    }
    if (!rating || !contentRating || !feedback || !suggestions) {
      setFailureMessage("Please fill all the fields");
      return;
    }
    const formData = {
      user: currentUser,
      rating,
      contentRating,
      feedback,
      suggestions,
    };
    try {
      const response = await fetch("http://localhost:3000/api/users/feedback", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.status === "success") {
        setSuccessMessage("Thanks for submitting you valuable feedback.");
        // const timer =
        setTimeout(() => {
          navigate("/");
        }, 3000);
        // return () => clearTimeout(timer);
      } else {
        setFailureMessage("something went wrong!");
        return;
      }
    } catch (err) {
      console.log(err);
      setFailureMessage(err.message);
    }
  };
  console.log("current user", currentUser);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFailureMessage(null);
      setSuccessMessage(null);
    }, 3000);
    return () => clearTimeout(timer); // Cleanup on unmount or state change
  }, [failureMessage, successMessage]);

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">Feedback Form</h2>
      <form onSubmit={handleSubmit}>
        {/* Rating System */}
        <div className="mb-4">
          <label
            htmlFor="rating"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Rate your overall experience:
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className={`w-8 h-8 ${
                  rating >= star ? "text-yellow-500" : "text-gray-400"
                }`}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Text Feedback */}
        <div className="mb-4">
          <label
            htmlFor="feedback"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Additional Feedback:
          </label>
          <textarea
            id="feedback"
            rows="4"
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Your feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          ></textarea>
        </div>

        {/* Content Quality */}
        <div className="mb-4">
          <label
            htmlFor="contentRating"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            How would you rate the quality of content on CodeCampus?
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className={`w-8 h-8 ${
                  contentRating >= star ? "text-yellow-500" : "text-gray-400"
                }`}
                onClick={() => setContentRating(star)}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Suggestions for Improvement */}
        <div className="mb-6">
          <label
            htmlFor="suggestions"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Suggestions for Improvement:
          </label>
          <textarea
            id="suggestions"
            rows="4"
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="How can we improve CodeCampus?"
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
        >
          Submit Feedback
        </button>
      </form>
      {failureMessage && (
        <Alert className="mt-5" color={"failure"}>
          {failureMessage}
        </Alert>
      )}
      {successMessage && (
        <Alert className="mt-5" color={"success"}>
          {successMessage}
        </Alert>
      )}
    </div>
  );
};

export default FeedbackForm;

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Link } from "@inertiajs/react";

export default function ContactPage() {
  return (
    <div>
      {/* Blue Background */}
      <div className="absolute w-full h-[300px] bg-primary top-0 left-0 z-0" />
      <div className="text-yellow-900 fixed z-50 left-3 md:left-5 top-3 md:top-5">
        <Link href='/'>
          <FontAwesomeIcon icon={faArrowLeft} className="h-5 w-5 text-white" />
        </Link>
      </div>
      {/* Container */}
      <div className="relative z-10 flex justify-center px-6 sm:px-10 pt-10 pb-10">
        <form className="bg-white w-full max-w-3xl shadow-md rounded-lg px-6 py-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2">
            Contact Us
          </h2>
          <p className="text-gray-500 mb-10">
            If you want to contact us, please fill in the enquiry form and we will find the best person to support you. Please make sure to complete all fields
          </p>

          <div className="flex flex-wrap -mx-3 mb-6">
            {/* First Name */}
            <div className="w-full md:w-1/2 px-3 mb-6">
              <p className="text-left text-sm text-gray-500 mb-1">FIRST NAME</p>
              <input
                type="text"
                placeholder="Please enter first name..."
                className="w-full border-2 border-gray-200 rounded px-4 py-3 text-sm focus:outline-none"
              />
            </div>

            {/* Last Name */}
            <div className="w-full md:w-1/2 px-3 mb-6">
              <p className="text-left text-sm text-gray-500 mb-1">LAST NAME</p>
              <input
                type="text"
                placeholder="Please enter last name..."
                className="w-full border-2 border-gray-200 rounded px-4 py-3 text-sm focus:outline-none"
              />
            </div>

            {/* Email */}
            <div className="w-full md:w-1/2 px-3 mb-6">
              <p className="text-left text-sm text-gray-500 mb-1">EMAIL</p>
              <input
                type="email"
                placeholder="Please enter email..."
                className="w-full border-2 border-gray-200 rounded px-4 py-3 text-sm focus:outline-none"
              />
            </div>

            {/* Phone Number */}
            <div className="w-full md:w-1/2 px-3 mb-6">
              <p className="text-left text-sm text-gray-500 mb-1">PHONE NUMBER</p>
              <input
                type="text"
                placeholder="Please enter phone number..."
                className="w-full border-2 border-gray-200 rounded px-4 py-3 text-sm focus:outline-none"
              />
            </div>

            {/* Query Textarea */}
            <div className="w-full px-3 mb-6">
              <p className="text-left text-sm text-gray-500 mb-1">
                WHAT DO YOU HAVE IN MIND
              </p>
              <textarea
                placeholder="Please enter query..."
                className="w-full min-h-[150px] border-2 border-gray-200 rounded px-4 py-3 text-sm focus:outline-none"
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-50 text-white font-bold py-4 rounded text-lg transition-all duration-300"
          >
            Submit
          </button>

          {/* Social Media Icons */}
          <div className="mt-10 flex justify-center gap-6">
            <a href="#">
              <img
                src="https://workik-widget-assets.s3.amazonaws.com/Footer1-83/v1/images/Icon-twitter.png"
                alt="Twitter"
                className="w-8 h-8"
              />
            </a>
            <a href="#">
              <img
                src="https://workik-widget-assets.s3.amazonaws.com/Footer1-83/v1/images/Icon-facebook.png"
                alt="Facebook"
                className="w-8 h-8"
              />
            </a>
            <a href="#">
              <img
                src="https://workik-widget-assets.s3.amazonaws.com/Footer1-83/v1/images/Icon-google.png"
                alt="Google"
                className="w-8 h-8"
              />
            </a>
            <a href="#">
              <img
                src="https://workik-widget-assets.s3.amazonaws.com/Footer1-83/v1/images/Icon-instagram.png"
                alt="Instagram"
                className="w-8 h-8"
              />
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

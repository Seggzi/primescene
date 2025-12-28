import React from 'react';
import { CreditCard, User, ExternalLink } from 'lucide-react';

export default function Account() {
  return (
    <div className="min-h-screen bg-[#f3f3f3] text-[#333] font-sans">
      <div className="max-w-5xl mx-auto pt-24 px-4 pb-20">
        <h1 className="text-4xl mb-6">Account</h1>
        <hr className="border-gray-300 mb-4" />

        {/* Membership Section */}
        <div className="flex flex-col md:flex-row py-4">
          <div className="w-full md:w-1/3 mb-4 md:mb-0">
            <h2 className="text-gray-500 font-bold uppercase text-sm tracking-tighter">Membership & Billing</h2>
            <button className="mt-4 bg-[#e6e6e6] px-6 py-2 shadow-sm hover:bg-gray-200 transition text-sm font-semibold">
              Cancel Membership
            </button>
          </div>
          <div className="w-full md:w-2/3 space-y-3">
            <div className="flex justify-between font-bold">
              <span>user@primescene.com</span>
              <a href="#" className="text-blue-600 hover:underline text-sm">Change account email</a>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Password: ********</span>
              <a href="#" className="text-blue-600 hover:underline text-sm">Change password</a>
            </div>
            <div className="flex justify-between text-gray-500 border-b pb-4">
              <span>Phone: +234 812 345 6789</span>
              <a href="#" className="text-blue-600 hover:underline text-sm">Change phone number</a>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <span className="font-bold">•••• •••• •••• 4242</span>
              </div>
              <a href="#" className="text-blue-600 hover:underline text-sm">Manage payment info</a>
            </div>
          </div>
        </div>

        <hr className="border-gray-300 my-6" />

        {/* Plan Details */}
        <div className="flex flex-col md:flex-row py-4">
          <div className="w-full md:w-1/3">
            <h2 className="text-gray-500 font-bold uppercase text-sm tracking-tighter">Plan Details</h2>
          </div>
          <div className="w-full md:w-2/3 flex justify-between">
            <div><span className="font-bold">Premium</span> <span className="border border-black px-1 text-xs ml-2">Ultra HD</span></div>
            <a href="#" className="text-blue-600 hover:underline text-sm">Change plan</a>
          </div>
        </div>
      </div>
    </div>
  );
}
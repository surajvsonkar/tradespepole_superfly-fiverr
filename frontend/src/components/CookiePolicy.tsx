import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from './Footer';

const CookiePolicy = () => {
  return (
    <>
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/"
            className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Cookie Policy</h1>
          <p className="text-lg text-gray-600 mt-2">
            Last updated: January 2024
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="prose prose-gray max-w-none">
            
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What are cookies and local storage</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Cookies are small text files that get stored on your computer when you visit certain web pages. Local storage is an industry standard technology that allows us to store and retrieve small amounts of data on your computer, mobile phone or other device. At 247tradespeople.com we use cookies and local storage to remember you when you return to our site and to optimise your experience when landing on 247tradesPeople.com.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                To submit a job on 24/7TradesPeople.com you need to have cookies enabled. Most web browsers have cookies enabled by default, see Managing cookies for help to turn them on should you need to.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                Please note that cookies can't harm your computer. We don't store personally identifiable information such as credit card details in cookies we create, but we do use encrypted information gathered from them to help improve your experience of the 247TradesPeople.com site. For example, they help us to identify and resolve errors that may occur on the website.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                From time to time we may have relationships with carefully-selected and monitored partners who may set cookies during your visit to be used for remarketing purposes; this means to show you products and services that you appear to be interested in (see the 'third party cookie policy' section below). If you'd like to opt out, please go to the Network Advertising Initiative website (opens in a new window – please note that we're not responsible for the content of external websites).
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                We're giving you this information as part of our initiative to comply with recent legislation, and to make sure we're honest and clear about your privacy when using our website. We know you'd expect this from us, and please be assured that we're working on a number of other privacy and cookie-related improvements to the website.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Security</h2>
              <p className="text-gray-700 leading-relaxed">
                Our site uses the most advanced security software currently available for online transactions.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Our policy</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                To make full use of 24/7TradesPeople.com, your computer, tablet or mobile phone will need to accept cookies, as we can only provide you with certain personalised features of this website by using them.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                Our cookies don't store sensitive information such as your name, address or payment details: they simply hold the 'key' that, once you're signed in, is associated with this information. However, if you'd prefer to restrict, block or delete cookies from ratedpeople.com, or any other website, you can use your browser to do this. Each browser is different, so check the 'Help' menu of your particular browser (or your mobile phone's handset manual) to learn how to change your cookie preferences.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Third party cookie policy</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                When you visit 247tradespeople.com you may notice some cookies that aren't related to 24/7 TradesPeople. For example, if you go on to a web page that contains embedded content such as YouTube you may be sent cookies from these websites. We don't control the setting of these cookies, so we suggest you check the third-party websites for more information about their cookies and how to manage them.
              </p>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Some of the business partners that may set cookies on 247TradesPeople.com include:</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <ul className="space-y-3 text-gray-700">
                    <li>
                      <strong>criterio</strong> – see privacy policy
                    </li>
                    <li>
                      <strong>doubleclick.net</strong> – we use double click to track how well our advertising campaigns are performing
                    </li>
                    <li>
                      <strong>google-analytics.com, google.com, googleadservices.com, googleapis.com, gstatic.com</strong> – we use google analytics to measure traffic to our site. It also provides insights into the source of the traffic, so we can optimise our site for our customers
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Managing cookies, local storage and further information on cookies</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                If cookies aren't enabled on your computer, it will mean that you can't use the website.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Learn More About Cookies</h3>
                <p className="text-blue-700">
                  If you'd like to learn more about cookies in general and how to manage them, visit <strong>ICO.org</strong> (opens in a new window – please note that we can't be responsible for the content of external websites).
                </p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Questions or Comments</h3>
              <p className="text-green-700">
                If you have any questions about our Cookie Policy, please contact us via our online contact form or email us at <strong className="text-blue-600">info@247tradespeople.com</strong>.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default CookiePolicy;
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from './Footer';

const PrivacyPolicy = () => {
  return (
    <>
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/"
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="prose prose-gray max-w-none">
            <div className="mb-8">
              <p className="text-lg text-gray-700 leading-relaxed">
                Last updated: January 2024
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">What Personal Information About Users Do We Gather?</h2>
            <p className="text-gray-700 leading-relaxed mb-8">
              24/7 TradesPeople LTD ("we", "us", or "24/7TP") collects, uses and is responsible for certain personal information about you. When we do so we are regulated under the Data Protection Laws which include the Data Protection Act 1998 and any replacement legislation, and the General Data Protection Regulations (GDPR). The Data Protection Laws apply across the European Union (including in the United Kingdom) and we are responsible as 'controller' of that personal information for the purposes of those Laws. The information we gather about Users helps us personalise and continually improve your 24/7 TradesPeople experience. Some Users of our Website will also be Members. You are a Member if you register on our Website as a Client or a Trade Business. Here are the types of information we gather.
            </p>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Information You Give Us:</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We receive and store any information you enter on our Website or give us in any other way. By registering with 24/7 TRADESPEOPLE LTD as a Member via our Website, you choose to accept the practices described in this Privacy Notice. We use the information that you provide for such purposes as set out in here. Please note that it is possible to authorise another individual to operate and manage your account on your behalf. However, if you have such an arrangement in place, you still remain primarily responsible for the use of your account, and any liability that may arise in connection with that use, including for any and all payments due under it or claims brought against you in respect of that use.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Automatically Collected Information:</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We receive and store certain types of information whenever you interact with us. For example, like many websites, we use "cookies", and we obtain certain types of information when your Web browser accesses our Website or advertisements and other content served by or on behalf of 24/7 TRADESPEOPLE LTD on other websites.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Mobile/Tablet:</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you download or use apps created by us or on our behalf, we may receive information about your location and your mobile device, including a unique identifier for your device.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">E-mail Communications:</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                To help us make e-mails more useful and interesting, we often receive a confirmation when you open e-mails from us if your computer or device supports such capabilities. We also compare our customer list to lists received from other companies, in an effort to avoid sending unnecessary messages to our Users. If you do not want to receive e-mail or other mail from us, please adjust your Contact Preferences.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Facebook and other Social media platforms:</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may integrate your account with social media platforms including Facebook and Twitter. By doing so you authorise us to collect your information, such as your username, encrypted access credentials, and other information, that may be available on or through your social media account. Such information may include your name, profile picture, country, hometown, e-mail address, date of birth, gender, friends' names and profile pictures and networks. We may store this information and use it for the purposes explained in here and to verify your credentials with social media platforms.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Information From Other Sources:</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We might receive information about you from other sources and add it to our account information.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">What About Cookies?</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Cookies are unique identifiers that we transfer to your device to enable our systems to recognize your device and to provide product features, personalised advertisements on other websites, and to remember your requests for services (if you are a Client) or job lead purchases (if you are a Trade Business) between visits.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              The Help feature on most browsers will tell you how to prevent your browser from accepting new cookies, how to have the browser notify you when you receive a new cookie, or how to disable cookies altogether. Additionally, you can disable or delete similar data used by browser add-ons, such as Flash cookies, by changing the add-on's settings or visiting the website of its manufacturer. Since cookies will allow you to take advantage of some of the Website's product features, we recommend that you leave them turned on. For instance, if you block or otherwise reject our cookies, you may not be able to post requests for services or buy job leads, or use any of our online products and services that require you to sign in.
            </p>
            <p className="text-gray-700 leading-relaxed mb-8">Please read our cookies policy for more information.</p>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cookie Information Table</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Type of cookie</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">What it does</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">How to block</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Cookies necessary for essential website purposes</td>
                      <td className="border border-gray-300 px-4 py-2">These cookies are essential to provide you with services available through our Website and to use some of its features, such as access to secure areas. These cookies are necessary for us to supply you with certain online features like transactional pages and secure login accounts.</td>
                      <td className="border border-gray-300 px-4 py-2">You may disable any of these cookies via your browser settings. If you do so, various functions of the Website may be unavailable to you or may not work the way you want them to.</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">Functionality Cookies</td>
                      <td className="border border-gray-300 px-4 py-2">Functionality cookies record information about choices you've made and allow us to tailor the Website to you. These cookies mean that when you continue to use or come back to the Website, we can provide you with our services as you have asked for them to be provided.</td>
                      <td className="border border-gray-300 px-4 py-2">You may disable any of these cookies via your browser settings. If you do so, various functions of the Website may be unavailable to you or may not work the way you want them to.</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Advertising Cookies (Interest-Based Ads)</td>
                      <td className="border border-gray-300 px-4 py-2">24/7 TRADESPEOPLE LTD displays interest-based advertising on its Website and on unaffiliated websites, using information that you make available to us when visiting the Website.</td>
                      <td className="border border-gray-300 px-4 py-2">You may disable any of these cookies via your browser settings. If you do so, various functions of the Website may be unavailable to you or may not work the way you want them to.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Interest-Based Ads</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              In addition to using cookies and interest-based ads (as discussed above), we also use web beacons (also known as action tags or single-pixel gifs) and other technologies (collectively, "tracking technologies"). Tracking technologies enable us to learn about what ads you see, what ads you click, and other actions you take on our Website and on other websites. This allows us to provide you with more useful and relevant ads. For example, if we know what ads you are shown we can be careful not to show you the same ones repeatedly. We do not associate your interaction with unaffiliated websites with your identity in providing you with interest-based ads.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              In environments that do not support tracking technologies, like some mobile devices and applications, we may use other anonymous technologies for these purposes. To serve our ads in mobile applications we collect identifiers, such as Google Advertising ID or IDFA depending on the operating system of your mobile device. These identifiers consist in a string of anonymous and random characters singling out your device, that our partners may store using a non-reversible encrypting method.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">What About The Use Of Your Personal Information To Prevent Or Detect Fraud?</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              When you apply through the Website to register with us, we may check our own and the following records about you and your business partners:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>Those at fraud prevention agencies (FPAs);</li>
              <li>If you are a director, we will seek confirmation from credit reference agencies (CRAs) that the residential address that you provide is the same as that shown on the restricted register of directors' usual addresses at Companies House.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-8">
              We work with a third party (iOvation) for fraud detection and prevention purposes, and to improve the experience of our Users who do not pose a fraud risk. iOvation maintains a central database of devices and internet users that pose a fraud threat to businesses and others on the web.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Does 24/7 TRADESPEOPLE LTD Share The Information It Receives?</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Information about our Members is an important part of our business. We share Member information only as described below and with controls that either are subject to this Privacy Notice or follow practices at least as protective as those described in this Privacy Notice. We do not typically share personal information about Users who are not Members.
            </p>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">When You Post A Request for Services:</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We share Client information (full name, postcode, email address and phone number) with Trade Businesses that respond to a Client's request for services. Trade Businesses must comply with the Trade Business Code of Conduct concerning how they deal with Clients and use Client information.
              </p>
            </div>

            <h3>Payment Data:</h3>
            <p>
              We will collect and process payment and financial data when you sign up to our subscription service or use our payment service to pay for services sourced through our Website. This information will be stored by third party payment processors.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">How Secure Is The Information We Hold About You?</h2>
            <ul className="list-disc list-inside text-gray-700 mb-8 space-y-3">
              <li>We work to protect the security of your information during transmission by using Secure Sockets Layer (SSL) software, which encrypts information you input;</li>
              <li>We reveal only the last four digits of your credit card numbers when confirming any payment transaction;</li>
              <li>It is important for you to protect against unauthorized access to your password and to your computer. Be sure to sign off when you finish using a shared computer.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">What Choices Do I Have?</h2>
            <ul className="list-disc list-inside text-gray-700 mb-8 space-y-3">
              <li>As discussed above, you can always choose not to provide information, even though it might be required to take advantage of the Website's features;</li>
              <li>You can add or update certain information on the Website pages as mentioned in the 'What Information Can I Access' section;</li>
              <li>If you do not want to receive e-mail or other mail from us, please adjust your Marketing Preferences.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-6">Under the Data Protection Laws, you have a number of important rights free of charge. In summary, those include rights to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-8 space-y-3">
              <li>Access to your personal information and to certain other supplementary information</li>
              <li>Require us to correct any mistakes in your information which we hold</li>
              <li>Require the erasure of personal information concerning you in certain situations</li>
              <li>Receive the personal information concerning you which you have provided to us</li>
              <li>Object at any time to processing of personal information concerning you for direct marketing</li>
              <li>Object to decisions being taken by automated means which produce legal effects concerning you</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <p className="text-gray-700 leading-relaxed mb-4">
                If you would like to exercise any of those rights, please email: <strong className="text-blue-600">dataprotection@247tradespeople.com</strong>
              </p>
              <p className="text-gray-700 leading-relaxed mb-0">
                The Data Protection Officer, 24/7 TradesPeople Limited, company number 12851474 and our registered office is at Kemp House 160 City Road London EC1V 2NX.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Complain</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed">
                We hope that we can resolve any query or concern you raise about our use of your information. The Data Protection Laws also give you right to lodge a complaint with a supervisory authority. The supervisory authority in the UK is the Information Commissioner who may be contacted at <strong>ico.org.uk</strong> or telephone: <strong>0303 123 1113</strong>.
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

export default PrivacyPolicy;
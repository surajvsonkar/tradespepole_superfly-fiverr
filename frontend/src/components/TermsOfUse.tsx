import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from './Footer';

const TermsOfUse = () => {
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
          <h1 className="text-3xl font-bold text-gray-900">Terms of Use</h1>
          <p className="text-lg text-gray-600 mt-2">
            Last updated: January 2024
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="prose prose-gray max-w-none">
            
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Definitions</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                We are 24/7 TradesPeople LTD. Our registered company No.12851474 and our registered office is at Kemp House 128 City Road London EC1V 2NX. Where we refer to ourselves in this Agreement, this is also taken to include (where the context allows) our group companies, affiliates, and our and/or their employees, associated and contracted persons, and persons supplying services to us or them.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                You can contact us via our online contact form or <strong className="text-blue-600">info@247tradespeople.com</strong>.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Where we refer to you in these Terms of Use, this also includes any person that accesses or uses our Service on your behalf. The "Terms of Use" include the terms set out here and the Privacy Policy as made available via the internet and/or our "Apps" from time to time.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Our "Apps" are the 24/7 TradesPeople 'Find a Tradesman' and 'Find Work' applications and any other application that we release (each as modified and/or updated by us from time to time).
              </p>
              <p className="text-gray-700 leading-relaxed">
                The "Service" consists of the website currently located at www.247tradespeople.com, our Apps, any pages we operate on third party social media applications, and the content and services we make available through them via the internet, mobile devices including smart phones and tablets, and/or interactive television devices and services.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Content</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                The vast majority of the material on the Service originates from our users and we have little or no editorial control over the material. We therefore cannot guarantee the accuracy, timeliness, completeness, performance or fitness for any particular purpose of the material available through the Service.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                We cannot accept responsibility for errors, omissions, or inaccurate material available through the Service, and make no warranty that the Service will be uninterrupted or error free, or that any defects will be corrected.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Whilst we take steps to prevent misuse of our systems, we cannot warrant that the Service will be free of viruses or other malicious code and accept no liability for loss or damage caused from the transmission of such code. We recommend that you always use up-to-date firewalls and anti-virus software to protect your equipment and data.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                The ratings and other information found on the Service are provided by users, not by us. We do not endorse or recommend any particular third party service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Any material you obtain from the Service is used at your own risk, and we will not be liable for any loss or damage arising out of or in connection with access or use of the Service (except to the extent that such liability cannot be excluded by law).
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Links and User Content</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                It is not possible for us to review all websites which are linked from the Service (or link to the Service), and you should therefore take care when following any link. We cannot accept liability for any loss or damage that may be suffered as a result of following any links.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                The Service contains discussion forums, bulletin board services, chat areas, communities and/or other message or communication facilities (collectively "Communities"). Although our hope is that all users will use the Service responsibly, and we require all users to ensure that all content that they post on the Service is lawful, we are not responsible for reviewing or policing user content and so it is possible that Communities may carry offensive, harmful, inaccurate or otherwise inappropriate material, or in some cases, postings that have been mislabelled or are otherwise deceptive.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                We urge you to exercise proper judgement and to use caution and common sense when using Communities. We do not control the information delivered to the Communities, and have no obligation to monitor the Communities. You are responsible for your own communications and for any consequences arising out of them.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                The Communities are intended to allow users to send and receive messages and material that are legal, proper and related to the particular Community, and you agree that you shall use them only for this purpose. We do not guarantee the truthfulness, accuracy, or reliability of any communications posted in the Communities or endorse any opinions expressed in the Communities.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                You should take all due care in relying on material Posted in the Communities, as this is done at your own risk. It is important for you to note that all Communities are public, and that others may read communications made via the Community without the author's knowledge.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Always use caution when giving out any personally identifying information about yourself in any Community, and do not give personally identifying information about any other person unless entitled to do so.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Use of Information</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                You agree not to copy, reproduce, modify, create derivative works from, distribute or publicly display any content (except for your own information) from the Service without our prior written permission.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You consent to information about the device you use to access the Service being collected and processed for fraud prevention purposes and we may use third parties (and information they provide) to help us prevent fraud or unauthorised access to our Service.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Intellectual Property Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                You acknowledge that all present and future copyright and other intellectual property rights subsisting in, or used in connection with, the Service or any part of it (the "Rights"), including the manner in which the Service is presented or appears and all information and documentation relating to it is our property (or that of our licensors), and nothing in these Terms of Use shall be taken to transfer any of the Rights to you.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Solely for the purposes of receiving the Service, we hereby grant to you for the period during which the Service is provided a non-exclusive, non-transferable, licence to use the Rights.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Notwithstanding any other provision, nothing in these Terms of Use shall exclude or limit either party's liability for death or personal injury caused by that party's negligence, fraud or fraudulent misrepresentation, or any other liability that cannot lawfully be excluded or limited.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                If you are dissatisfied with the Service or any of these Terms of Use, your sole remedy under these Terms of Use shall be to discontinue use of the Service. Without limiting the foregoing, we shall have no liability for any failure or delay resulting from any matter beyond our reasonable control.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Other than as set out in this Limitation of Liability section, and notwithstanding any other provision of these Terms of Use, we shall not be liable in contract, tort, negligence, statutory duty, misrepresentation or otherwise, for any loss or damage whatsoever arising from or in any way connected with these Terms of Use.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Save as expressly set out herein, all conditions, warranties and obligations which may be implied or incorporated into these Terms of Use by statute, common law, or otherwise and any liabilities arising from them are hereby expressly excluded to the extent permitted by law.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                We shall not be liable for any loss of business, loss of profits, business interruption, loss of business information, loss of data, or any other pecuniary loss (even where we have been advised of the possibility of such loss or damage).
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                In the event that any limitation or exclusion of liability in these Terms of Use proves ineffective, then we shall not be liable to you for more than £100 in aggregate. If you register on the website or any Apps, then only the aggregate cap on liability under the agreement which you enter into upon registration shall apply.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                If you register as both a "Homeowner" and as a "Trade Business" then only the aggregate cap in the Trade Business User Agreement shall apply.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                We cannot guarantee the day or time that we will respond to any email, telephone or written enquiries or Website form submissions.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Each of the provisions of this Clause shall be construed separately and independently of the others.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                We reserve the right at all times to edit, refuse to post, or to remove from the Service any information or materials for any reason whatsoever, and to disclose any information we deem appropriate to satisfy any applicable law, regulation, legal process, police request or governmental request.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                We reserve the right to restrict your access to the Service at any time without notice for any reason whatsoever. Without prejudice to the generality of the above, we reserve the right to restrict your access to the Service at any time without notice in the event that we suspect you to be in material breach of any term of these Terms of Use.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                We reserve the right to modify or discontinue temporarily or permanently all or part of the Service with or without notice without liability for any modification or discontinuance.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We may vary these Terms of Use from time to time and shall post such alterations on the Service.
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">General</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Clause headings are inserted for convenience only and shall not affect the interpretation of these Terms of Use. If any provisions hereof are held to be illegal or unenforceable such provisions shall be severed and the remainder of these Terms of Use shall remain in full force and effect unless the business purpose of these Terms of Use is substantially frustrated, in which case they shall terminate without giving rise to further liability.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                You may not assign, transfer or sub-contract any of your rights hereunder without our prior written consent. We may assign, transfer or sub-contract all or any of our rights at any time without consent.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                No waiver shall be effective unless in writing, and no waiver shall constitute a continuing waiver so as to prevent us from acting upon any continuing or subsequent breach or default.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                These Terms of Use constitute the entire agreement as to its subject matter and supersedes and extinguishes all previous communications, representations (other than fraudulent misrepresentations) and arrangements, whether written or oral with the exception of the Homeowner User Agreement and/or Trade Business User Agreement where these have been entered into.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Order of Precedence</h3>
                <p className="text-blue-700 mb-3">
                  To the extent that there is any conflict between agreements, they shall apply in the following order of precedence:
                </p>
                <ol className="list-decimal list-inside text-blue-700 space-y-2">
                  <li>the Trade Business User Agreement;</li>
                  <li>the Homeowner User Agreement; then</li>
                  <li>these Terms of Use.</li>
                </ol>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">
                You acknowledge that you have placed no reliance on any representation made but not set out expressly in these Terms of Use.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Any notice to be given under these Terms of Use may be given via e-mail, regular mail, facsimile or by hand to the address provided on the Website or otherwise as notified by one party to the other.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Nothing herein shall create or be deemed to create any joint venture, principal-agent or partnership relationship between the parties and neither party shall hold itself out in its advertising or otherwise in any manner which would indicate or imply any such relationship with the other.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Notwithstanding any other provision in these Terms of Use a person who is not a party hereto has no right under the Contracts (Rights of Third Parties) Act 1999 to rely upon or enforce these Terms of Use.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                These Terms of Use shall be subject to the laws of England and the parties shall submit to the exclusive jurisdiction of the English courts.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Questions or Comments</h3>
                <p className="text-green-700">
                  In the event of any comments or questions regarding these Terms of Use (including the Privacy Policy), please <strong>Contact Us</strong> via our online contact form or email us at <strong className="text-blue-600">info@247tradespeople.com</strong>.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default TermsOfUse;
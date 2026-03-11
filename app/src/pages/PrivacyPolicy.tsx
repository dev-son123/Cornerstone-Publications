import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
                <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="space-y-8 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us when using Cornerstone Research Service and Publications. This includes:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>Personal Information:</strong> Name, email address, phone number, and institution details when you register for an account.</li>
                            <li><strong>Document Data:</strong> Manuscripts, abstracts, and any instructions or files you upload for our services.</li>
                            <li><strong>Payment Information:</strong> Transaction details when purchasing services (processed securely via third-party providers).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
                        <p>We use the collected information for the following purposes:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>To provide, maintain, and improve our editing and publishing services.</li>
                            <li>To communicate with you regarding your submissions, account status, and support inquiries.</li>
                            <li>To process payments and generate invoices.</li>
                            <li>To send you administrative messages, technical notices, and security alerts.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Document Security and Confidentiality</h2>
                        <p>
                            Your research is your intellectual property. We employ industry-standard security measures, including 256-bit SSL encryption, to protect your data during transmission and rest. Your documents are only accessible to the specifically assigned administrative staff and editors who have signed strict Non-Disclosure Agreements (NDAs).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Information Sharing</h2>
                        <p>
                            We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>With trusted service providers (like payment processors and hosting services) necessary to operate our business, under strict confidentiality agreements.</li>
                            <li>To comply with legal obligations or respond to lawful requests from public authorities.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Data Rights</h2>
                        <p>
                            Depending on your location, you may have rights under the GDPR or other privacy laws to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>Access the personal data we hold about you.</li>
                            <li>Request correction of inaccurate data.</li>
                            <li>Request deletion of your data (Right to be Forgotten).</li>
                            <li>Opt-out of marketing communications at any time.</li>
                        </ul>
                        <p className="mt-2">To exercise these rights, please contact us using the information below.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Retention</h2>
                        <p>
                            We retain your active documents only for as long as necessary to complete your requested services and provide subsequent support, unless you delete them from your dashboard. Basic account information is retained for administrative and tax purposes.
                        </p>
                    </section>

                    <section className="pt-6 border-t border-gray-100">
                        <p>If you have any privacy-related questions or concerns, please contact our Data Protection Officer at privacy@cornerstone-research.com</p>
                    </section>
                </div>
            </div>
        </div>
    );
}

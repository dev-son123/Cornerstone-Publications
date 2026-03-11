import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
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

                <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
                <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="space-y-8 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using Cornerstone Research Service and Publications ("we", "our", or "us"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Services</h2>
                        <p>
                            We provide academic publishing support services, including but not limited to manuscript preparation, language editing, grammar & proofreading, thesis literature review, and plagiarism detection. All services are subject to the specific scope and timeline agreed upon at the time of purchase.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Responsibilities & Rights</h2>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>You must be the original author or have the explicit right to submit the document for editing.</li>
                            <li>You agree to provide accurate and complete information when registering an account.</li>
                            <li>You retain full copyright and ownership of all materials submitted to us.</li>
                            <li>You are responsible for the academic integrity of your work; our services do not constitute academic fraud or ghostwriting.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Confidentiality</h2>
                        <p>
                            We treat all submitted manuscripts and personal information with strict confidentiality. Your documents will not be shared with third parties, published, or distributed without your explicit written consent. All our editors operate under strict Non-Disclosure Agreements (NDAs).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Payment and Refunds</h2>
                        <p>
                            Payments for services must be made in full before the commencement of work, unless otherwise agreed. Due to the nature of our services, refunds are generally not provided once work has begun. If you are dissatisfied with our service, please contact us to discuss revisions within the scope of your selected plan.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Limitation of Liability</h2>
                        <p>
                            While we strive for the highest quality, we do not guarantee that our editing services will result in the acceptance of your manuscript by any specific journal or publication. Our liability is limited to the amount paid for the specific service rendered.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Modifications to Terms</h2>
                        <p>
                            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to this page. Your continued use of the service signifies your acceptance of the updated terms.
                        </p>
                    </section>

                    <section className="pt-6 border-t border-gray-100">
                        <p>If you have any questions about these Terms, please contact us at support@cornerstone-research.com</p>
                    </section>
                </div>
            </div>
        </div>
    );
}

import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
            <p><strong>Effective Date:</strong> May 18th 2024</p>

            <h2 className="text-xl font-semibold mt-6">1. Introduction</h2>
            <p className="">
                Welcome to We Code ("we", "our", "us"). We are committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your information when you use our website
                <a href="https://wecode.dacubeking.com"
                   className="text-blue-500"> https://wecode.dacubeking.com</a> ("We Code"). Please read this policy
                carefully. If you do not agree with the terms of this Privacy Policy, please do not access We Code.
            </p>

            <h2 className="text-xl font-semibold mt-6">2. Information We Collect</h2>
            <h3 className="text-lg font-semibold mt-4">A. GitHub Authentication:</h3>
            <ul className="list-disc list-inside">
                <li>We use GitHub for authentication.</li>
                <li>Upon logging in, we collect your GitHub ID, name, and username. This information is used to identify
                    and display your profile on We Code.
                </li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">B. User Content:</h3>
            <ul className="list-disc list-inside">
                <li>When you write code for byte-sized coding problems on We Code, your code and test case results are
                    stored locally on your browser's local storage.
                </li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 ">C. API Requests:</h3>
            <ul className="list-disc list-inside">
                <li>If you use the "I'm stuck" feature, the code and test cases you submit are sent to our API. We use
                    this information to call OpenAI or Google Vertex APIs for assistance from an AI tutor.
                </li>
                <li>We also log your user ID and a timestamp for rate-limiting purposes. No other information is saved
                    server-side.
                </li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">D. Cloudflare Analytics:</h3>
            <ul className="list-disc list-inside">
                <li>Our website is proxied through Cloudflare, which collects analytics data. This includes cookies
                    placed by Cloudflare for security and performance purposes. We do not use any other cookies.
                </li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">3. How We Use Your Information</h2>
            <h3 className="text-lg font-semibold mt-4">A. To Provide and Improve Our Services:</h3>
            <ul className="list-disc list-inside">
                <li>Displaying your profile information.</li>
                <li>Storing your code and test case results in local storage for your convenience.</li>
                <li>Providing AI-driven assistance when you're stuck.</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">B. Security and Analytics:</h3>
            <ul className="list-disc list-inside">
                <li>Enhancing the security and performance of We Code through Cloudflare.</li>
                <li>Using Cloudflare analytics to understand Site usage and improve our services.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">4. Disclosure of Your Information</h2>
            <p className="">We do not sell, trade, or otherwise transfer your personally identifiable information to
                outside parties except as described below:</p>
            <ul className="list-disc list-inside">
                <li><strong>Service Providers:</strong> We may share your information with third-party vendors (such as
                    OpenAI and Google Vertex) to perform tasks on our behalf, such as providing AI tutoring services.
                </li>
                <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or
                    in response to valid requests by public authorities.
                </li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">5. Data Security</h2>
            <p className="">
                We use administrative, technical, and physical security measures to protect your personal information.
                However, no transmission over the Internet or electronic storage is completely secure, so we cannot
                guarantee its absolute security.
            </p>

            <h2 className="text-xl font-semibold mt-6">6. Your Choices</h2>
            <h3 className="text-lg font-semibold mt-4">A. Local Storage:</h3>
            <ul className="list-disc list-inside">
                <li>You can clear your browser's local storage at any time to delete your code history and test case
                    results.
                </li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">B. Cookies:</h3>
            <ul className="list-disc list-inside">
                <li>As we rely on Cloudflare, you can manage Cloudflare's cookies through your browser settings.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">7. Changes to This Privacy Policy</h2>
            <p className="">
                We may update this Privacy Policy from time to time. We will notify you of any changes by updating the
                "Effective Date" at the top of this Privacy Policy. You are advised to review this Privacy Policy
                periodically for any changes.
            </p>

            <h2 className="text-xl font-semibold mt-6">8. Contact Us</h2>
            <p>
                If you have any questions about this Privacy Policy, please contact us at
                <a href="mailto:contact@dacubeking.com" className="text-blue-500"> contact@dacubeking.com</a>.
            </p>
        </div>
    );
};

export default PrivacyPolicy;

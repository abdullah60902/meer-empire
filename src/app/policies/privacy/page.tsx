import styles from '../Policy.module.css';

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.desc}>How we collect, use, and protect your personal data.</p>
        </div>
      </div>

      <div className="container">
        <div className={styles.content}>
          <h2>1. Introduction</h2>
          <p>At MEER EMPIRE, we value your privacy and are committed to protecting your personal information. This policy outlines how we collect, use, and safeguard the data you provide when interacting with our website.</p>

          <h2>2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li><strong>Personal Information:</strong> Name, email address, phone number, shipping and billing addresses provided during checkout or account registration.</li>
            <li><strong>Payment Information:</strong> Secure payment details processed through our encrypted third-party payment gateways. We do not store your credit card numbers.</li>
            <li><strong>Usage Data:</strong> Information about how you navigate and interact with our website, collected through cookies and similar technologies.</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use your data to:</p>
          <ul>
            <li>Process and fulfill your orders, including sending order confirmations and tracking updates.</li>
            <li>Communicate with you regarding customer support inquiries, returns, and exchanges.</li>
            <li>Send promotional emails and newsletters (only if you have opted in).</li>
            <li>Improve our website functionality, layout, and product offerings based on user behavior.</li>
            <li>Prevent fraud and ensure the security of our platform.</li>
          </ul>

          <h2>4. Data Sharing & Security</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share necessary data with trusted service providers (such as courier companies and payment processors) strictly for the purpose of fulfilling your order.</p>
          <p>Our website uses industry-standard SSL encryption to ensure that your data is transmitted securely.</p>

          <h2>5. Your Rights</h2>
          <p>You have the right to request access to the personal data we hold about you and to ask for it to be corrected or deleted. If you wish to exercise these rights, please contact our support team.</p>

          <div className={styles.alert}>
            <p>Updates to this Policy: We reserve the right to update this Privacy Policy at any time. Any changes will be posted on this page with an updated revision date.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import styles from '../Policy.module.css';

export default function TermsPolicyPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Terms & Conditions</h1>
          <p className={styles.desc}>The rules and regulations for the use of our website.</p>
        </div>
      </div>

      <div className="container">
        <div className={styles.content}>
          <h2>1. Agreement to Terms</h2>
          <p>By accessing and using the MEER EMPIRE website, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access or use our services.</p>

          <h2>2. Products and Pricing</h2>
          <p>We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the site. However, we do not guarantee that the colors, features, specifications, and details will be accurate, complete, reliable, current, or free of other errors.</p>
          <p>All prices are in Pakistani Rupees (PKR) and are subject to change without notice. We reserve the right to modify or discontinue a product at any time.</p>

          <h2>3. Order Acceptance and Cancellation</h2>
          <p>We reserve the right to refuse or cancel any order for any reason, including limitations on quantities available for purchase, inaccuracies, or errors in product or pricing information, or problems identified by our credit and fraud avoidance department.</p>
          <p>If your order is canceled after your credit card (or other payment method) has been charged, we will issue a credit to your account in the amount of the charge.</p>

          <div className={styles.alert}>
            <p>For Cash On Delivery (COD) orders, the mandatory Rs. 250 advance delivery charge is non-refundable if the customer refuses to accept the parcel at the time of delivery.</p>
          </div>

          <h2>4. Intellectual Property</h2>
          <p>The Site and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by MEER EMPIRE, its licensors, or other providers of such material and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>

          <h2>5. Limitation of Liability</h2>
          <p>In no event will MEER EMPIRE, its directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages.</p>
        </div>
      </div>
    </div>
  );
}

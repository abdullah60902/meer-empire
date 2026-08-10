import styles from '../Policy.module.css';

export default function ReturnPolicyPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Return & Exchange Policy</h1>
          <p className={styles.desc}>Please read our policies carefully before making a purchase.</p>
        </div>
      </div>

      <div className="container">
        <div className={styles.content}>
          <h2>1. Overview</h2>
          <p>At MEER EMPIRE, we strive to ensure you are completely satisfied with your purchase. Since we deal in premium imported footwear, we have a strict quality control process. However, if there is a genuine issue with your order, we are here to help.</p>

          <div className={styles.alert}>
            <p>CRITICAL REQUIREMENT: An unboxing video is MANDATORY for all return and exchange claims. No claims will be entertained without a clear, uncut unboxing video showing the shipping label and the defect/issue.</p>
          </div>

          <h2>2. Conditions for Return/Exchange</h2>
          <ul>
            <li>The item must be unused, unwashed, and in the exact condition you received it.</li>
            <li>All original packaging, tags, and accessories must be intact.</li>
            <li>Claims must be made within 3 days of receiving the order.</li>
            <li>Exchanges are subject to size availability.</li>
          </ul>

          <h2>3. What is NOT Covered?</h2>
          <ul>
            <li>Minor color variations due to screen displays or photography lighting.</li>
            <li>Slight size variations (we recommend checking our size guide before ordering).</li>
            <li>Damage caused by the customer due to mishandling or improper use.</li>
            <li>Items bought on sale or clearance are final sale and cannot be returned or exchanged.</li>
          </ul>

          <h2>4. Process for Exchange</h2>
          <p>To initiate an exchange:</p>
          <ol>
            <li>Contact our support team via WhatsApp at +92 300 1234567.</li>
            <li>Provide your Order ID and the uncut unboxing video clearly showing the issue.</li>
            <li>Once approved by our team, we will guide you on how to send the item back to us.</li>
            <li>The customer is responsible for the return shipping costs unless the wrong item was sent by us.</li>
          </ol>

          <h2>5. Refunds</h2>
          <p>We do not offer cash refunds. In case a suitable exchange size is not available, a store credit (coupon code) of equal value will be issued, which you can use for future purchases on our website.</p>
        </div>
      </div>
    </div>
  );
}

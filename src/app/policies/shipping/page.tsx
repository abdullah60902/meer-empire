import styles from '../Policy.module.css';

export default function ShippingPolicyPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Shipping Policy</h1>
          <p className={styles.desc}>Information regarding delivery times and shipping methods.</p>
        </div>
      </div>

      <div className="container">
        <div className={styles.content}>
          <h2>1. Processing Time</h2>
          <p>All orders are processed within 1 to 2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.</p>
          <p>Please note that during peak sale seasons or holidays, processing times may be slightly delayed.</p>

          <h2>2. Delivery Time & Costs</h2>
          <p>We deliver nationwide across Pakistan using premium courier services.</p>
          <ul>
            <li><strong>Standard Delivery:</strong> 2 to 5 business days.</li>
            <li><strong>Shipping Charges:</strong> Free delivery on all orders above Rs. 10,000. For orders below this amount, standard shipping rates apply at checkout.</li>
          </ul>

          <div className={styles.alert}>
            <p>Cash On Delivery (COD) Notice: For all COD orders, an advance payment of Rs. 250 is required to confirm the order and cover the initial shipping cost. The remaining balance will be collected at the time of delivery.</p>
          </div>

          <h2>3. Order Tracking</h2>
          <p>Once your order has shipped, you will receive an email and WhatsApp message with your tracking number and a link to track your package on the courier's website. Please allow up to 24 hours for the tracking portal to update.</p>

          <h2>4. Delayed Deliveries</h2>
          <p>While we strive to ensure timely delivery, external factors such as severe weather, political unrest, or courier logistical issues may occasionally cause delays. MEER EMPIRE is not liable for delays caused by the courier service, but our support team will assist you in tracking and escalating the issue with them.</p>

          <h2>5. Damaged or Lost Packages</h2>
          <p>If your package arrives damaged or is lost in transit, please contact us immediately within 24 hours of the expected delivery date. Remember to record a clear unboxing video as proof of receiving a damaged package.</p>
        </div>
      </div>
    </div>
  );
}

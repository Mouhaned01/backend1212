const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS   
  }
});

const sendAdminNotification = async (bookingData) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'nasrimohanned48@gmail.com',
    subject: '🚨 New Car Booking Created!',
    html: `
      <h2>New Booking Details</h2>
      <p><strong>Client:</strong> ${bookingData.clientName || 'N/A'}</p>
      <p><strong>Phone:</strong> ${bookingData.clientPhone || 'N/A'}</p>
      <p><strong>Car:</strong> ${bookingData.carName || 'N/A'}</p>
      <p><strong>Start Date:</strong> ${bookingData.startDate}</p>
      <p><strong>End Date:</strong> ${bookingData.endDate}</p>
      <p><strong>Total Price:</strong> ${bookingData.totalPrice || 'N/A'} TND</p>
      <br>
      <p>Please check the admin dashboard to manage this booking.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Notification email sent to admin successfully.');
  } catch (error) {
    console.error('Failed to send admin email notification:', error);
  }
};

module.exports = { sendAdminNotification };
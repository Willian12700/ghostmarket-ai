import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle newlines in private key securely
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin Init Error:', error);
  }
}

const db = admin.firestore();

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = req.body;
    console.log('Webhook received:', payload);

    // Verify Cakto webhook logic here (e.g. signature verification)
    // For now, we extract the email from the payload payload.customer.email or similar
    const customerEmail = payload?.customer?.email || payload?.email;
    const status = payload?.status || payload?.transaction?.status;

    if (!customerEmail) {
      return res.status(400).json({ error: 'Email not found in payload' });
    }

    // Only allow approved transactions
    if (status === 'approved' || status === 'paid') {
      // Create a record in Firestore allowing this user to register
      await db.collection('allowed_users').doc(customerEmail).set({
        email: customerEmail,
        status: 'approved',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        used: false,
      });

      return res.status(200).json({ success: true, message: 'User allowed' });
    }

    return res.status(200).json({ success: true, message: 'Ignored non-approved status' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

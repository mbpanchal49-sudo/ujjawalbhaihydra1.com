export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'Webhook Active' });
  }

  try {
    const update = req.body;
    const requestData = update.chat_join_request || update.chat_member;

    if (requestData) {
      const user = requestData.from || requestData.new_chat_member?.user;
      const userId = user?.id || 'Unknown';
      const firstName = user?.first_name || 'User';
      const username = user?.username ? `@${user.username}` : 'N/A';
      const timestamp = new Date().toISOString();

      // 1. Send to Meta CAPI
      const pixelId = "8877169399"; 
      const accessToken = "YOUR_META_ACCESS_TOKEN"; // Client ka Access Token yahan daalna

      fetch(`https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [{
            event_name: 'Lead',
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'system_generated',
            user_data: { external_id: [String(userId)] }
          }]
        })
      }).catch(err => console.error('CAPI Error:', err));

      // 2. Direct Write to Client's Firestore
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/hydra-dashboard-ujjawall/databases/(default)/documents/leads`;
      
      await fetch(firestoreUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            userId: { stringValue: String(userId) },
            name: { stringValue: firstName },
            username: { stringValue: username },
            date: { stringValue: new Date().toLocaleDateString('en-IN') },
            time: { stringValue: new Date().toLocaleTimeString('en-IN') },
            timestamp: { stringValue: timestamp }
          }
        })
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(200).json({ error: error.message });
  }
}

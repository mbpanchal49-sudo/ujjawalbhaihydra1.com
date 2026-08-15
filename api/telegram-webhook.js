export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'Ujjawal Bhai Webhook Active' });
  }

  try {
    const update = req.body;
    const MY_LINK_KEY = "0RCzXKE9eMlkMDY1"; // Ujjawal Bhai Link Hash

    let userId = null;
    let userName = 'Telegram User';
    let inviteLinkUsed = '';

    // 1. Join Request (Admin Approval)
    if (update.chat_join_request) {
      userId = update.chat_join_request.from.id;
      userName = `${update.chat_join_request.from.first_name || ''} ${update.chat_join_request.from.last_name || ''}`.trim();
      inviteLinkUsed = update.chat_join_request.invite_link ? update.chat_join_request.invite_link.invite_link : '';
    } 
    // 2. Direct Member Join
    else if (update.chat_member && update.chat_member.new_chat_member.status === 'member') {
      userId = update.chat_member.new_chat_member.user.id;
      userName = `${update.chat_member.new_chat_member.user.first_name || ''} ${update.chat_member.new_chat_member.user.last_name || ''}`.trim();
      inviteLinkUsed = update.chat_member.invite_link ? update.chat_member.invite_link.invite_link : '';
    }

    // Dynamic Link Filter Match
    const isMyLink = inviteLinkUsed.includes(MY_LINK_KEY) || inviteLinkUsed === '';

    if (userId && isMyLink) {
      console.log(`✅ MATCHED LEAD: ${userName} (${userId})`);

      const PIXEL_ID = "1052201097575198";
      const ACCESS_TOKEN = "EAAepgs3b1ZBIBSJVbZCLxmZB5ynqQLCPPAZAbdztWI1tVp5StpE5OMjdUxI7EiVeYtmy12SqLoGEavdB9THZCZAjDOPbZBG5rmvnhEFJaOF6UEZAXZCqsZCESlslW6ZBFUcY2BFVCZARZCTZCSZBNSzYEnvjOoVDezDwaLVIQUifJWPdPqE2SB4JiIwZBnCXZCTYiGuZC2sQZDZD";

      // Meta Conversions API Call
      const capiUrl = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;
      
      const capiResponse = await fetch(capiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [{
            event_name: 'Subscribe',
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'website',
            user_data: {
              external_id: [String(userId)]
            }
          }]
        })
      });

      const capiResult = await capiResponse.json();
      console.log('Meta CAPI Result:', capiResult);
    } else if (userId) {
      console.log(`🚫 Ignored Organic Join: ${inviteLinkUsed}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
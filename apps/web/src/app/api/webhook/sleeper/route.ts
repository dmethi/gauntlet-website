import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Sleeper webhook payload structure
    const { type, league_id, week, transaction_id } = body;

    console.log(`Received Sleeper webhook: ${type} for league ${league_id}`);

    // Handle different webhook types
    switch (type) {
      case 'transaction':
        // Someone made a trade, pickup, drop
        console.log(`Transaction ${transaction_id} in league ${league_id}`);
        // Trigger league data refresh
        break;

      case 'waiver':
        // Waiver processed
        console.log(`Waiver processed in league ${league_id}`);
        break;

      case 'trade':
        // Trade processed
        console.log(`Trade processed in league ${league_id}`);
        break;

      default:
        console.log(`Unknown webhook type: ${type}`);
    }

    // You could trigger immediate data refresh here
    // Or just acknowledge and let scheduled updates handle it

    return NextResponse.json({
      success: true,
      message: 'Webhook received',
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }
}

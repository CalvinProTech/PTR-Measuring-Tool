import { NextResponse } from "next/server";

const SALESFORCE_INSTANCE_URL = process.env.SALESFORCE_INSTANCE_URL;
const SALESFORCE_ACCESS_TOKEN = process.env.SALESFORCE_ACCESS_TOKEN;

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    console.log("Kixie webhook received:", JSON.stringify(payload, null, 2));

    // Forward to Salesforce REST API
    if (SALESFORCE_INSTANCE_URL && SALESFORCE_ACCESS_TOKEN) {
      const sfResponse = await fetch(
        `${SALESFORCE_INSTANCE_URL}/services/apexrest/kixie/webhook`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SALESFORCE_ACCESS_TOKEN}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const sfResult = await sfResponse.json();
      console.log("Salesforce response:", sfResult);

      return NextResponse.json({
        success: true,
        salesforce: sfResult,
      });
    }

    // If Salesforce not configured, just acknowledge
    return NextResponse.json({
      success: true,
      message: "Webhook received (Salesforce forwarding not configured)",
      payload,
    });
  } catch (error) {
    console.error("Kixie webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

// Also handle GET for webhook verification
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Kixie webhook endpoint is active",
  });
}

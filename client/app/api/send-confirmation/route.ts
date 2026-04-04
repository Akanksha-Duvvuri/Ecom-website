import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  const { email, name, orderId, items, total, shipping } = await req.json();

  const itemRows = items.map((item: any) => `
    <tr>
      <td style="padding: 8px 0; color: #aaa; font-size: 13px;">${item.name} × ${item.quantity}</td>
      <td style="padding: 8px 0; color: #fff; font-size: 13px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join("");

  try {
    await resend.emails.send({
      from: "TurNext <onboarding@resend.dev>",
      to: email,
      subject: `Order confirmed — #${orderId.slice(-6).toUpperCase()}`,
      html: `
        <div style="background:#0f0f0f; padding: 40px 24px; font-family: sans-serif; max-width: 560px; margin: 0 auto;">
          
          <p style="font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 32px;">
            TurNext <span style="color:#555;">›_</span>
          </p>

          <h1 style="font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 8px;">Order confirmed!</h1>
          <p style="font-size: 14px; color: #555; margin-bottom: 32px;">
            Hey ${name}, thanks for your order. We've received it and it's being processed.
          </p>

          <div style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="font-size: 11px; color: #555; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 16px;">
              Order #${orderId.slice(-6).toUpperCase()}
            </p>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemRows}
              <tr><td colspan="2" style="padding: 12px 0 0;"><hr style="border: none; border-top: 1px solid #2a2a2a;" /></td></tr>
              <tr>
                <td style="padding: 12px 0 0; color: #fff; font-size: 15px; font-weight: 600;">Total</td>
                <td style="padding: 12px 0 0; color: #fff; font-size: 15px; font-weight: 600; text-align: right;">$${total.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
            <p style="font-size: 11px; color: #555; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px;">Shipping to</p>
            <p style="font-size: 13px; color: #aaa; line-height: 1.6; margin: 0;">
              ${shipping.firstName} ${shipping.lastName}<br/>
              ${shipping.address}<br/>
              ${shipping.city}, ${shipping.zip}<br/>
              ${shipping.country}
            </p>
          </div>

          <p style="font-size: 12px; color: #333; text-align: center;">
            You can view your order history in your profile at any time.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
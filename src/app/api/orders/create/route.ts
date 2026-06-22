import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Helper function to send order confirmation alerts to business owners
async function sendOrderEmailAlert(email: string, ownerName: string, businessName: string, order: any) {
    const itemsHtml = order.items.map((item: any) => `
        <tr style="border-bottom: 1px solid #2d2d30;">
            <td style="padding: 12px; font-weight: bold; color: #fff;">${item.name}</td>
            <td style="padding: 12px; text-align: center; color: #a5b4fc;">x${item.quantity}</td>
            <td style="padding: 12px; text-align: right; color: #f59e0b; font-weight: bold;">$${Number(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Order Alert - Oasis United</title>
</head>
<body style="background-color: #0a0a0b; color: #ffffff; font-family: system-ui, -apple-system, sans-serif; padding: 40px; margin: 0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #0f0f12; border: 1px solid #1f1f23; border-radius: 24px; padding: 40px; box-shadow: 0 20px 80px rgba(0,0,0,0.6);">
        <div style="text-align: center; margin-bottom: 30px;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: -1px; font-style: italic; color: #ffffff;">OASIS<span style="color: #4f46e5;">UNITED.</span></span>
            <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 4px; color: #4f46e5; margin-top: 5px;">Node Dispatch Notification</div>
        </div>

        <div style="border-top: 2px solid #4f46e5; padding-top: 30px; margin-bottom: 30px;">
            <h2 style="font-size: 24px; font-weight: 900; font-style: italic; margin: 0 0 10px 0; text-transform: uppercase; color: #fff;">New Order Established!</h2>
            <p style="color: #a1a1aa; font-size: 14px; margin: 0; line-height: 1.6;">Hello ${ownerName}, a new purchase transaction has been recorded on your storefront node <strong>${businessName}</strong>.</p>
        </div>

        <div style="background-color: #121216; border: 1px solid #27272a; border-radius: 16px; padding: 24px; margin-bottom: 30px;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid #2d2d30; font-size: 10px; font-weight: bold; text-transform: uppercase; color: #71717a;">
                        <th style="text-align: left; padding-bottom: 10px; color: #71717a;">Item Description</th>
                        <th style="text-align: center; padding-bottom: 10px; color: #71717a;">Qty</th>
                        <th style="text-align: right; padding-bottom: 10px; color: #71717a;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            <div style="margin-top: 20px; border-top: 1px dashed #2d2d30; padding-top: 15px; display: flex; justify-content: space-between; align-items: baseline;">
                <span style="font-weight: 900; font-size: 14px; color: #fff; text-transform: uppercase;">Grand Settlement</span>
                <span style="font-size: 28px; font-weight: 900; color: #f59e0b; font-style: italic;">$${Number(order.total).toFixed(2)}</span>
            </div>
        </div>

        <div style="margin-bottom: 30px; font-size: 13px; line-height: 1.6; color: #a1a1aa;">
            <div style="font-weight: bold; text-transform: uppercase; font-size: 10px; color: #4f46e5; margin-bottom: 6px;">Delivery Details</div>
            <div><strong>Recipient:</strong> ${order.customer_name}</div>
            <div><strong>Contact:</strong> ${order.customer_contact}</div>
            <div><strong>Fulfillment Type:</strong> ${order.type}</div>
            ${order.address ? `<div><strong>Coordinates:</strong> ${order.address}</div>` : ''}
        </div>

        <div style="text-align: center; border-top: 1px solid #1f1f23; padding-top: 30px;">
            <a href="https://unitedoasis.net/dashboard" style="display: inline-block; padding: 14px 28px; background-color: #4f46e5; color: #fff; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Open Merchant Command Center</a>
        </div>
    </div>
</body>
</html>
    `;

    // 1. Log locally to src/outbox/emails so developers can preview
    try {
        const outboxDir = path.join(process.cwd(), 'src', 'outbox', 'emails');
        if (!fs.existsSync(outboxDir)) {
            fs.mkdirSync(outboxDir, { recursive: true });
        }
        const filePath = path.join(outboxDir, `order_${order.id}.html`);
        fs.writeFileSync(filePath, htmlContent);
        console.log(`[Email Mock Logged] Written to file://${filePath.replace(/\\/g, '/')}`);
    } catch (fsErr) {
        console.error('Failed to write local outbox email:', fsErr);
    }

    // 2. Transmit via SMTP Nodemailer if credentials are set
    try {
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            const nodemailer = eval('require')('nodemailer');
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            await transporter.sendMail({
                from: '"Oasis United Node Alert" <alerts@unitedoasis.net>',
                to: email,
                subject: `🌌 [Oasis United] New Order Established! (#${order.id.slice(0, 5)})`,
                html: htmlContent
            });
            console.log(`[SMTP Mailer] Sent email successfully to ${email}`);
        } else {
            console.log(`[SMTP Mailer Stub] SMTP environment credentials missing. Notification simulated.`);
        }
    } catch (smtpErr) {
        console.error('SMTP email transmission failed:', smtpErr);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { businessId, customerName, customerContact, items, total, type, address, scheduledFor } = body;

        if (!businessId || !total || !items) {
            return NextResponse.json({ error: 'Missing required order details' }, { status: 400 });
        }

        // Logistics Engine: Mock Distance Calculation (0-40 miles)
        const mockDistance = Math.floor(Math.random() * 400) / 10;

        // Insert into Supabase Orders table
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                business_id: businessId,
                customer_name: customerName,
                customer_contact: customerContact,
                items: items,
                total: total,
                type: type,
                address: address,
                status: 'pending',
                channel: 'web',
                delivery_status: 'pending',
                distance_miles: mockDistance,
                scheduled_for: scheduledFor || null
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Inventory Engine: Atomic Stock Decrement
        for (const item of items) {
            const { error: stockError } = await supabase.rpc('decrement_stock', {
                p_product_id: item.id,
                p_quantity: item.quantity
            });

            if (stockError) {
                console.error(`Stock Error for ${item.id}:`, stockError);
                throw new Error(`Insufficient stock for ${item.name}`);
            }
        }

        // 3. Loyalty Integration: Accrue Points (10 pts per $1)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const isEco = true; // Simulating user choice
            const ecoBonus = isEco ? 200 : 0;
            const pointsToEarn = Math.floor(Number(total) * 10) + ecoBonus;

            // Get or Create Loyalty Account
            const { data: account } = await supabase
                .from('loyalty_accounts')
                .select('points, lifetime_points')
                .eq('user_id', user.id)
                .single();

            if (account) {
                await supabase
                    .from('loyalty_accounts')
                    .update({
                        points: account.points + pointsToEarn,
                        lifetime_points: account.lifetime_points + pointsToEarn,
                        updated_at: new Date()
                    })
                    .eq('user_id', user.id);
            } else {
                await supabase
                    .from('loyalty_accounts')
                    .insert({
                        user_id: user.id,
                        points: pointsToEarn,
                        lifetime_points: pointsToEarn,
                        tier: 'Silver'
                    });
            }
        }

        // 4. Alert & Email System: Dispatch notifications to business owner
        try {
            const { data: business } = await supabase
                .from('businesses')
                .select('owner_id, name')
                .eq('id', businessId)
                .single();

            if (business && process.env.SUPABASE_SERVICE_ROLE_KEY) {
                const supabaseAdmin = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                );
                
                const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(business.owner_id);
                
                if (!userErr && userData?.user) {
                    const ownerEmail = userData.user.email || 'owner@unitedoasis.net';
                    const ownerName = userData.user.user_metadata?.full_name || 'Business Owner';
                    await sendOrderEmailAlert(ownerEmail, ownerName, business.name, order);
                }
            }
        } catch (alertErr) {
            console.error('Owner notification dispatcher error:', alertErr);
        }

        return NextResponse.json({ success: true, order: order }, { status: 201 });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

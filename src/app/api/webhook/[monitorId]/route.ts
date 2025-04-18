import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import forwardToWebhook from '@/lib/utils/forwardToWebhook';

// ✅ Verificação do Webhook (GET)
export async function GET(req: NextRequest, { params }: { params: { monitorId: string } }) {
    const monitorId = params.monitorId;
    const searchParams = req.nextUrl.searchParams;

    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (!mode || !token || !challenge) {
        return NextResponse.json({ success: false, error: "Invalid verification request" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: monitor, error } = await supabase
        .from('monitors')
        .select('webhook_token')
        .eq('id', monitorId)
        .single();

    if (error || !monitor) {
        return NextResponse.json({ success: false, error: "Monitor not found" }, { status: 404 });
    }

    if (mode === "subscribe" && token === monitor.webhook_token) {
        return new Response(challenge, { status: 200 });
    }

    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 403 });
}

// ✅ Recebimento e Processamento do Webhook (POST)
export async function POST(req: NextRequest, { params }: { params: { monitorId: string } }) {
    const monitorId = params.monitorId;
    const supabase = await createClient();

    try {
        // ✅ Buscar monitor e verificar `webhook_token`
        const { data: monitor, error: monitorError } = await supabase
            .from('monitors')
            .select('id, account_name, platform, webhook_send, access_token, project_id')
            .eq('id', monitorId)
            .single();

        if (monitorError || !monitor) {
            return NextResponse.json({ success: false, error: 'Monitor not found' }, { status: 404 });
        }

        // ✅ Processar os dados recebidos
        const body = await req.json();

        console.log(`📩 Webhook recebido para Monitor ${monitorId}:`, body);

        // ✅ Criar payload final com dados do monitor
        const payload = {
            monitorId,
            account_name: monitor.account_name,
            platform: monitor.platform,
            access_token: monitor.access_token,
            projectId: monitor.project_id,
            received_at: new Date().toISOString(),
            data: body, // Dados recebidos no webhook
        };

        if (monitor.webhook_send) {
            await forwardToWebhook(monitor.webhook_send, payload);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('❌ Erro no Webhook API:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

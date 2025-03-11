import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 🔧 Função auxiliar para encaminhar os dados ao webhook_send
async function forwardToWebhook(webhookUrl: string, payload: object) {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error('❌ Erro ao encaminhar dados ao webhook_send:', await response.text());
        }
    } catch (error) {
        console.error('❌ Erro ao enviar para webhook_send:', error);
    }
}

// ✅ API para receber webhooks e encaminhar os dados
export async function POST(req: NextRequest, { params }: { params: { monitorId: string } }) {
    const supabase = await createClient();
    const monitorId = params.monitorId;

    try {
        const body = await req.json();
        console.log(`📩 Webhook recebido para Monitor ${monitorId}:`, body);

        // ✅ Buscar detalhes do monitor
        const { data: monitor, error: monitorError } = await supabase
            .from('monitors')
            .select('id, account_name, platform, webhook_send')
            .eq('id', monitorId)
            .single();

        if (monitorError || !monitor) {
            return NextResponse.json({ success: false, error: 'Monitor not found' }, { status: 404 });
        }

        // ✅ Criar payload final com dados do monitor
        const payload = {
            monitorId,
            account_name: monitor.account_name,
            platform: monitor.platform,
            received_at: new Date().toISOString(),
            data: body, // Dados recebidos no webhook
        };

        // ✅ Encaminhar para webhook_send
        if (monitor.webhook_send) {
            await forwardToWebhook(monitor.webhook_send, payload);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('❌ Erro no Webhook API:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

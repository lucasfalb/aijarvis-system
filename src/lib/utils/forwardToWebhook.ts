// 🔧 Encaminhar os dados ao webhook_send
export default async function forwardToWebhook(webhookUrl: string, payload: object) {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Webhook responded with status ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error('❌ Erro ao enviar para webhook_send:', error);
        throw error;
    }
}
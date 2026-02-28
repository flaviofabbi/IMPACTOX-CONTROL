
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

/**
 * Cloud Function que roda diariamente para verificar vencimentos
 * e enviar alertas via WhatsApp.
 */
exports.verificarVencimentosDiario = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const db = admin.firestore();
    const hoje = new Date();
    
    // Calcula a data de daqui a 5 dias
    const dataAlvo = new Date();
    dataAlvo.setDate(hoje.getDate() + 5);
    const dataAlvoStr = dataAlvo.toISOString().split('T')[0];

    console.log(`Iniciando verificação para data de término: ${dataAlvoStr}`);

    try {
      // Busca pontos de captação que vencem em 5 dias e ainda não foram notificados
      const snapshot = await db.collection('capitacoes')
        .where('dataTermino', '==', dataAlvoStr)
        .where('status', '==', 'ativo')
        .get();

      if (snapshot.empty) {
        console.log('Nenhum ponto de captação vencendo em 5 dias encontrado.');
        return null;
      }

      const promessas = [];
      const numerosDestino = ['+5511989590038', '+5511994489140'];

      for (const doc of snapshot.docs) {
        const ponto = doc.data();
        
        // Verifica se já foi enviado (segurança extra caso o filtro do firestore falhe ou não exista o campo)
        if (ponto.aviso5DiasEnviado) continue;

        const mensagem = `⚠️ Alerta de vencimento\nO ponto de captação ${ponto.nome} vence em ${ponto.dataTermino}.\nFaltam 5 dias para o término do contrato.\nVerifique no aplicativo.`;

        // Envia para cada número fixo
        for (const numero of numerosDestino) {
          promessas.push(enviarWhatsApp(numero, mensagem));
        }

        // Marca como enviado no banco
        promessas.push(doc.ref.update({ aviso5DiasEnviado: true }));
      }

      await Promise.all(promessas);
      console.log(`${snapshot.size} pontos processados e alertas enviados.`);
    } catch (error) {
      console.error('Erro ao processar vencimentos:', error);
    }

    return null;
  });

/**
 * Função auxiliar para envio de WhatsApp via API (Exemplo genérico)
 * Nota: Requer integração com um provedor de API de WhatsApp (Z-API, Twilio, etc)
 */
async function enviarWhatsApp(numero, mensagem) {
  // Exemplo usando uma API genérica (substitua pelos seus dados reais de provedor)
  // const API_URL = 'https://api.provedor.com/send-message';
  // const API_KEY = 'SUA_CHAVE_AQUI';
  
  console.log(`Simulando envio de WhatsApp para ${numero}: ${mensagem}`);
  
  // Implementação real dependeria do provedor escolhido:
  /*
  try {
    await axios.post(API_URL, {
      phone: numero,
      message: mensagem
    }, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
  } catch (e) {
    console.error(`Falha ao enviar para ${numero}`, e);
  }
  */
  return Promise.resolve();
}

import baileys from '@whiskeysockets/baileys';
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    downloadMediaMessage,
    fetchLatestBaileysVersion
} = baileys;
import pino from 'pino';
import express from 'express';
import axios from 'axios';
import qrcode from 'qrcode-terminal';

const app = express();
app.use(express.json());

// ===================== CONFIG (variáveis de ambiente) =====================
const GOOGLE_VISION_KEY  = process.env.GOOGLE_VISION_KEY;
const FIREBASE_API_KEY   = process.env.FIREBASE_API_KEY;
const FIREBASE_PROJECT   = process.env.FIREBASE_PROJECT_ID || 'rufo-gestao';
const PORT               = process.env.PORT || 3000;

// ===================== FIRESTORE REST API =====================
const FS_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents`;
const FS_KEY  = `?key=${FIREBASE_API_KEY}`;

// Converte objeto JS → campos do Firestore
function encodeFields(obj) {
    const fields = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v === null || v === undefined) fields[k] = { nullValue: null };
        else if (typeof v === 'boolean')   fields[k] = { booleanValue: v };
        else if (typeof v === 'number')    fields[k] = { doubleValue: v };
        else                               fields[k] = { stringValue: String(v) };
    }
    return fields;
}

// Converte campos do Firestore → objeto JS
function decodeFields(fields) {
    if (!fields) return {};
    const obj = {};
    for (const [k, v] of Object.entries(fields)) {
        if (v.stringValue  !== undefined) obj[k] = v.stringValue;
        else if (v.doubleValue  !== undefined) obj[k] = v.doubleValue;
        else if (v.integerValue !== undefined) obj[k] = parseInt(v.integerValue);
        else if (v.booleanValue !== undefined) obj[k] = v.booleanValue;
        else obj[k] = null;
    }
    return obj;
}

// Busca documentos com filtro simples
async function firestoreQuery(colecao, campo, valor) {
    try {
        const res = await axios.post(`${FS_BASE}:runQuery${FS_KEY}`, {
            structuredQuery: {
                from: [{ collectionId: colecao }],
                where: {
                    fieldFilter: {
                        field: { fieldPath: campo },
                        op: 'EQUAL',
                        value: { stringValue: valor }
                    }
                }
            }
        });
        return res.data
            .filter(r => r.document)
            .map(r => ({
                id: r.document.name.split('/').pop(),
                ...decodeFields(r.document.fields)
            }));
    } catch (e) {
        console.error('Firestore query error:', e.response?.data || e.message);
        return [];
    }
}

// Adiciona documento novo
async function firestoreAdd(colecao, dados) {
    try {
        const res = await axios.post(`${FS_BASE}/${colecao}${FS_KEY}`, {
            fields: encodeFields(dados)
        });
        return res.data.name.split('/').pop();
    } catch (e) {
        console.error('Firestore add error:', e.response?.data || e.message);
        return null;
    }
}

// ===================== OCR - GOOGLE VISION =====================
async function extrairDadosBoleto(imagemBase64) {
    try {
        const res = await axios.post(
            `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_KEY}`,
            {
                requests: [{
                    image: { content: imagemBase64 },
                    features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
                }]
            }
        );

        const texto = res.data.responses[0]?.fullTextAnnotation?.text || '';
        console.log('--- OCR RAW TEXT ---\n', texto.slice(0, 500));

        return parsearTextoBoleto(texto);
    } catch (e) {
        console.error('Vision API error:', e.response?.data || e.message);
        return null;
    }
}

// Extrai valor, vencimento e descrição do texto bruto do OCR
function parsearTextoBoleto(texto) {
    const resultado = {
        valor: null,
        vencimento: null,
        descricao: null,
        textoCompleto: texto
    };

    // ── VALOR ──────────────────────────────────────────────────
    // Padrões: R$ 1.250,00 | Valor: 1250.00 | = 1.250,00
    const regexValor = [
        /R\$\s*([\d.,]+)/i,
        /[Vv]alor[:\s]+R?\$?\s*([\d.,]+)/i,
        /[Vv]alor\s+[Cc]obra[^\d]*([\d.,]+)/i,
        /=\s*R?\$?\s*([\d.,]+)/,
        /(?:TOTAL|Total)[:\s]+R?\$?\s*([\d.,]+)/i
    ];
    for (const r of regexValor) {
        const m = texto.match(r);
        if (m) {
            const raw = m[1].replace(/\./g, '').replace(',', '.');
            const num = parseFloat(raw);
            if (!isNaN(num) && num > 0) { resultado.valor = num; break; }
        }
    }

    // ── VENCIMENTO ─────────────────────────────────────────────
    // Padrões: 20/02/2026 | 2026-02-20
    const regexVenc = [
        /[Vv]encimento[:\s]+(\d{2}\/\d{2}\/\d{4})/,
        /[Vv]enc[:\.\s]+(\d{2}\/\d{2}\/\d{4})/,
        /(\d{2}\/\d{2}\/\d{4})/
    ];
    for (const r of regexVenc) {
        const m = texto.match(r);
        if (m) {
            const [d, mo, a] = m[1].split('/');
            resultado.vencimento = `${a}-${mo}-${d}`; // formato ISO para o Firebase
            break;
        }
    }

    // ── DESCRIÇÃO ──────────────────────────────────────────────
    // Tenta pegar Beneficiário ou Cedente ou Sacado
    const regexDesc = [
        /[Bb]enefici[áa]rio[:\s]+([^\n]+)/,
        /[Cc]edente[:\s]+([^\n]+)/,
        /[Pp]agador[:\s]+([^\n]+)/,
        /[Ee]mpresa[:\s]+([^\n]+)/
    ];
    for (const r of regexDesc) {
        const m = texto.match(r);
        if (m && m[1].trim().length > 2) {
            resultado.descricao = m[1].trim().slice(0, 80);
            break;
        }
    }
    // Se não achou, usa as primeiras palavras significativas
    if (!resultado.descricao) {
        const linhas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 5);
        resultado.descricao = linhas[0]?.slice(0, 60) || 'Boleto via WhatsApp';
    }

    return resultado;
}

// ===================== NORMALIZAR TELEFONE =====================
// WhatsApp envia como "5562997026547@s.whatsapp.net"
// No Firebase pode estar salvo como "(62) 99702-6547", "62997026547", etc.
function normalizarTelefone(jid) {
    return jid.replace('@s.whatsapp.net', '').replace('@c.us', '').replace(/\D/g, '');
}

function telefoneBate(telefoneSalvo, numeroWpp) {
    const s = String(telefoneSalvo || '').replace(/\D/g, '');
    // Compara últimos 11 dígitos (sem o DDI 55)
    const sufixo = numeroWpp.slice(-11);
    return s.endsWith(sufixo) || s === numeroWpp;
}

// ===================== FORMATAR DATA BR =====================
function fmtDataBR(isoDate) {
    if (!isoDate) return 'não identificado';
    const [a, m, d] = isoDate.split('-');
    return `${d}/${m}/${a}`;
}

function fmtMoney(v) {
    if (!v) return 'R$ ?';
    return `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

// Competência atual no formato YYYY-MM
function competenciaAtual() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function agora() {
    const d = new Date();
    return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

// ===================== SESSÕES PENDENTES =====================
// Guarda boletos aguardando confirmação: { jid: { dados, empresaId, empresaNome } }
const pendentes = new Map();

// ===================== PROCESSAR MENSAGEM =====================
async function processarMensagem(sock, msg) {
    const jid    = msg.key.remoteJid;
    const numero = normalizarTelefone(jid);

    // ── Mensagem de texto (comandos) ──────────────────────────
    if (msg.message?.conversation || msg.message?.extendedTextMessage) {
        const texto = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim().toUpperCase();

        if (pendentes.has(jid)) {
            const { dados, empresaId, empresaNome } = pendentes.get(jid);

            if (texto === 'CONFIRMAR' || texto === 'S' || texto === 'SIM') {
                // Lança no Firebase
                const lancamento = {
                    empresaId,
                    tipo: 'pagar',
                    competencia: dados.competencia || competenciaAtual(),
                    descricao: dados.descricao,
                    valor: dados.valor || 0,
                    vencimento: dados.vencimento || new Date().toISOString().split('T')[0],
                    status: 'aberto',
                    origem: 'whatsapp',
                    modificadoPor: `WhatsApp (${numero})`,
                    modificadoEmail: jid,
                    modificadoEm: agora(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                const docId = await firestoreAdd('lancamentos', lancamento);
                pendentes.delete(jid);

                if (docId) {
                    await sock.sendMessage(jid, {
                        text: `✅ *Lançado com sucesso!*\n\n🏢 Empresa: ${empresaNome}\n📝 Descrição: ${dados.descricao}\n💰 Valor: ${fmtMoney(dados.valor)}\n📅 Vencimento: ${fmtDataBR(dados.vencimento)}\n\nAcesse o painel para visualizar 👉 https://rufogestao.netlify.app`
                    });
                } else {
                    await sock.sendMessage(jid, { text: '❌ Erro ao salvar no sistema. Tente novamente ou contate o administrador.' });
                }

            } else if (texto === 'CANCELAR' || texto === 'N' || texto === 'NAO' || texto === 'NÃO') {
                pendentes.delete(jid);
                await sock.sendMessage(jid, { text: '❌ Lançamento cancelado. Mande outra foto quando quiser.' });

            } else {
                await sock.sendMessage(jid, {
                    text: `Por favor responda:\n\n✅ *CONFIRMAR* — para lançar o boleto\n❌ *CANCELAR* — para descartar`
                });
            }
            return;
        }

        // Ajuda geral
        await sock.sendMessage(jid, {
            text: `👋 Olá! Sou o assistente da *Rufo Gestão*.\n\n📸 Me mande uma *foto de boleto* e eu faço o lançamento automático no sistema.\n\nDúvidas? Fale com seu consultor.`
        });
        return;
    }

    // ── Mensagem com imagem ───────────────────────────────────
    const isImagem = msg.message?.imageMessage;
    if (!isImagem) return;

    await sock.sendMessage(jid, { text: '📸 Recebi a imagem! Processando o boleto... aguarde um instante.' });

    try {
        // Baixar a imagem
        const buffer = await downloadMediaMessage(msg, 'buffer', {});
        const base64  = buffer.toString('base64');

        // OCR
        const dados = await extrairDadosBoleto(base64);
        if (!dados) {
            await sock.sendMessage(jid, { text: '❌ Não consegui ler a imagem. Tente tirar uma foto com mais luz e enquadramento completo do boleto.' });
            return;
        }

        // Identificar empresa pelo número
        const todasEmpresas = await firestoreQuery('empresas', 'telefone', numero);
        let empresa = null;

        if (todasEmpresas.length === 0) {
            // Tenta variações do número
            const numCurto = numero.slice(-11);
            const empresas2 = await firestoreQuery('empresas', 'telefone', numCurto);
            empresa = empresas2[0] || null;
        } else {
            empresa = todasEmpresas[0];
        }

        // Se não encontrou pelo número exato, busca todas e compara
        if (!empresa) {
            try {
                const allRes = await axios.get(`${FS_BASE}/empresas${FS_KEY}`);
                const todas = (allRes.data.documents || []).map(d => ({
                    id: d.name.split('/').pop(),
                    ...decodeFields(d.fields)
                }));
                empresa = todas.find(e => telefoneBate(e.telefone, numero)) || null;
            } catch {}
        }

        if (!empresa) {
            // Salva o boleto como pendente mas pede qual empresa
            pendentes.set(jid, { dados, empresaId: null, empresaNome: null, aguardandoEmpresa: true });
            await sock.sendMessage(jid, {
                text: `🔍 Não encontrei seu número cadastrado no sistema.\n\nDados lidos do boleto:\n📝 ${dados.descricao}\n💰 ${fmtMoney(dados.valor)}\n📅 Vencimento: ${fmtDataBR(dados.vencimento)}\n\nPor favor, responda com o *nome da empresa* para eu lançar corretamente.`
            });
            return;
        }

        // Empresa encontrada — pede confirmação
        pendentes.set(jid, { dados, empresaId: empresa.id, empresaNome: empresa.razaoSocial });

        const temDuvida = !dados.valor || !dados.vencimento;
        const aviso = temDuvida ? '\n\n⚠️ _Alguns dados não foram identificados claramente. Confira no painel após confirmar._' : '';

        await sock.sendMessage(jid, {
            text: `📋 *Boleto identificado!*\n\n🏢 Empresa: *${empresa.razaoSocial}*\n📝 Descrição: ${dados.descricao}\n💰 Valor: *${fmtMoney(dados.valor)}*\n📅 Vencimento: *${fmtDataBR(dados.vencimento)}*${aviso}\n\nResponda:\n✅ *CONFIRMAR* — para lançar em Contas a Pagar\n❌ *CANCELAR* — para descartar`
        });

    } catch (err) {
        console.error('Erro ao processar imagem:', err);
        await sock.sendMessage(jid, { text: '❌ Ocorreu um erro ao processar. Tente novamente ou contate o suporte.' });
    }
}

// ===================== WHATSAPP CONNECTION =====================
async function conectarWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['Rufo Gestão', 'Chrome', '1.0.0']
    });

    // QR Code no terminal
    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            console.log('\n📱 ESCANEIE O QR CODE ABAIXO COM SEU WHATSAPP:\n');
            qrcode.generate(qr, { small: true });
            console.log('\n(WhatsApp → Dispositivos conectados → Conectar dispositivo)\n');
        }
        if (connection === 'open') {
            console.log('✅ WhatsApp conectado com sucesso!');
        }
        if (connection === 'close') {
            const deveReconectar = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('🔄 Conexão encerrada. Reconectando:', deveReconectar);
            if (deveReconectar) setTimeout(conectarWhatsApp, 5000);
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Mensagens recebidas
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        for (const msg of messages) {
            if (msg.key.fromMe) continue;           // ignora mensagens enviadas por mim
            if (!msg.message) continue;              // ignora mensagens vazias
            if (msg.key.remoteJid.endsWith('@g.us')) continue; // ignora grupos
            try {
                await processarMensagem(sock, msg);
            } catch (err) {
                console.error('Erro ao processar msg:', err);
            }
        }
    });

    return sock;
}

// ===================== EXPRESS SERVER =====================
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Rufo Gestão Backend',
        pendentes: pendentes.size
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    conectarWhatsApp();
});

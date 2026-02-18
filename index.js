const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const axios = require('axios');
const QRCode = require('qrcode');

const app = express();
app.use(express.json());

// ===================== CONFIG =====================
const GOOGLE_VISION_KEY = process.env.GOOGLE_VISION_KEY;
const FIREBASE_API_KEY  = process.env.FIREBASE_API_KEY;
const FIREBASE_PROJECT  = process.env.FIREBASE_PROJECT_ID || 'rufo-gestao';
const PORT              = process.env.PORT || 3000;

// ===================== STATE =====================
let qrCodeAtual      = null;
let whatsappConectado = false;
const pendentes       = new Map();
const eventLog        = [];

function log(msg) {
    const ts = new Date().toLocaleTimeString('pt-BR');
    const linha = `[${ts}] ${msg}`;
    console.log(linha);
    eventLog.push(linha);
    if (eventLog.length > 50) eventLog.shift();
}

// ===================== FIRESTORE REST =====================
const FS_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents`;
const FS_KEY  = `?key=${FIREBASE_API_KEY}`;

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

async function firestoreQuery(colecao, campo, valor) {
    try {
        const res = await axios.post(`${FS_BASE}:runQuery${FS_KEY}`, {
            structuredQuery: {
                from: [{ collectionId: colecao }],
                where: { fieldFilter: { field: { fieldPath: campo }, op: 'EQUAL', value: { stringValue: valor } } }
            }
        });
        return res.data.filter(r => r.document).map(r => ({
            id: r.document.name.split('/').pop(),
            ...decodeFields(r.document.fields)
        }));
    } catch (e) {
        log('Firestore query error: ' + (e.response?.data?.error?.message || e.message));
        return [];
    }
}

async function firestoreAdd(colecao, dados) {
    try {
        const res = await axios.post(`${FS_BASE}/${colecao}${FS_KEY}`, { fields: encodeFields(dados) });
        return res.data.name.split('/').pop();
    } catch (e) {
        log('Firestore add error: ' + (e.response?.data?.error?.message || e.message));
        return null;
    }
}

// ===================== OCR =====================
async function extrairDadosBoleto(imagemBase64) {
    try {
        const res = await axios.post(
            `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_KEY}`,
            { requests: [{ image: { content: imagemBase64 }, features: [{ type: 'TEXT_DETECTION', maxResults: 1 }] }] }
        );
        const texto = res.data.responses[0]?.fullTextAnnotation?.text || '';
        log('OCR extraiu ' + texto.length + ' caracteres');
        return parsearTextoBoleto(texto);
    } catch (e) {
        log('Vision API error: ' + (e.response?.data?.error?.message || e.message));
        return null;
    }
}

function parsearTextoBoleto(texto) {
    const resultado = { valor: null, vencimento: null, descricao: null };

    const regexValor = [/R\$\s*([\d.,]+)/i, /[Vv]alor[:\s]+R?\$?\s*([\d.,]+)/i, /(?:TOTAL|Total)[:\s]+R?\$?\s*([\d.,]+)/i];
    for (const r of regexValor) {
        const m = texto.match(r);
        if (m) { const num = parseFloat(m[1].replace(/\./g, '').replace(',', '.')); if (!isNaN(num) && num > 0) { resultado.valor = num; break; } }
    }

    const regexVenc = [/[Vv]encimento[:\s]+(\d{2}\/\d{2}\/\d{4})/, /(\d{2}\/\d{2}\/\d{4})/];
    for (const r of regexVenc) {
        const m = texto.match(r);
        if (m) { const [d, mo, a] = m[1].split('/'); resultado.vencimento = `${a}-${mo}-${d}`; break; }
    }

    const regexDesc = [/[Bb]enefici[áa]rio[:\s]+([^\n]+)/, /[Cc]edente[:\s]+([^\n]+)/, /[Ee]mpresa[:\s]+([^\n]+)/];
    for (const r of regexDesc) {
        const m = texto.match(r);
        if (m && m[1].trim().length > 2) { resultado.descricao = m[1].trim().slice(0, 80); break; }
    }
    if (!resultado.descricao) {
        const linhas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 5);
        resultado.descricao = linhas[0]?.slice(0, 60) || 'Boleto via WhatsApp';
    }
    return resultado;
}

// ===================== UTILS =====================
function fmtDataBR(iso) { if (!iso) return '?'; const [a,m,d] = iso.split('-'); return `${d}/${m}/${a}`; }
function fmtMoney(v)    { if (!v) return 'R$ ?'; return `R$ ${Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2})}`; }
function competencia()  { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }
function agora()        { const d = new Date(); return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`; }

function telefoneBate(salvo, numero) {
    const s = String(salvo||'').replace(/\D/g,'');
    const n = String(numero||'').replace(/\D/g,'');
    return s.endsWith(n.slice(-11)) || n.endsWith(s.slice(-11));
}

// ===================== WHATSAPP CLIENT =====================
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-software-rasterizer'
        ],
        headless: true
    }
});

client.on('qr', async (qr) => {
    log('📱 QR Code gerado! Acesse /qr para escanear.');
    qrCodeAtual = await QRCode.toDataURL(qr);
    whatsappConectado = false;
});

client.on('ready', () => {
    log('✅ WhatsApp conectado com sucesso!');
    qrCodeAtual = null;
    whatsappConectado = true;
});

client.on('disconnected', (reason) => {
    log('🔴 WhatsApp desconectado: ' + reason);
    whatsappConectado = false;
    qrCodeAtual = null;
    setTimeout(() => client.initialize(), 5000);
});

client.on('message', async (msg) => {
    if (msg.fromMe) return;
    if (msg.from.endsWith('@g.us')) return; // ignora grupos

    const jid    = msg.from;
    const numero = jid.replace('@c.us', '').replace(/\D/g, '');

    // ── Imagem ──────────────────────────────────
    if (msg.hasMedia && msg.type === 'image') {
        await msg.reply('📸 Recebi o boleto! Processando... aguarde.');
        try {
            const media = await msg.downloadMedia();
            const base64 = media.data;
            const dados = await extrairDadosBoleto(base64);

            if (!dados) {
                await msg.reply('❌ Não consegui ler a imagem. Tente uma foto com mais luz e o boleto completo.');
                return;
            }

            // Buscar empresa pelo telefone
            let empresa = null;
            try {
                const allRes = await axios.get(`${FS_BASE}/empresas${FS_KEY}`);
                const todas = (allRes.data.documents || []).map(d => ({
                    id: d.name.split('/').pop(),
                    ...decodeFields(d.fields)
                }));
                empresa = todas.find(e => telefoneBate(e.telefone, numero)) || null;
            } catch (e) {
                log('Erro ao buscar empresas: ' + e.message);
            }

            if (!empresa) {
                pendentes.set(jid, { dados, aguardandoEmpresa: true });
                await msg.reply(`🔍 Número não cadastrado no sistema.\n\nDados do boleto:\n📝 ${dados.descricao}\n💰 ${fmtMoney(dados.valor)}\n📅 Vencimento: ${fmtDataBR(dados.vencimento)}\n\nResponda com o *nome da empresa* para lançar.`);
                return;
            }

            pendentes.set(jid, { dados, empresaId: empresa.id, empresaNome: empresa.razaoSocial });
            const aviso = (!dados.valor || !dados.vencimento) ? '\n\n⚠️ _Alguns dados não identificados. Confira no painel após confirmar._' : '';
            await msg.reply(`📋 *Boleto identificado!*\n\n🏢 *${empresa.razaoSocial}*\n📝 ${dados.descricao}\n💰 *${fmtMoney(dados.valor)}*\n📅 *${fmtDataBR(dados.vencimento)}*${aviso}\n\nResponda:\n✅ *CONFIRMAR* — lançar em Contas a Pagar\n❌ *CANCELAR* — descartar`);
        } catch (err) {
            log('Erro ao processar imagem: ' + err.message);
            await msg.reply('❌ Erro ao processar. Tente novamente.');
        }
        return;
    }

    // ── Texto ────────────────────────────────────
    const texto = (msg.body || '').trim().toUpperCase();

    if (pendentes.has(jid)) {
        const p = pendentes.get(jid);

        if (p.aguardandoEmpresa) {
            const empresas = await firestoreQuery('empresas', 'razaoSocial', msg.body.trim());
            if (!empresas.length) {
                await msg.reply('❌ Empresa não encontrada. Verifique o nome e tente novamente.');
                return;
            }
            const empresa = empresas[0];
            pendentes.set(jid, { dados: p.dados, empresaId: empresa.id, empresaNome: empresa.razaoSocial });
            await msg.reply(`✅ Empresa encontrada: *${empresa.razaoSocial}*\n\nConfirmar lançamento?\n\n✅ *CONFIRMAR* ou ❌ *CANCELAR*`);
            return;
        }

        if (texto === 'CONFIRMAR' || texto === 'S' || texto === 'SIM') {
            const lancamento = {
                empresaId: p.empresaId,
                tipo: 'pagar',
                competencia: competencia(),
                descricao: p.dados.descricao,
                valor: p.dados.valor || 0,
                vencimento: p.dados.vencimento || new Date().toISOString().split('T')[0],
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
                await msg.reply(`✅ *Lançado com sucesso!*\n\n🏢 ${p.empresaNome}\n📝 ${p.dados.descricao}\n💰 ${fmtMoney(p.dados.valor)}\n📅 ${fmtDataBR(p.dados.vencimento)}\n\nAcesse o painel 👉 https://rufogestao.netlify.app`);
            } else {
                await msg.reply('❌ Erro ao salvar. Tente novamente ou contate o administrador.');
            }
        } else if (texto === 'CANCELAR' || texto === 'N' || texto === 'NAO' || texto === 'NÃO') {
            pendentes.delete(jid);
            await msg.reply('❌ Lançamento cancelado.');
        } else {
            await msg.reply('Responda *CONFIRMAR* para lançar ou *CANCELAR* para descartar.');
        }
        return;
    }

    await msg.reply('👋 Olá! Sou o assistente da *Rufo Gestão*.\n\n📸 Me mande uma *foto de boleto* e faço o lançamento automático no sistema.');
});

// ===================== EXPRESS =====================
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'Rufo Gestão Backend', whatsapp: whatsappConectado ? 'conectado ✅' : 'aguardando QR ⏳', qr: whatsappConectado ? null : '/qr' });
});

app.get('/qr', (req, res) => {
    if (whatsappConectado) {
        return res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:50px;background:#1e3a5f;color:white;"><h1>✅ WhatsApp conectado!</h1></body></html>`);
    }
    if (!qrCodeAtual) {
        return res.send(`<html><head><meta http-equiv="refresh" content="3"></head><body style="font-family:sans-serif;text-align:center;padding:50px;background:#1e3a5f;color:white;"><h1>⏳ Gerando QR Code...</h1><p>Página atualiza em 3 segundos.</p></body></html>`);
    }
    res.send(`
        <html><head><meta http-equiv="refresh" content="30"></head>
        <body style="font-family:sans-serif;text-align:center;padding:40px;background:#1e3a5f;color:white;">
            <h1>📱 Conectar WhatsApp — Rufo Gestão</h1>
            <p style="font-size:18px;">WhatsApp → <strong>Dispositivos conectados</strong> → <strong>Conectar dispositivo</strong></p>
            <img src="${qrCodeAtual}" style="width:320px;height:320px;border:8px solid white;border-radius:16px;margin:20px auto;display:block;">
            <p style="opacity:0.7;font-size:13px;">QR expira em 60s. Página atualiza automaticamente.</p>
        </body></html>
    `);
});

app.get('/status', (req, res) => {
    res.send(`
        <html><head><meta http-equiv="refresh" content="3"></head>
        <body style="font-family:monospace;padding:30px;background:#111;color:#0f0;">
            <h2 style="color:white;">🔍 Rufo Backend — Status</h2>
            <p>WhatsApp: <strong>${whatsappConectado ? '✅ Conectado' : '⏳ Aguardando'}</strong></p>
            <p>QR: <strong>${qrCodeAtual ? '<a href="/qr" style="color:cyan;">Disponível → /qr</a>' : 'Não gerado ainda'}</strong></p>
            <hr style="border-color:#333;">
            <h3 style="color:white;">Log:</h3>
            ${eventLog.length ? [...eventLog].reverse().map(e => `<div>${e}</div>`).join('') : '<div>Nenhum evento</div>'}
        </body></html>
    `);
});

// ===================== START =====================
app.listen(PORT, () => {
    log(`🚀 Servidor na porta ${PORT}`);
    log('🔌 Iniciando WhatsApp...');
    client.initialize();
});

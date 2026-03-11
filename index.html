import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===================== FIREBASE CONFIG =====================
const firebaseConfig = {
    apiKey: "AIzaSyBbE1oC-4m_Ry5PGUNpJQ69DrkvwCCOxA8",
    authDomain: "rufo-gestao.firebaseapp.com",
    projectId: "rufo-gestao",
    storageBucket: "rufo-gestao.firebasestorage.app",
    messagingSenderId: "1070437850558",
    appId: "1:1070437850558:web:e124b61a13ee1aabe72def",
    measurementId: "G-VSDSGGDBP8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Google Vision API Key (OCR de boletos)
const GOOGLE_VISION_KEY = 'AIzaSyAaYgR2f4jcYpolgdCZ_Yi2UEHsi3z-LI0';

// ===================== STATE =====================
let currentUser = null;
let currentEmpresa = null;
let adminViewingClient = false;
let resetTargetUser = null;
let dreData = {};
let categorias = []; // Categorias DRE carregadas

// Upload state - tornar globalmente acessível
window.uploadPendentes = [];
window.uploadPendentesAdmin = [];
window.empresaSelecionadaUpload = null;

// Aliases para compatibilidade
let uploadPendentes = window.uploadPendentes;
let uploadPendentesAdmin = window.uploadPendentesAdmin;
let empresaSelecionadaUpload = window.empresaSelecionadaUpload;

// Categorias padrão do DRE
const CATEGORIAS_DEFAULT = [
    { id: 'receita-bruta', nome: 'Receita Bruta', tipo: 'receita' },
    { id: 'impostos-vendas', nome: 'Impostos s/ Vendas', tipo: 'despesa' },
    { id: 'cmv-custos', nome: 'CMV / Custos Variáveis', tipo: 'despesa' },
    { id: 'despesas-adm', nome: 'Despesas ADM / Operacionais', tipo: 'despesa' },
    { id: 'folha-pagamento', nome: 'Folha de Pagamento', tipo: 'despesa' },
    { id: 'outros-custos', nome: 'Outros Custos', tipo: 'despesa' }
];

// ===================== UTILS =====================
const $ = id => document.getElementById(id);
const fmtMoney = v => `R$ ${(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`;
const fmtDate = d => { if(!d) return '-'; const p=d.split('-'); return `${p[2]}/${p[1]}/${p[0]}`; };
const fmtMonth = m => { if(!m) return '-'; const [y,mo]=m.split('-'); const months=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']; return `${months[parseInt(mo)-1]}/${y}`; };
const genPass = () => Math.random().toString(36).slice(2,10).toUpperCase();
const today = () => new Date().toISOString().split('T')[0];
const show = id => $(id).classList.remove('hidden');
const hide = id => $(id).classList.add('hidden');
const competenciaAtual = () => {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}`;
};

function getAuditInfo() {
    const modificadoPor = currentUser?.nome || 'Sistema';
    const modificadoEmail = currentUser?.email || '';
    const modificadoEm = new Date().toISOString();
    return { modificadoPor, modificadoEmail, modificadoEm };
}

function calcStatus(vencimento, status) {
    if (status === 'pago') return 'pago';
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const v = new Date(vencimento); v.setHours(0,0,0,0);
    if (v < hoje) return 'atrasado';
    return status || 'aberto';
}

function filtroPeriodo(data, periodo) {
    const d = new Date(data), h = new Date();
    h.setHours(0,0,0,0);
    if (periodo === 'hoje') return d.toDateString() === h.toDateString();
    if (periodo === 'semana') { const ini = new Date(h); ini.setDate(h.getDate()-h.getDay()); const fim = new Date(ini); fim.setDate(ini.getDate()+6); return d>=ini && d<=fim; }
    if (periodo === 'mes') return d.getMonth()===h.getMonth() && d.getFullYear()===h.getFullYear();
    if (periodo === '30dias') { const x=new Date(h); x.setDate(h.getDate()-30); return d>=x; }
    if (periodo === '90dias') { const x=new Date(h); x.setDate(h.getDate()-90); return d>=x; }
    return true;
}

// ===================== INIT =====================
async function init() {
    try {
        // Criar admin padrão se não existir
        const adminRef = doc(db, 'users', 'admin_default');
        const adminSnap = await getDoc(adminRef);
        if (!adminSnap.exists()) {
            await setDoc(adminRef, {
                id: 'admin_default',
                nome: 'Administrador Rufo',
                email: 'admin@rufo.com',
                senha: 'admin123',
                role: 'admin',
                createdAt: new Date().toISOString()
            });
        }
        
        // Inicializar categorias padrão
        await inicializarCategorias();
        await carregarCategorias(null); // Carrega categorias globais (padrão)
        
        hide('loadingScreen');
        show('loginScreen');
    } catch(e) {
        console.error(e);
        hide('loadingScreen');
        show('loginScreen');
    }
}

// ===================== CATEGORIAS DRE =====================

// Inicializar categorias padrão se não existirem
async function inicializarCategorias() {
    try {
        const q = query(collection(db, 'categorias'), where('empresaId', '==', null));
        const categoriasSnap = await getDocs(q);
        
        if (categoriasSnap.empty) {
            console.log('Criando categorias padrão globais...');
            for (const cat of CATEGORIAS_DEFAULT) {
                await setDoc(doc(db, 'categorias', cat.id), {
                    ...cat,
                    empresaId: null, // Categoria global (padrão)
                    isPadrao: true
                });
            }
            console.log('✅ Categorias padrão criadas');
        }
    } catch (err) {
        console.error('Erro ao inicializar categorias:', err);
    }
}

// Carregar categorias (filtradas por empresa ou globais)
async function carregarCategorias(empresaId = null) {
    try {
        let q;
        if (empresaId) {
            // Busca categorias da empresa específica
            q = query(collection(db, 'categorias'), where('empresaId', '==', empresaId));
        } else {
            // Busca categorias globais (padrão)
            q = query(collection(db, 'categorias'), where('empresaId', '==', null));
        }
        
        const snap = await getDocs(q);
        categorias = [];
        snap.forEach(doc => {
            categorias.push({ ...doc.data(), id: doc.id });
        });
        
        console.log(`✅ ${categorias.length} categorias carregadas${empresaId ? ' para empresa ' + empresaId : ' (globais)'}`);
        return categorias;
    } catch (err) {
        console.error('Erro ao carregar categorias:', err);
        return [];
    }
}

// Popular select de categorias
function popularSelectCategorias(selectId, tipo = null) {
    const select = $(selectId);
    if (!select) return;
    
    const opcaoInicial = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if (opcaoInicial) select.appendChild(opcaoInicial);
    
    const catsFiltradas = tipo ? categorias.filter(c => c.tipo === tipo) : categorias;
    catsFiltradas.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = `${cat.tipo === 'receita' ? '💰' : '💸'} ${cat.nome}`;
        select.appendChild(opt);
    });
}

// Copiar categorias padrão para nova empresa
async function copiarCategoriasPadraoParaEmpresa(empresaId) {
    try {
        console.log(`📋 Copiando categorias padrão para empresa ${empresaId}...`);
        
        // Buscar categorias padrão (globais)
        const qPadrao = query(collection(db, 'categorias'), where('isPadrao', '==', true));
        const snapPadrao = await getDocs(qPadrao);
        
        let copiadas = 0;
        for (const docSnap of snapPadrao.docs) {
            const catPadrao = docSnap.data();
            
            // Criar cópia para a empresa
            await addDoc(collection(db, 'categorias'), {
                nome: catPadrao.nome,
                tipo: catPadrao.tipo,
                empresaId: empresaId, // Vincula à empresa
                isPadrao: false, // Não é mais padrão, é cópia
                copiadaDe: docSnap.id, // Referência ao original
                createdAt: new Date().toISOString()
            });
            copiadas++;
        }
        
        console.log(`✅ ${copiadas} categorias copiadas para empresa ${empresaId}`);
        return copiadas;
    } catch (err) {
        console.error('Erro ao copiar categorias:', err);
        return 0;
    }
}

// Renderizar lista de categorias (admin)
async function renderCategoriasAdmin() {
    await carregarCategorias(null); // Admin vê categorias padrão globais
    const tb = $('tbCategorias');
    if (!tb) return;
    
    tb.innerHTML = categorias.map(cat => `
        <tr>
            <td><strong>${cat.nome}</strong></td>
            <td><span class="badge ${cat.tipo==='receita'?'badge-success':'badge-warning'}">${cat.tipo === 'receita' ? '💰 Receita' : '💸 Despesa'}</span></td>
            <td>
                <button class="btn-sm btn-sm-edit" onclick="window.editarCategoria('${cat.id}')">✏️</button>
                <button class="btn-sm btn-sm-danger" onclick="window.excluirCategoria('${cat.id}', '${cat.nome}')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// Abrir modal categoria
window.abrirModalCategoria = function(id = null) {
    $('modalCategoriaTitulo').textContent = id ? 'Editar Categoria' : 'Nova Categoria';
    $('catEditId').value = id || '';
    
    if (id) {
        const cat = categorias.find(c => c.id === id);
        if (cat) {
            $('catNome').value = cat.nome;
            $('catTipo').value = cat.tipo;
        }
    } else {
        $('formCategoria').reset();
    }
    
    show('modalCategoria');
};

window.editarCategoria = function(id) {
    window.abrirModalCategoria(id);
};

window.excluirCategoria = async function(id, nome) {
    if (!confirm(`Deseja realmente excluir a categoria "${nome}"?\n\nATENÇÃO: Lançamentos com esta categoria ficarão sem categoria!`)) return;
    
    try {
        await deleteDoc(doc(db, 'categorias', id));
        alert('✅ Categoria excluída!');
        await renderCategoriasAdmin();
    } catch (err) {
        console.error('Erro ao excluir categoria:', err);
        alert('❌ Erro ao excluir categoria!');
    }
};

// Salvar categoria
$('formCategoria')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = $('catEditId').value;
    const data = {
        nome: $('catNome').value.trim(),
        tipo: $('catTipo').value
    };
    
    if (!data.nome || !data.tipo) {
        alert('Preencha todos os campos!');
        return;
    }
    
    // Determinar empresaId
    // Se admin criando padrão: null
    // Se empresa criando sua categoria: currentEmpresa.id
    let empresaId = null;
    if (currentUser?.role === 'client' && currentEmpresa) {
        empresaId = currentEmpresa.id;
    }
    
    data.empresaId = empresaId;
    data.isPadrao = (empresaId === null); // Padrão se global
    
    try {
        if (id) {
            await updateDoc(doc(db, 'categorias', id), data);
            alert('✅ Categoria atualizada!');
        } else {
            const novoId = data.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
            await setDoc(doc(db, 'categorias', novoId), { ...data, id: novoId, createdAt: new Date().toISOString() });
            alert('✅ Categoria criada!\n\nAgora você pode usar essa categoria nos lançamentos e ela aparecerá automaticamente no DRE!');
        }
        
        fecharModal('modalCategoria');
        
        // Recarregar categorias apropriadas
        await carregarCategorias(empresaId);
        
        // Atualizar lista de categorias (se estiver na aba de categorias)
        if ($('tbCategorias')) {
            await renderCategoriasAdmin();
        }
        
        // Atualizar DRE (se estiver visível)
        if ($('dreBody') && !$('dreBody').classList.contains('hidden')) {
            await renderDRE();
        }
        
        // Atualizar dashboard do cliente se estiver logado
        if (currentUser?.role === 'cliente') {
            await renderClienteDashboard();
        }
    } catch (err) {
        console.error('Erro ao salvar categoria:', err);
        alert('❌ Erro ao salvar categoria!');
    }
});

// ===================== LOGIN / LOGOUT =====================
$('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('loginEmail').value.trim();
    const senha = $('loginSenha').value;
    hide('loginError');

    try {
        const q = query(collection(db,'users'), where('email','==',email));
        const snap = await getDocs(q);
        if (snap.empty) { show('loginError'); return; }
        const userData = snap.docs[0].data();
        if (userData.senha !== senha) { show('loginError'); return; }
        currentUser = { ...userData, id: snap.docs[0].id };

        if (currentUser.role === 'admin') {
            showAdminPanel();
        } else if (currentUser.role === 'client') {
            const empSnap = await getDoc(doc(db,'empresas',currentUser.empresaId));
            if (!empSnap.exists()) { show('loginError'); return; }
            currentEmpresa = { ...empSnap.data(), id: empSnap.id };
            adminViewingClient = false;
            showClientePanel();
        }
    } catch(err) {
        console.error(err);
        show('loginError');
    }
});

window.logout = function() {
    currentUser = null; currentEmpresa = null; adminViewingClient = false;
    hide('adminPanel'); hide('clientePanel'); show('loginScreen');
    $('loginForm').reset();
};

// ===================== ADMIN PANEL =====================
async function showAdminPanel() {
    hide('loginScreen'); hide('clientePanel');
    show('adminPanel');
    $('adminNomeDisplay').textContent = currentUser.nome;
    await loadAdminDashboard();
    await carregarEmpresasUpload();
    await renderCategoriasAdmin();
}

async function loadAdminDashboard() {
    const [empresasSnap, usersSnap, lancsSnap] = await Promise.all([
        getDocs(collection(db,'empresas')),
        getDocs(query(collection(db,'users'), where('role','==','admin'))),
        getDocs(collection(db,'lancamentos'))
    ]);

    const lancs = lancsSnap.docs.map(d=>d.data());
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const sete = new Date(hoje); sete.setDate(hoje.getDate()+7);

    $('statClientes').textContent = empresasSnap.size;
    $('statAdmins').textContent = usersSnap.size;
    $('statVencer').textContent = lancs.filter(l=>{const v=new Date(l.vencimento);return l.status!=='pago'&&v>=hoje&&v<=sete;}).length;
    $('statAtrasadas').textContent = lancs.filter(l=>{const v=new Date(l.vencimento);v.setHours(0,0,0,0);return l.status!=='pago'&&v<hoje;}).length;

    // Render empresas
    const tb = $('tbEmpresas');
    if (empresasSnap.empty) { tb.innerHTML='<tr class="empty-row"><td colspan="5">Nenhuma empresa cadastrada</td></tr>'; }
    else {
        tb.innerHTML = empresasSnap.docs.map(d=>{
            const e=d.data();
            return `<tr>
                <td><strong>${e.razaoSocial}</strong></td>
                <td>${e.cnpj}</td>
                <td>${e.responsavel}</td>
                <td>${e.emailLogin||'-'}</td>
                <td><div class="actions">
                    <button class="btn-sm btn-sm-primary" onclick="verEmpresa('${d.id}')">👁️ Ver</button>
                    <button class="btn-sm btn-sm-success" onclick="editarEmpresa('${d.id}')">✏️ Editar</button>
                    <button class="btn-sm btn-sm-warning" onclick="resetSenhaEmpresa('${d.id}')">🔑 Senha</button>
                    <button class="btn-sm btn-sm-danger" onclick="excluirConfirm('empresa','${d.id}','${e.razaoSocial}')">🗑️</button>
                </div></td>
            </tr>`;
        }).join('');
    }

    // Render admins
    const tbA = $('tbAdmins');
    if (usersSnap.empty) { tbA.innerHTML='<tr class="empty-row"><td colspan="3">Nenhum admin cadastrado</td></tr>'; }
    else {
        tbA.innerHTML = usersSnap.docs.map(d=>{
            const u=d.data();
            const isMe = d.id === currentUser.id;
            return `<tr>
                <td><strong>${u.nome}</strong> ${isMe?'<span class="badge badge-admin">Você</span>':''}</td>
                <td>${u.email}</td>
                <td><div class="actions">
                    <button class="btn-sm btn-sm-warning" onclick="resetSenhaAdmin('${d.id}')">🔑 Resetar Senha</button>
                    ${!isMe?`<button class="btn-sm btn-sm-danger" onclick="excluirConfirm('admin','${d.id}','${u.nome}')">🗑️ Excluir</button>`:''}
                </div></td>
            </tr>`;
        }).join('');
    }
}

// VER EMPRESA (admin visualiza como cliente)
window.verEmpresa = async function(id) {
    const snap = await getDoc(doc(db,'empresas',id));
    if (!snap.exists()) return;
    currentEmpresa = { ...snap.data(), id: snap.id };
    adminViewingClient = true;
    showClientePanel();
};

window.voltarAdmin = function() {
    adminViewingClient = false; currentEmpresa = null;
    hide('clientePanel'); showAdminPanel();
};

// ===================== EMPRESAS CRUD =====================
window.abrirModalEmpresa = function() {
    $('modalEmpresaTitulo').textContent = 'Nova Empresa';
    $('formEmpresa').reset();
    $('empresaEditId').value = '';
    $('eSenhaLabel').textContent = 'Senha inicial do cliente *';
    $('eSenha').required = true;
    $('eSenha').placeholder = 'mínimo 6 caracteres';
    abrirModal('modalEmpresa');
};

window.editarEmpresa = async function(id) {
    const snap = await getDoc(doc(db,'empresas',id));
    if (!snap.exists()) return;
    const e = snap.data();
    $('modalEmpresaTitulo').textContent = 'Editar Empresa';
    $('empresaEditId').value = id;
    $('eRazao').value = e.razaoSocial||'';
    $('eCnpj').value = e.cnpj||'';
    $('eResponsavel').value = e.responsavel||'';
    $('eTelefone').value = e.telefone||'';
    $('eEmail').value = e.emailLogin||'';
    $('eSenha').value = '';
    $('eSenhaLabel').textContent = 'Nova senha (deixe em branco para não alterar)';
    $('eSenha').required = false;
    $('eSenha').placeholder = 'deixe em branco para não alterar';
    $('eSaldo').value = e.saldo||0;
    abrirModal('modalEmpresa');
};

$('formEmpresa').addEventListener('submit', async e => {
    e.preventDefault();
    const editId = $('empresaEditId').value;
    const emailLogin = $('eEmail').value.trim();
    const senha = $('eSenha').value;

    try {
        if (editId) {
            // Editar
            const updates = {
                razaoSocial: $('eRazao').value,
                cnpj: $('eCnpj').value,
                responsavel: $('eResponsavel').value,
                telefone: $('eTelefone').value,
                emailLogin,
                saldo: parseFloat($('eSaldo').value)||0,
                updatedAt: new Date().toISOString()
            };
            await updateDoc(doc(db,'empresas',editId), updates);
            // Atualizar email/senha do user cliente se necessário
            if (senha) {
                const q = query(collection(db,'users'), where('empresaId','==',editId));
                const uSnap = await getDocs(q);
                uSnap.forEach(async ud => {
                    await updateDoc(doc(db,'users',ud.id), { email: emailLogin, senha });
                });
            }
        } else {
            // Criar nova empresa
            const empRef = await addDoc(collection(db,'empresas'), {
                razaoSocial: $('eRazao').value,
                cnpj: $('eCnpj').value,
                responsavel: $('eResponsavel').value,
                telefone: $('eTelefone').value,
                emailLogin,
                saldo: parseFloat($('eSaldo').value)||0,
                createdAt: new Date().toISOString()
            });
            
            // Copiar categorias padrão para a nova empresa
            await copiarCategoriasPadraoParaEmpresa(empRef.id);
            
            // Criar usuário cliente
            await addDoc(collection(db,'users'), {
                nome: $('eResponsavel').value,
                email: emailLogin,
                senha,
                role: 'client',
                empresaId: empRef.id,
                createdAt: new Date().toISOString()
            });
        }
        fecharModal('modalEmpresa');
        await loadAdminDashboard();
        alert(editId ? 'Empresa atualizada!' : 'Empresa cadastrada!');
    } catch(err) {
        console.error(err);
        alert('Erro ao salvar empresa: ' + err.message);
    }
});

// ===================== ADMINS CRUD =====================
window.abrirModalAdmin = function() {
    $('modalAdminTitulo').textContent = 'Novo Administrador';
    $('formAdmin').reset();
    $('adminEditId').value = '';
    $('aSenhaLabel').textContent = 'Senha *';
    $('aSenha').required = true;
    abrirModal('modalAdmin');
};

$('formAdmin').addEventListener('submit', async e => {
    e.preventDefault();
    const editId = $('adminEditId').value;
    const data = {
        nome: $('aNome').value,
        email: $('aEmail').value.trim(),
        role: 'admin',
        updatedAt: new Date().toISOString()
    };
    if ($('aSenha').value) data.senha = $('aSenha').value;

    try {
        if (editId) {
            await updateDoc(doc(db,'users',editId), data);
        } else {
            data.createdAt = new Date().toISOString();
            await addDoc(collection(db,'users'), data);
        }
        fecharModal('modalAdmin');
        await loadAdminDashboard();
        alert(editId ? 'Admin atualizado!' : 'Admin cadastrado!');
    } catch(err) {
        alert('Erro: ' + err.message);
    }
});

// ===================== RESET SENHA =====================
window.resetSenhaAdmin = async function(id) {
    const snap = await getDoc(doc(db,'users',id));
    if (!snap.exists()) return;
    const u = snap.data();
    const novaSenha = genPass();
    $('resetUserInfo').textContent = `Usuário: ${u.nome} (${u.email})`;
    $('novaSenhaDisplay').textContent = novaSenha;
    resetTargetUser = { id, novaSenha };
    abrirModal('modalReset');
};

window.resetSenhaEmpresa = async function(empresaId) {
    const q = query(collection(db,'users'), where('empresaId','==',empresaId));
    const snap = await getDocs(q);
    if (snap.empty) return alert('Usuário não encontrado!');
    const ud = snap.docs[0];
    const u = ud.data();
    const novaSenha = genPass();
    $('resetUserInfo').textContent = `Usuário: ${u.nome} (${u.email})`;
    $('novaSenhaDisplay').textContent = novaSenha;
    resetTargetUser = { id: ud.id, novaSenha };
    abrirModal('modalReset');
};

window.confirmarReset = async function() {
    if (!resetTargetUser) return;
    try {
        await updateDoc(doc(db,'users',resetTargetUser.id), { senha: resetTargetUser.novaSenha });
        fecharModal('modalReset');
        alert('Senha resetada com sucesso!\nEnvie a nova senha para o usuário.');
    } catch(err) {
        alert('Erro ao resetar senha: ' + err.message);
    }
};

// ===================== EXCLUSÃO =====================
window.excluirConfirm = function(tipo, id, nome) {
    $('confirmMsg').textContent = `Deseja realmente excluir "${nome}"? Esta ação não pode ser desfeita.`;
    $('confirmBtn').onclick = () => executarExclusao(tipo, id);
    abrirModal('modalConfirm');
};

async function executarExclusao(tipo, id) {
    try {
        if (tipo === 'empresa') {
            await deleteDoc(doc(db,'empresas',id));
            // Excluir usuário cliente
            const q = query(collection(db,'users'), where('empresaId','==',id));
            const snap = await getDocs(q);
            snap.forEach(async d => await deleteDoc(doc(db,'users',d.id)));
            // Excluir lançamentos
            const lq = query(collection(db,'lancamentos'), where('empresaId','==',id));
            const ls = await getDocs(lq);
            ls.forEach(async d => await deleteDoc(doc(db,'lancamentos',d.id)));
        } else if (tipo === 'admin') {
            await deleteDoc(doc(db,'users',id));
        } else if (tipo === 'lancamento') {
            await deleteDoc(doc(db,'lancamentos',id));
            await renderClienteDashboard();
        }
        fecharModal('modalConfirm');
        if (tipo !== 'lancamento') await loadAdminDashboard();
        alert('Excluído com sucesso!');
    } catch(err) {
        alert('Erro ao excluir: ' + err.message);
    }
}

// ===================== CLIENTE PANEL =====================
function showClientePanel() {
    hide('loginScreen'); hide('adminPanel');
    show('clientePanel');
    $('empresaNomeNav').textContent = currentEmpresa.razaoSocial;
    $('empresaCnpjNav').textContent = currentEmpresa.cnpj || '';

    // CORREÇÃO DO BUG: mostra nome correto no canto superior direito
    if (adminViewingClient) {
        $('clienteNomeDisplay').textContent = currentUser.nome + ' (admin)';
        show('btnVoltarAdmin');
    } else {
        $('clienteNomeDisplay').textContent = currentEmpresa.responsavel;
        hide('btnVoltarAdmin');
    }

    renderClienteDashboard();
    initDREAno();
}

async function renderClienteDashboard() {
    // Carregar categorias da empresa
    await carregarCategorias(currentEmpresa.id);
    
    const snap = await getDocs(query(collection(db,'lancamentos'), where('empresaId','==',currentEmpresa.id)));
    const lancs = snap.docs.map(d=>({...d.data(), id:d.id}));

    const hoje = new Date(), mes = hoje.getMonth(), ano = hoje.getFullYear();
    const doMes = lancs.filter(l=>{ const v=new Date(l.vencimento); return v.getMonth()===mes&&v.getFullYear()===ano; });

    const recPagos = doMes.filter(l=>l.tipo==='receber'&&l.status==='pago').reduce((s,l)=>s+l.valor,0);
    const despPagas = doMes.filter(l=>l.tipo==='pagar'&&l.status==='pago').reduce((s,l)=>s+l.valor,0);
    const lucro = recPagos - despPagas;
    const aPagar = lancs.filter(l=>l.tipo==='pagar'&&l.status!=='pago').reduce((s,l)=>s+l.valor,0);
    const aReceber = lancs.filter(l=>l.tipo==='receber'&&l.status!=='pago').reduce((s,l)=>s+l.valor,0);

    // Calcular saldo real: inicial + todas receitas pagas - todas despesas pagas
    const saldoInicial = currentEmpresa.saldo||0;
    const todasReceitasPagas = lancs.filter(l=>l.tipo==='receber'&&l.status==='pago').reduce((s,l)=>s+l.valor,0);
    const todasDespesasPagas = lancs.filter(l=>l.tipo==='pagar'&&l.status==='pago').reduce((s,l)=>s+l.valor,0);
    const saldoAtualReal = saldoInicial + todasReceitasPagas - todasDespesasPagas;

    $('vReceitaMes').textContent = fmtMoney(recPagos);
    $('vDespesaMes').textContent = fmtMoney(despPagas);
    $('vLucro').textContent = fmtMoney(lucro);
    $('vLucro').className = 'stat-value ' + (lucro>=0?'green':'red');
    $('vSaldo').textContent = fmtMoney(saldoAtualReal);
    $('vAPagar').textContent = fmtMoney(aPagar);
    $('vAReceber').textContent = fmtMoney(aReceber);

    // Indicadores
    $('iMargemLiq').textContent = recPagos>0 ? ((lucro/recPagos)*100).toFixed(1)+'%' : '0%';
    const custvariavel = despPagas * 0.6;
    $('iMargemContr').textContent = recPagos>0 ? (((recPagos-custvariavel)/recPagos)*100).toFixed(1)+'%' : '0%';

    const abertasRec = lancs.filter(l=>l.tipo==='receber'&&l.status!=='pago');
    const abertasPag = lancs.filter(l=>l.tipo==='pagar'&&l.status!=='pago');
    $('iPMR').textContent = abertasRec.length>0 ? Math.round(abertasRec.reduce((s,l)=>{ const d=Math.max(0,Math.ceil((new Date(l.vencimento)-hoje)/(1000*60*60*24))); return s+d; },0)/abertasRec.length)+' dias' : '0 dias';
    $('iPMP').textContent = abertasPag.length>0 ? Math.round(abertasPag.reduce((s,l)=>{ const d=Math.max(0,Math.ceil((new Date(l.vencimento)-hoje)/(1000*60*60*24))); return s+d; },0)/abertasPag.length)+' dias' : '0 dias';

    renderFluxo(lancs);
    renderPagar(lancs);
    renderReceber(lancs);
    
    // Renderizar gráficos
    renderizarGraficos();
}

// ===================== LANÇAMENTOS =====================
window.abrirModalLanc = function(tipo) {
    $('modalLancTitulo').textContent = tipo==='pagar' ? 'Nova Despesa' : 'Nova Receita';
    $('formLanc').reset();
    $('lancEditId').value = '';
    $('lancTipo').value = tipo;
    // Preencher mês atual
    const hoje = new Date();
    $('lCompetencia').value = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}`;
    $('lVencimento').value = today();
    
    // Popular categorias
    popularSelectCategorias('lCategoria', tipo === 'pagar' ? 'despesa' : 'receita');
    
    abrirModal('modalLanc');
};

window.editarLanc = async function(id) {
    const snap = await getDoc(doc(db,'lancamentos',id));
    if (!snap.exists()) return;
    const l = snap.data();
    $('modalLancTitulo').textContent = l.tipo==='pagar' ? 'Editar Despesa' : 'Editar Receita';
    $('lancEditId').value = id;
    $('lancTipo').value = l.tipo;
    $('lCompetencia').value = l.competencia||'';
    $('lDescricao').value = l.descricao||'';
    $('lFornecedor').value = l.fornecedor||'';
    $('lDocumento').value = l.documento||'';
    $('lValor').value = l.valor||'';
    $('lVencimento').value = l.vencimento||'';
    $('lStatus').value = l.status||'aberto';
    
    // Popular e selecionar categoria
    popularSelectCategorias('lCategoria', l.tipo === 'pagar' ? 'despesa' : 'receita');
    $('lCategoria').value = l.categoria || '';
    
    abrirModal('modalLanc');
};

$('formLanc').addEventListener('submit', async e => {
    e.preventDefault();
    const editId = $('lancEditId').value;
    
    // VALIDAÇÃO RIGOROSA (MODO A - QUALIDADE MÁXIMA)
    const competencia = $('lCompetencia').value;
    const descricao = $('lDescricao').value.trim();
    const fornecedor = $('lFornecedor').value.trim();
    const documento = $('lDocumento').value.trim();
    const categoria = $('lCategoria').value;
    const valor = parseFloat($('lValor').value);
    const vencimento = $('lVencimento').value;
    
    // Validar campos obrigatórios
    if (!competencia) {
        alert('⚠️ Preencha o mês de competência!');
        return;
    }
    if (!descricao) {
        alert('⚠️ Preencha a descrição!');
        return;
    }
    if (!fornecedor) {
        alert('⚠️ Preencha o nome do fornecedor/cliente!');
        return;
    }
    if (!documento) {
        alert('⚠️ Preencha o número do documento!');
        return;
    }
    if (!categoria) {
        alert('⚠️ Selecione uma categoria DRE!');
        return;
    }
    if (!valor || valor <= 0) {
        alert('⚠️ Valor deve ser maior que zero!');
        return;
    }
    if (!vencimento) {
        alert('⚠️ Preencha a data de vencimento!');
        return;
    }
    
    const data = {
        empresaId: currentEmpresa.id,
        tipo: $('lancTipo').value,
        competencia,
        descricao,
        fornecedor,
        documento,
        categoria,
        valor,
        vencimento,
        status: $('lStatus').value,
        updatedAt: new Date().toISOString()
    };
    
    try {
        if (editId) {
            await updateDoc(doc(db,'lancamentos',editId), data);
            alert('✅ Lançamento atualizado!');
        } else {
            data.createdAt = new Date().toISOString();
            await addDoc(collection(db,'lancamentos'), data);
            alert('✅ Lançamento criado com sucesso!');
        }
        fecharModal('modalLanc');
        await renderClienteDashboard();
    } catch(err) {
        console.error('Erro ao salvar lançamento:', err);
        alert('❌ Erro ao salvar: ' + err.message);
    }
});

window.mudarStatus = async function(id, novoStatus) {
    const audit = getAuditInfo();
    try {
        // Buscar lançamento atual
        const lancSnap = await getDoc(doc(db,'lancamentos',id));
        if (!lancSnap.exists()) return alert('Lançamento não encontrado');
        
        const lanc = lancSnap.data();
        const statusAntigo = lanc.status;
        
        // Atualizar status no lançamento
        await updateDoc(doc(db,'lancamentos',id), {
            status: novoStatus,
            updatedAt: new Date().toISOString(),
            modificadoPor: audit.modificadoPor,
            modificadoEmail: audit.modificadoEmail,
            modificadoEm: audit.modificadoEm
        });
        
        // Atualizar saldo da empresa se mudou para/de "pago"
        const empresaRef = doc(db,'empresas',currentEmpresa.id);
        const empresaSnap = await getDoc(empresaRef);
        if (empresaSnap.exists()) {
            let saldoAtual = empresaSnap.data().saldo || 0;
            let novoSaldo = saldoAtual;
            
            // Se mudou DE outro status PARA pago
            if (statusAntigo !== 'pago' && novoStatus === 'pago') {
                if (lanc.tipo === 'pagar') {
                    novoSaldo = saldoAtual - lanc.valor; // Diminui do caixa
                } else if (lanc.tipo === 'receber') {
                    novoSaldo = saldoAtual + lanc.valor; // Aumenta o caixa
                }
            }
            // Se mudou DE pago PARA outro status (estorno)
            else if (statusAntigo === 'pago' && novoStatus !== 'pago') {
                if (lanc.tipo === 'pagar') {
                    novoSaldo = saldoAtual + lanc.valor; // Devolve ao caixa
                } else if (lanc.tipo === 'receber') {
                    novoSaldo = saldoAtual - lanc.valor; // Remove do caixa
                }
            }
            
            if (novoSaldo !== saldoAtual) {
                await updateDoc(empresaRef, { saldo: novoSaldo, updatedAt: new Date().toISOString() });
                currentEmpresa.saldo = novoSaldo;
            }
        }
        
        await renderClienteDashboard();
    } catch(err) {
        alert('Erro: ' + err.message);
    }
};

window.excluirLanc = function(id, desc) {
    $('confirmMsg').textContent = `Excluir lançamento "${desc}"?`;
    $('confirmBtn').onclick = () => executarExclusao('lancamento', id);
    abrirModal('modalConfirm');
};

function renderLancamentos(lancs, tipo) {
    const tbId = tipo==='pagar' ? 'tbPagar' : 'tbReceber';
    const statusFiltro = $(tipo==='pagar'?'fPagarStatus':'fReceberStatus').value;
    const periodoFiltro = $(tipo==='pagar'?'fPagarPeriodo':'fReceberPeriodo').value;
    const de = $(tipo==='pagar'?'fPagarDe':'fReceberDe').value;
    const ate = $(tipo==='pagar'?'fPagarAte':'fReceberAte').value;

    let items = lancs.filter(l=>l.tipo===tipo);

    // Auto-calcular atrasado
    items = items.map(l => ({ ...l, statusCalc: calcStatus(l.vencimento, l.status) }));

    if (statusFiltro) items = items.filter(l=>l.statusCalc===statusFiltro);
    if (periodoFiltro) items = items.filter(l=>filtroPeriodo(l.vencimento, periodoFiltro));
    if (de) items = items.filter(l=>l.vencimento>=de);
    if (ate) items = items.filter(l=>l.vencimento<=ate);

    items.sort((a,b)=>a.vencimento.localeCompare(b.vencimento));

    const tb = $(tbId);
    if (!items.length) { tb.innerHTML='<tr class="empty-row"><td colspan="6">Nenhum lançamento encontrado</td></tr>'; return; }

    const isPagar = tipo==='pagar';
    tb.innerHTML = items.map(l => {
        const s = l.statusCalc;
        const statusOpts = isPagar
            ? `<button class="btn-sm ${s==='pago'?'btn-sm-success':'btn-sm-light'}" onclick="mudarStatus('${l.id}','pago')">✓ Pago</button>
               <button class="btn-sm ${s==='aberto'?'btn-sm-warning':'btn-sm-light'}" onclick="mudarStatus('${l.id}','aberto')">Em Aberto</button>
               <button class="btn-sm ${s==='atrasado'?'btn-sm-danger':'btn-sm-light'}" onclick="mudarStatus('${l.id}','atrasado')">Atrasado</button>`
            : `<button class="btn-sm ${s==='pago'?'btn-sm-success':'btn-sm-light'}" onclick="mudarStatus('${l.id}','pago')">✓ Recebido</button>
               <button class="btn-sm ${s==='aberto'?'btn-sm-warning':'btn-sm-light'}" onclick="mudarStatus('${l.id}','aberto')">Em Aberto</button>
               <button class="btn-sm ${s==='atrasado'?'btn-sm-danger':'btn-sm-light'}" onclick="mudarStatus('${l.id}','atrasado')">Atrasado</button>`;

        return `<tr>
            <td><strong>${fmtMonth(l.competencia)}</strong></td>
            <td>${fmtDate(l.vencimento)}</td>
            <td>${l.descricao}</td>
            <td>${fmtMoney(l.valor)}</td>
            <td><span class="badge badge-${s}">${s==='pago'?(isPagar?'Pago':'Recebido'):s==='atrasado'?'Atrasado':'Em Aberto'}</span></td>
            <td><div class="actions">
                ${statusOpts}
                <button class="btn-sm btn-sm-primary" onclick="editarLanc('${l.id}')">✏️</button>
                <button class="btn-sm btn-sm-danger" onclick="excluirLanc('${l.id}','${l.descricao}')">🗑️</button>
            </div></td>
        </tr>`;
    }).join('');
}

async function renderPagar(lancs) {
    if (!lancs) {
        const snap = await getDocs(query(collection(db,'lancamentos'), where('empresaId','==',currentEmpresa.id)));
        lancs = snap.docs.map(d=>({...d.data(), id:d.id}));
    }
    renderLancamentos(lancs, 'pagar');
}

async function renderReceber(lancs) {
    if (!lancs) {
        const snap = await getDocs(query(collection(db,'lancamentos'), where('empresaId','==',currentEmpresa.id)));
        lancs = snap.docs.map(d=>({...d.data(), id:d.id}));
    }
    renderLancamentos(lancs, 'receber');
}

window.renderPagar = renderPagar;
window.renderReceber = renderReceber;

window.limparFiltros = function(tipo) {
    if (tipo==='pagar') {
        $('fPagarStatus').value=''; $('fPagarPeriodo').value=''; $('fPagarDe').value=''; $('fPagarAte').value='';
        renderPagar();
    } else {
        $('fReceberStatus').value=''; $('fReceberPeriodo').value=''; $('fReceberDe').value=''; $('fReceberAte').value='';
        renderReceber();
    }
};

// ===================== FLUXO DE CAIXA =====================
function renderFluxo(lancs) {
    const hoje = new Date(), mes = hoje.getMonth(), ano = hoje.getFullYear();
    const doMes = lancs.filter(l=>{ const v=new Date(l.vencimento); return v.getMonth()===mes&&v.getFullYear()===ano; });

    const entProj = doMes.filter(l=>l.tipo==='receber').reduce((s,l)=>s+l.valor,0);
    const entReal = doMes.filter(l=>l.tipo==='receber'&&l.status==='pago').reduce((s,l)=>s+l.valor,0);
    const saiProj = doMes.filter(l=>l.tipo==='pagar').reduce((s,l)=>s+l.valor,0);
    const saiReal = doMes.filter(l=>l.tipo==='pagar'&&l.status==='pago').reduce((s,l)=>s+l.valor,0);
    
    // Calcular saldo real baseado em TODOS os lançamentos pagos desde sempre
    const saldoInicial = currentEmpresa.saldo||0;
    const todasReceitasPagas = lancs.filter(l=>l.tipo==='receber'&&l.status==='pago').reduce((s,l)=>s+l.valor,0);
    const todasDespesasPagas = lancs.filter(l=>l.tipo==='pagar'&&l.status==='pago').reduce((s,l)=>s+l.valor,0);
    const saldoAtualReal = saldoInicial + todasReceitasPagas - todasDespesasPagas;

    const row = (label, proj, real, cls='') => {
        const dif = real - proj;
        return `<tr class="${cls}">
            <td>${label}</td>
            <td style="text-align:right">${fmtMoney(proj)}</td>
            <td style="text-align:right">${fmtMoney(real)}</td>
            <td style="text-align:right;color:${dif>=0?'var(--success)':'var(--danger)'}">${fmtMoney(dif)}</td>
        </tr>`;
    };

    $('tbFluxo').innerHTML =
        `<tr class="total-row"><td colspan="4" style="text-align:center;padding:15px;"><strong>💰 SALDO EM CAIXA ATUAL: ${fmtMoney(saldoAtualReal)}</strong></td></tr>` +
        `<tr><td colspan="4" style="padding:10px;background:#f8f9fa;"><strong>Movimentação do Mês Atual:</strong></td></tr>` +
        row('Saldo Início do Mês', saldoAtualReal - entReal + saiReal, saldoAtualReal - entReal + saiReal, 'subtotal') +
        row('(+) Entradas', entProj, entReal) +
        row('(-) Saídas', saiProj, saiReal) +
        row('= Saldo Final do Mês', (saldoAtualReal - entReal + saiReal) + entProj - saiProj, saldoAtualReal, 'subtotal');
}

// ===================== DRE EDITÁVEL EM COLUNAS =====================
const DRE_ROWS = [
    { key:'receitaBruta', label:'RECEITA BRUTA', tipo:'subtotal' },
    { key:'impostos', label:'(-) Impostos s/ Vendas', tipo:'item' },
    { key:'receitaLiquida', label:'= RECEITA LÍQUIDA', tipo:'subtotal', calc: d => (d.receitaBruta||0)-(d.impostos||0) },
    { key:'cmv', label:'(-) CMV / Custos Variáveis', tipo:'item' },
    { key:'margemContrib', label:'= MARGEM DE CONTRIBUIÇÃO', tipo:'subtotal', calc: d => (d.receitaBruta||0)-(d.impostos||0)-(d.cmv||0) },
    { key:'despesasAdm', label:'(-) Despesas ADM / Operacionais', tipo:'item' },
    { key:'folhaPagamento', label:'(-) Folha de Pagamento', tipo:'item' },
    { key:'outrosCustos', label:'(-) Outros Custos', tipo:'item' },
    { key:'lucroOperacional', label:'= LUCRO OPERACIONAL', tipo:'subtotal', calc: d => (d.receitaBruta||0)-(d.impostos||0)-(d.cmv||0)-(d.despesasAdm||0)-(d.folhaPagamento||0)-(d.outrosCustos||0) },
    { key:'lucroLiquido', label:'= LUCRO LÍQUIDO', tipo:'total', calc: d => (d.receitaBruta||0)-(d.impostos||0)-(d.cmv||0)-(d.despesasAdm||0)-(d.folhaPagamento||0)-(d.outrosCustos||0) },
];

function initDREAno() {
    const sel = $('dreFiltroAno');
    const anoAtual = new Date().getFullYear();
    sel.innerHTML = '';
    for (let a = anoAtual; a >= anoAtual-3; a--) {
        sel.innerHTML += `<option value="${a}" ${a===anoAtual?'selected':''}>${a}</option>`;
    }
    renderDRE();
}

window.renderDRE = async function() {
    const ano = parseInt($('dreFiltroAno').value);
    const meses = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

    // Carregar TODOS os lançamentos do ano
    const lancSnap = await getDocs(query(
        collection(db,'lancamentos'),
        where('empresaId','==',currentEmpresa.id)
    ));
    
    // Processar lançamentos por categoria e mês
    const dadosPorMes = {};
    for (let i = 0; i < 12; i++) {
        dadosPorMes[i] = {}; // Janeiro = 0, Dezembro = 11
    }
    
    lancSnap.forEach(doc => {
        const lanc = doc.data();
        if (!lanc.competencia || !lanc.categoria) return;
        
        const [anoLanc, mesLanc] = lanc.competencia.split('-');
        if (parseInt(anoLanc) !== ano) return;
        
        const mesIdx = parseInt(mesLanc) - 1; // 01 -> 0, 12 -> 11
        const catId = lanc.categoria;
        const valor = parseFloat(lanc.valor) || 0;
        
        if (!dadosPorMes[mesIdx][catId]) {
            dadosPorMes[mesIdx][catId] = 0;
        }
        
        // Receitas: somar positivo, Despesas: somar negativo
        const cat = categorias.find(c => c.id === catId);
        if (cat) {
            if (cat.tipo === 'receita') {
                dadosPorMes[mesIdx][catId] += valor;
            } else {
                dadosPorMes[mesIdx][catId] += valor; // Já será subtraído nos cálculos
            }
        }
    });
    
    // Calcular totais por categoria
    const totaisPorCategoria = {};
    categorias.forEach(cat => {
        let total = 0;
        for (let i = 0; i < 12; i++) {
            total += dadosPorMes[i][cat.id] || 0;
        }
        totaisPorCategoria[cat.id] = total;
    });
    
    // Calcular totais de receita e despesa por mês
    const totaisReceita = Array(12).fill(0);
    const totaisDespesa = Array(12).fill(0);
    const lucroLiquido = Array(12).fill(0);
    
    for (let i = 0; i < 12; i++) {
        categorias.forEach(cat => {
            const valor = dadosPorMes[i][cat.id] || 0;
            if (cat.tipo === 'receita') {
                totaisReceita[i] += valor;
            } else {
                totaisDespesa[i] += valor;
            }
        });
        lucroLiquido[i] = totaisReceita[i] - totaisDespesa[i];
    }
    
    // Totais anuais
    const totalReceitaAnual = totaisReceita.reduce((a,b) => a+b, 0);
    const totalDespesaAnual = totaisDespesa.reduce((a,b) => a+b, 0);
    const lucroAnual = lucroLiquido.reduce((a,b) => a+b, 0);
    
    // Renderizar cabeçalho
    $('dreHead').innerHTML = `<tr>
        <th>DESCRIÇÃO</th>
        ${meses.map(m=>`<th>${m}/${ano}</th>`).join('')}
        <th>TOTAL</th>
    </tr>`;
    
    // Renderizar corpo
    let html = '';
    
    // Botão para adicionar categoria (se admin)
    if (currentUser?.role === 'admin') {
        html += `<tr><td colspan="14" style="padding:10px;text-align:center;">
            <button class="btn btn-add" onclick="window.abrirModalCategoria()" style="font-size:12px;padding:6px 12px;">
                + Adicionar Nova Categoria DRE
            </button>
        </td></tr>`;
    }
    
    // Receitas
    html += `<tr class="subtotal"><td colspan="14"><strong>💰 RECEITAS</strong></td></tr>`;
    categorias.filter(c => c.tipo === 'receita').forEach(cat => {
        html += `<tr>
            <td>${cat.nome}</td>
            ${Array(12).fill(0).map((_, i) => `<td>${fmtMoney(dadosPorMes[i][cat.id] || 0)}</td>`).join('')}
            <td><strong>${fmtMoney(totaisPorCategoria[cat.id] || 0)}</strong></td>
        </tr>`;
    });
    
    html += `<tr class="subtotal">
        <td><strong>= RECEITA BRUTA</strong></td>
        ${totaisReceita.map(v => `<td><strong>${fmtMoney(v)}</strong></td>`).join('')}
        <td><strong>${fmtMoney(totalReceitaAnual)}</strong></td>
    </tr>`;
    
    // Despesas
    html += `<tr class="subtotal"><td colspan="14"><strong>💸 DESPESAS</strong></td></tr>`;
    categorias.filter(c => c.tipo === 'despesa').forEach(cat => {
        html += `<tr>
            <td>(-) ${cat.nome}</td>
            ${Array(12).fill(0).map((_, i) => `<td>${fmtMoney(dadosPorMes[i][cat.id] || 0)}</td>`).join('')}
            <td><strong>${fmtMoney(totaisPorCategoria[cat.id] || 0)}</strong></td>
        </tr>`;
    });
    
    html += `<tr class="subtotal">
        <td><strong>= MARGEM DE CONTRIBUIÇÃO</strong></td>
        ${totaisDespesa.map(v => `<td><strong>${fmtMoney(v)}</strong></td>`).join('')}
        <td><strong>${fmtMoney(totalDespesaAnual)}</strong></td>
    </tr>`;
    
    // Lucro Líquido
    html += `<tr class="total-row">
        <td><strong>= LUCRO LÍQUIDO</strong></td>
        ${lucroLiquido.map(v => `<td><strong>${fmtMoney(v)}</strong></td>`).join('')}
        <td><strong>${fmtMoney(lucroAnual)}</strong></td>
    </tr>`;
    
    $('dreBody').innerHTML = html;
};

// Remover funções antigas do DRE
window.onDREChange = function() { };
window.salvarDRE = function() { alert('DRE agora é calculado automaticamente baseado nos lançamentos!'); };

// ===================== TABS =====================
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        const parent = btn.closest('.tabs').nextElementSibling?.parentElement || btn.parentElement.parentElement;
        btn.closest('.tabs').querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        // Find all tab-contents in same scope
        const allTabs = btn.closest('.main-content')?.querySelectorAll('.tab-content') || document.querySelectorAll('.tab-content');
        allTabs.forEach(c=>c.classList.remove('active'));
        const target = document.getElementById(tab);
        if (target) target.classList.add('active');
        if (tab === 'tabDRE') renderDRE();
        if (tab === 'tabCategorias') renderCategoriasAdmin();
        if (tab === 'tabUpload') {
            // Resetar estado da aba Upload
            hide('uploadProcessing');
            hide('uploadPreview');
            show('uploadDropZone');
            window.uploadPendentes = [];
            const input = $('uploadInput');
            if (input) input.value = '';
        }
        if (tab === 'tabUploadAdmin') {
            // Resetar estado da aba Upload Admin
            hide('uploadProcessingAdmin');
            hide('uploadPreviewAdmin');
            show('uploadDropZoneAdmin');
            window.uploadPendentesAdmin = [];
            const input = $('uploadInputAdmin');
            if (input) input.value = '';
        }
    });
});

// ===================== MODALS =====================
window.abrirModal = function(id) { $(id).classList.add('active'); };
window.fecharModal = function(id) { $(id).classList.remove('active'); };
window.onclick = e => { if (e.target.classList.contains('modal')) e.target.classList.remove('active'); };

// ===================== UPLOAD ADMIN =====================
// Variáveis já declaradas no STATE global

// Carregar lista de empresas no select quando mostrar painel admin
async function carregarEmpresasUpload() {
    const select = $('adminUploadEmpresa');
    if (!select) return;
    
    try {
        const empresasSnap = await getDocs(collection(db, 'empresas'));
        select.innerHTML = '<option value="">-- Selecione uma empresa --</option>';
        empresasSnap.forEach(doc => {
            const e = doc.data();
            select.innerHTML += `<option value="${doc.id}">${e.razaoSocial}</option>`;
        });
        
        // Listener para habilitar/desabilitar dropzone
        select.addEventListener('change', function() {
            const dropZone = $('uploadDropZoneAdmin');
            if (this.value) {
                dropZone.style.opacity = '1';
                dropZone.style.cursor = 'pointer';
                window.empresaSelecionadaUpload = this.value;
            } else {
                dropZone.style.opacity = '0.5';
                dropZone.style.cursor = 'not-allowed';
                window.empresaSelecionadaUpload = null;
            }
        });
    } catch (err) {
        console.error('Erro ao carregar empresas:', err);
    }
}

window.iniciarUploadAdmin = function() {
    if (!window.empresaSelecionadaUpload) {
        alert('⚠️ Selecione uma empresa primeiro!');
        return;
    }
    $('uploadInputAdmin').click();
};

// Drag and drop admin
const dropZoneAdmin = $('uploadDropZoneAdmin');
if (dropZoneAdmin) {
    dropZoneAdmin.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (empresaSelecionadaUpload) {
            dropZoneAdmin.style.borderColor = 'var(--success)';
            dropZoneAdmin.style.background = '#e8f5e9';
        }
    });
    dropZoneAdmin.addEventListener('dragleave', () => {
        dropZoneAdmin.style.borderColor = 'var(--border)';
        dropZoneAdmin.style.background = 'var(--light)';
    });
    dropZoneAdmin.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZoneAdmin.style.borderColor = 'var(--border)';
        dropZoneAdmin.style.background = 'var(--light)';
        if (empresaSelecionadaUpload) {
            processarArquivosAdmin(e.dataTransfer.files);
        } else {
            alert('⚠️ Selecione uma empresa primeiro!');
        }
    });
}

window.processarArquivosAdmin = async function(files) {
    if (!window.empresaSelecionadaUpload) {
        alert('⚠️ Selecione uma empresa primeiro!');
        return;
    }
    if (!files || files.length === 0) return;
    
    show('uploadProcessingAdmin');
    hide('uploadDropZoneAdmin');
    hide('uploadPreviewAdmin');
    window.uploadPendentesAdmin = [];

    for (const file of files) {
        const ext = file.name.split('.').pop().toLowerCase();
        
        if (['jpg', 'jpeg', 'png', 'pdf'].includes(ext)) {
            await processarImagemAdmin(file);
        } else if (['xlsx', 'xls', 'csv'].includes(ext)) {
            await processarPlanilhaAdmin(file);
        }
    }

    hide('uploadProcessingAdmin');
    if (window.uploadPendentesAdmin.length > 0) {
        window.renderUploadPreviewAdmin();
        show('uploadPreviewAdmin');
    } else {
        show('uploadDropZoneAdmin');
        alert('Nenhum dado válido encontrado nos arquivos.');
    }
};

async function processarImagemAdmin(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataURL = e.target.result;
            
            window.uploadPendentesAdmin.push({
                tipo: 'imagem',
                arquivo: file.name,
                imagemPreview: dataURL,
                competencia: competenciaAtual(),
                descricao: '',
                valor: 0,
                vencimento: today(),
                status: 'aberto'
            });
            resolve();
        };
        reader.readAsDataURL(file);
    });
}

async function processarPlanilhaAdmin(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(firstSheet);
                
                rows.forEach(row => {
                    const desc = row.Descricao || row.descricao || row.Descrição || row.DESCRICAO || '';
                    const valor = parseFloat(String(row.Valor || row.valor || row.VALOR || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
                    const venc = row.Vencimento || row.vencimento || row.VENCIMENTO || today();
                    const comp = row.Competencia || row.competencia || row.Competência || row.COMPETENCIA || competenciaAtual();
                    const status = (row.Status || row.status || row.STATUS || 'aberto').toLowerCase();
                    
                    if (desc && valor > 0) {
                        window.uploadPendentesAdmin.push({
                            tipo: 'planilha',
                            arquivo: file.name,
                            competencia: formatarCompetencia(comp),
                            descricao: desc,
                            valor: valor,
                            vencimento: formatarData(venc),
                            status: ['pago', 'aberto', 'atrasado'].includes(status) ? status : 'aberto'
                        });
                    }
                });
            } catch (err) {
                console.error('Erro ao ler planilha:', err);
            }
            resolve();
        };
        reader.readAsArrayBuffer(file);
    });
}

window.renderUploadPreviewAdmin = function() {
    const list = $('uploadListAdmin');
    list.innerHTML = `
        <div class="table-wrapper">
            <table>
                <thead><tr><th>Preview</th><th>Competência</th><th>Descrição</th><th>Valor</th><th>Vencimento</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                    ${window.uploadPendentesAdmin.map((item, idx) => `
                        <tr>
                            <td>
                                ${item.imagemPreview ? 
                                    `<img src="${item.imagemPreview}" style="max-width:120px;max-height:80px;border:1px solid var(--border);border-radius:8px;cursor:pointer;" onclick="window.open('${item.imagemPreview}', '_blank')" title="Clique para ampliar">` 
                                    : `<small>${item.arquivo}</small>`
                                }
                            </td>
                            <td><input type="month" value="${item.competencia}" onchange="uploadPendentesAdmin[${idx}].competencia = this.value" style="padding:4px;font-size:12px;"></td>
                            <td><input type="text" value="${item.descricao}" onchange="uploadPendentesAdmin[${idx}].descricao = this.value" placeholder="Digite a descrição" style="padding:4px;font-size:12px;width:200px;"></td>
                            <td><input type="number" step="0.01" value="${item.valor}" onchange="uploadPendentesAdmin[${idx}].valor = parseFloat(this.value)" placeholder="0.00" style="padding:4px;font-size:12px;width:100px;"></td>
                            <td><input type="date" value="${item.vencimento}" onchange="uploadPendentesAdmin[${idx}].vencimento = this.value" style="padding:4px;font-size:12px;"></td>
                            <td>
                                <select onchange="uploadPendentesAdmin[${idx}].status = this.value" style="padding:4px;font-size:12px;">
                                    <option value="aberto" ${item.status==='aberto'?'selected':''}>Em Aberto</option>
                                    <option value="pago" ${item.status==='pago'?'selected':''}>Pago</option>
                                    <option value="atrasado" ${item.status==='atrasado'?'selected':''}>Atrasado</option>
                                </select>
                            </td>
                            <td><button class="btn-sm btn-sm-danger" onclick="removerUploadAdmin(${idx})">🗑️</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div style="margin-top:15px;padding:12px;background:#e3f2fd;border-radius:8px;font-size:13px;">
            💡 <strong>Dica:</strong> Clique na imagem para ampliar. Preencha os campos enquanto visualiza o boleto.
        </div>
    `;
}

window.removerUploadAdmin = function(idx) {
    window.uploadPendentesAdmin.splice(idx, 1);
    if (window.uploadPendentesAdmin.length === 0) {
        cancelarUploadAdmin();
    } else {
        window.renderUploadPreviewAdmin();
    }
};

window.confirmarUploadAdmin = async function() {
    if (!window.empresaSelecionadaUpload) {
        alert('⚠️ Empresa não selecionada!');
        return;
    }
    if (window.uploadPendentesAdmin.length === 0) return;
    
    // Validar campos obrigatórios
    const invalidos = window.uploadPendentesAdmin.filter(item => !item.descricao || item.valor <= 0);
    if (invalidos.length > 0) {
        alert('⚠️ Preencha a descrição e o valor de todos os boletos antes de confirmar!');
        return;
    }
    
    show('uploadProcessingAdmin');
    hide('uploadPreviewAdmin');
    
    const audit = getAuditInfo();
    let sucesso = 0;
    
    for (const item of window.uploadPendentesAdmin) {
        try {
            const lancamento = {
                empresaId: window.empresaSelecionadaUpload,
                tipo: 'pagar',
                competencia: item.competencia,
                descricao: item.descricao,
                categoria: item.categoria || 'despesas-adm',
                valor: item.valor,
                vencimento: item.vencimento,
                status: item.status,
                origem: 'upload',
                modificadoPor: audit.modificadoPor,
                modificadoEmail: audit.modificadoEmail,
                modificadoEm: audit.modificadoEm,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            await addDoc(collection(db, 'lancamentos'), lancamento);
            sucesso++;
        } catch (err) {
            console.error('Erro ao lançar:', err);
        }
    }
    
    hide('uploadProcessingAdmin');
    show('uploadDropZoneAdmin');
    window.uploadPendentesAdmin = [];
    $('uploadInputAdmin').value = '';
    $('adminUploadEmpresa').value = '';
    window.empresaSelecionadaUpload = null;
    $('uploadDropZoneAdmin').style.opacity = '0.5';
    
    alert(`✅ ${sucesso} lançamento(s) adicionado(s) com sucesso para a empresa!`);
};

window.cancelarUploadAdmin = function() {
    window.uploadPendentesAdmin = [];
    hide('uploadPreviewAdmin');
    hide('uploadProcessingAdmin');
    show('uploadDropZoneAdmin');
    $('uploadInputAdmin').value = '';
};

// ===================== UPLOAD DE BOLETOS E PLANILHAS =====================
// Variável uploadPendentes já declarada no STATE global

// Drag and drop
const dropZone = document.getElementById('uploadDropZone');
if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--success)';
        dropZone.style.background = '#e8f5e9';
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'var(--light)';
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'var(--light)';
        processarArquivos(e.dataTransfer.files);
    });
}

window.processarArquivos = async function(files) {
    console.log('🚀 processarArquivos chamado com', files?.length, 'arquivo(s)');
    if (!files || files.length === 0) {
        console.log('❌ Nenhum arquivo recebido');
        return;
    }
    
    console.log('📁 Arquivos recebidos:', Array.from(files).map(f => f.name));
    
    // Garantir que categorias estão carregadas
    if (categorias.length === 0) {
        console.log('⏳ Carregando categorias antes do upload...');
        await carregarCategorias(currentEmpresa.id);
        console.log(`✅ ${categorias.length} categorias carregadas`);
    }
    
    show('uploadProcessing');
    hide('uploadDropZone');
    hide('uploadPreview');
    window.uploadPendentes = [];
    console.log('🔄 uploadPendentes resetado');

    for (const file of files) {
        const ext = file.name.split('.').pop().toLowerCase();
        console.log(`📄 Processando ${file.name} (extensão: ${ext})`);
        
        if (['jpg', 'jpeg', 'png', 'pdf'].includes(ext)) {
            console.log('🖼️ Processando como imagem...');
            await processarImagem(file);
        } else if (['xlsx', 'xls', 'csv'].includes(ext)) {
            console.log('📊 Processando como planilha...');
            await processarPlanilha(file);
        } else {
            console.log('⚠️ Extensão não reconhecida:', ext);
        }
    }

    console.log('✅ Processamento concluído. uploadPendentes.length:', window.uploadPendentes.length);
    
    hide('uploadProcessing');
    if (window.uploadPendentes.length > 0) {
        console.log('📋 Renderizando preview...');
        window.renderUploadPreview();
        show('uploadPreview');
    } else {
        console.log('❌ Nenhum dado válido, mostrando dropzone');
        show('uploadDropZone');
        alert('Nenhum dado válido encontrado nos arquivos.');
    }
};

async function processarImagem(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataURL = e.target.result;
            
            // Ao invés de OCR, cria entrada manual com preview da imagem
            window.uploadPendentes.push({
                tipo: 'imagem',
                arquivo: file.name,
                imagemPreview: dataURL,
                competencia: competenciaAtual(),
                descricao: '',
                categoria: 'despesas-adm',
                valor: 0,
                vencimento: today(),
                status: 'aberto'
            });
            resolve();
        };
        reader.readAsDataURL(file);
    });
}

async function processarPlanilha(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(firstSheet);
                
                console.log(`📊 Planilha lida: ${rows.length} linhas`);
                
                rows.forEach((row, index) => {
                    // Detectar colunas (flexível)
                    const desc = row.Descricao || row.descricao || row.Descrição || row.DESCRICAO || '';
                    const valorStr = String(row.Valor || row.valor || row.VALOR || '0');
                    const valor = parseFloat(valorStr.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
                    const venc = row.Vencimento || row.vencimento || row.VENCIMENTO || today();
                    const comp = row.Competencia || row.competencia || row.Competência || row.COMPETENCIA || competenciaAtual();
                    const status = (row.Status || row.status || row.STATUS || 'aberto').toLowerCase();
                    
                    if (desc && valor > 0) {
                        const item = {
                            tipo: 'planilha',
                            arquivo: file.name,
                            competencia: formatarCompetencia(comp),
                            descricao: desc,
                            categoria: 'despesas-adm', // Categoria padrão, pode ser alterada na preview
                            valor: valor,
                            vencimento: formatarData(venc),
                            status: ['pago', 'aberto', 'atrasado'].includes(status) ? status : 'aberto'
                        };
                        console.log(`✅ Linha ${index + 1} adicionada:`, desc, valor);
                        window.uploadPendentes.push(item);
                    } else {
                        console.log(`⚠️ Linha ${index + 1} ignorada: desc="${desc}" valor=${valor}`);
                    }
                });
                
                console.log(`📦 Total processado: ${window.uploadPendentes.length} itens`);
            } catch (err) {
                console.error('❌ Erro ao ler planilha:', err);
            }
            resolve();
        };
        reader.readAsArrayBuffer(file);
    });
}

function formatarCompetencia(valor) {
    if (!valor) return competenciaAtual();
    const str = String(valor);
    // Se já está no formato YYYY-MM
    if (/^\d{4}-\d{2}$/.test(str)) return str;
    // Se está como MM/YYYY
    if (/^\d{2}\/\d{4}$/.test(str)) {
        const [m, y] = str.split('/');
        return `${y}-${m}`;
    }
    // Se é só número (ex: 2/2026 do Excel)
    const match = str.match(/(\d{1,2})\D*(\d{4})/);
    if (match) {
        return `${match[2]}-${match[1].padStart(2, '0')}`;
    }
    return competenciaAtual();
}

function formatarData(valor) {
    if (!valor) return today();
    const str = String(valor);
    // Se já está no formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    // Se está como DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
        const [d, m, y] = str.split('/');
        return `${y}-${m}-${d}`;
    }
    // Data do Excel (número de dias desde 1900)
    if (!isNaN(valor) && valor > 40000 && valor < 60000) {
        const date = new Date((valor - 25569) * 86400 * 1000);
        return date.toISOString().split('T')[0];
    }
    return today();
}

function parsearTextoBoleto(texto) {
    const resultado = { valor: null, vencimento: null, descricao: null };
    
    // Valor
    const regexValor = [/R\$\s*([\d.,]+)/i, /[Vv]alor[:\s]+R?\$?\s*([\d.,]+)/i, /(?:TOTAL|Total)[:\s]+R?\$?\s*([\d.,]+)/i];
    for (const r of regexValor) {
        const m = texto.match(r);
        if (m) {
            const num = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
            if (!isNaN(num) && num > 0) { resultado.valor = num; break; }
        }
    }
    
    // Vencimento
    const regexVenc = [/[Vv]encimento[:\s]+(\d{2}\/\d{2}\/\d{4})/, /(\d{2}\/\d{2}\/\d{4})/];
    for (const r of regexVenc) {
        const m = texto.match(r);
        if (m) {
            const [d, mo, a] = m[1].split('/');
            resultado.vencimento = `${a}-${mo}-${d}`;
            break;
        }
    }
    
    // Descrição
    const regexDesc = [/[Bb]enefici[áa]rio[:\s]+([^\n]+)/, /[Cc]edente[:\s]+([^\n]+)/, /[Ee]mpresa[:\s]+([^\n]+)/];
    for (const r of regexDesc) {
        const m = texto.match(r);
        if (m && m[1].trim().length > 2) {
            resultado.descricao = m[1].trim().slice(0, 80);
            break;
        }
    }
    if (!resultado.descricao) {
        const linhas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 5);
        resultado.descricao = linhas[0]?.slice(0, 60) || 'Boleto via Upload';
    }
    
    return resultado;
}

window.renderUploadPreview = function() {
    const list = $('uploadList');
    console.log('📋 Renderizando preview com', window.uploadPendentes.length, 'itens');
    
    // Garantir categoria padrão
    window.uploadPendentes.forEach(item => {
        if (!item.categoria) item.categoria = 'despesas-adm';
        if (!item.fornecedor) item.fornecedor = '';
        if (!item.documento) item.documento = '';
    });
    
    const catDespesas = categorias.filter(c => c.tipo === 'despesa');
    console.log('📊 Categorias disponíveis:', catDespesas.length);
    
    if (catDespesas.length === 0) {
        console.error('❌ Nenhuma categoria de despesa encontrada!');
        alert('⚠️ Nenhuma categoria encontrada! Crie categorias antes de fazer upload.');
        return;
    }
    
    list.innerHTML = `
        <div class="table-wrapper">
            <table>
                <thead><tr><th>Preview</th><th>Competência</th><th>Descrição</th><th>Fornecedor/Cliente</th><th>Nº Doc</th><th>Categoria</th><th>Valor</th><th>Vencimento</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                    ${window.uploadPendentes.map((item, idx) => `
                        <tr>
                            <td>
                                ${item.imagemPreview ? 
                                    `<img src="${item.imagemPreview}" style="max-width:100px;max-height:60px;border:1px solid var(--border);border-radius:8px;cursor:pointer;" onclick="window.open('${item.imagemPreview}', '_blank')" title="Clique para ampliar">` 
                                    : `<small style="font-size:11px;">${item.arquivo}</small>`
                                }
                            </td>
                            <td><input type="month" value="${item.competencia}" onchange="window.uploadPendentes[${idx}].competencia = this.value" style="padding:4px;font-size:12px;width:110px;" required></td>
                            <td><input type="text" value="${item.descricao}" onchange="window.uploadPendentes[${idx}].descricao = this.value" placeholder="Descrição *" style="padding:4px;font-size:12px;width:150px;" required></td>
                            <td><input type="text" value="${item.fornecedor||''}" onchange="window.uploadPendentes[${idx}].fornecedor = this.value" placeholder="Fornecedor *" style="padding:4px;font-size:12px;width:140px;" required></td>
                            <td><input type="text" value="${item.documento||''}" onchange="window.uploadPendentes[${idx}].documento = this.value" placeholder="NF 123 *" style="padding:4px;font-size:12px;width:100px;" required></td>
                            <td>
                                <select onchange="window.uploadPendentes[${idx}].categoria = this.value" style="padding:4px;font-size:12px;width:130px;" required>
                                    ${catDespesas.map(cat => `<option value="${cat.id}" ${item.categoria===cat.id?'selected':''}>${cat.nome}</option>`).join('')}
                                </select>
                            </td>
                            <td><input type="number" step="0.01" value="${item.valor}" onchange="window.uploadPendentes[${idx}].valor = parseFloat(this.value)" placeholder="0.00 *" style="padding:4px;font-size:12px;width:90px;" required></td>
                            <td><input type="date" value="${item.vencimento}" onchange="window.uploadPendentes[${idx}].vencimento = this.value" style="padding:4px;font-size:12px;width:125px;" required></td>
                            <td>
                                <select onchange="window.uploadPendentes[${idx}].status = this.value" style="padding:4px;font-size:12px;width:100px;">
                                    <option value="aberto" ${item.status==='aberto'?'selected':''}>Em Aberto</option>
                                    <option value="pago" ${item.status==='pago'?'selected':''}>Pago</option>
                                    <option value="atrasado" ${item.status==='atrasado'?'selected':''}>Atrasado</option>
                                </select>
                            </td>
                            <td><button class="btn-sm btn-sm-danger" onclick="removerUpload(${idx})">🗑️</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div style="margin-top:15px;padding:12px;background:#fff3cd;border-radius:8px;font-size:13px;border-left:4px solid #ffc107;">
            ⚠️ <strong>ATENÇÃO:</strong> Preencha TODOS os campos obrigatórios (*) antes de confirmar!<br>
            💡 <strong>Dica:</strong> Clique na imagem para ampliar e conferir os dados.
        </div>
    `;
    console.log('✅ Preview renderizado com sucesso');
};

window.removerUpload = function(idx) {
    window.uploadPendentes.splice(idx, 1);
    if (window.uploadPendentes.length === 0) {
        cancelarUpload();
    } else {
        window.renderUploadPreview();
    }
};

window.confirmarUpload = async function() {
    if (window.uploadPendentes.length === 0) return;
    
    // VALIDAÇÃO RIGOROSA
    const invalidos = [];
    window.uploadPendentes.forEach((item, idx) => {
        const erros = [];
        if (!item.competencia) erros.push('Competência');
        if (!item.descricao || item.descricao.trim() === '') erros.push('Descrição');
        if (!item.fornecedor || item.fornecedor.trim() === '') erros.push('Fornecedor/Cliente');
        if (!item.documento || item.documento.trim() === '') erros.push('Nº Documento');
        if (!item.categoria) erros.push('Categoria');
        if (!item.valor || item.valor <= 0) erros.push('Valor');
        if (!item.vencimento) erros.push('Vencimento');
        
        if (erros.length > 0) {
            invalidos.push({ linha: idx + 1, erros });
        }
    });
    
    if (invalidos.length > 0) {
        const msg = invalidos.map(inv => 
            `Linha ${inv.linha}: Faltam - ${inv.erros.join(', ')}`
        ).join('\n');
        alert(`⚠️ Preencha TODOS os campos obrigatórios antes de confirmar!\n\n${msg}`);
        return;
    }
    
    show('uploadProcessing');
    hide('uploadPreview');
    
    const audit = getAuditInfo();
    let sucesso = 0;
    let erros = 0;
    
    for (const item of window.uploadPendentes) {
        try {
            const lancamento = {
                empresaId: currentEmpresa.id,
                tipo: 'pagar',
                competencia: item.competencia,
                descricao: item.descricao.trim(),
                fornecedor: item.fornecedor.trim(),
                documento: item.documento.trim(),
                categoria: item.categoria,
                valor: item.valor,
                vencimento: item.vencimento,
                status: item.status,
                origem: 'upload',
                modificadoPor: audit.modificadoPor,
                modificadoEmail: audit.modificadoEmail,
                modificadoEm: audit.modificadoEm,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            await addDoc(collection(db, 'lancamentos'), lancamento);
            sucesso++;
        } catch (err) {
            console.error('Erro ao lançar:', err);
            erros++;
        }
    }
    
    hide('uploadProcessing');
    show('uploadDropZone');
    window.uploadPendentes = [];
    $('uploadInput').value = '';
    
    if (erros > 0) {
        alert(`✅ ${sucesso} lançamento(s) adicionado(s) com sucesso!\n⚠️ ${erros} erro(s) encontrado(s).`);
    } else {
        alert(`✅ ${sucesso} lançamento(s) adicionado(s) com sucesso!`);
    }
    
    await renderClienteDashboard();
};
    await renderClienteDashboard();
};

window.cancelarUpload = function() {
    window.uploadPendentes = [];
    hide('uploadPreview');
    hide('uploadProcessing');
    show('uploadDropZone');
    $('uploadInput').value = '';
};

// ===================== GRÁFICOS =====================
let chartReceitasDespesas, chartDespesasCategoria, chartEvolucaoSaldo;

async function renderizarGraficos() {
    const snap = await getDocs(query(collection(db,'lancamentos'), where('empresaId','==',currentEmpresa.id)));
    const lancs = snap.docs.map(d=>({...d.data(), id:d.id}));
    
    // 1. RECEITAS VS DESPESAS (6 MESES)
    renderGraficoReceitasDespesas(lancs);
    
    // 2. DESPESAS POR CATEGORIA
    renderGraficoDespesasCategoria(lancs);
    
    // 3. EVOLUÇÃO DO SALDO
    renderGraficoEvolucaoSaldo(lancs);
}

function renderGraficoReceitasDespesas(lancs) {
    const ctx = document.getElementById('chartReceitasDespesas');
    if (!ctx) return;
    
    // Destruir gráfico anterior se existir
    if (chartReceitasDespesas) chartReceitasDespesas.destroy();
    
    // Calcular últimos 6 meses
    const hoje = new Date();
    const meses = [];
    const labels = [];
    
    for (let i = 5; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        meses.push({ mes: data.getMonth(), ano: data.getFullYear() });
        labels.push(data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
    }
    
    const receitas = meses.map(({mes, ano}) => {
        return lancs
            .filter(l => {
                const d = new Date(l.vencimento);
                return l.tipo === 'receber' && l.status === 'pago' && d.getMonth() === mes && d.getFullYear() === ano;
            })
            .reduce((sum, l) => sum + (l.valor || 0), 0);
    });
    
    const despesas = meses.map(({mes, ano}) => {
        return lancs
            .filter(l => {
                const d = new Date(l.vencimento);
                return l.tipo === 'pagar' && l.status === 'pago' && d.getMonth() === mes && d.getFullYear() === ano;
            })
            .reduce((sum, l) => sum + (l.valor || 0), 0);
    });
    
    chartReceitasDespesas = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: receitas,
                    backgroundColor: '#10b981',
                    borderColor: '#059669',
                    borderWidth: 1
                },
                {
                    label: 'Despesas',
                    data: despesas,
                    backgroundColor: '#ef4444',
                    borderColor: '#dc2626',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': R$ ' + context.parsed.y.toFixed(2).replace('.', ',');
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

function renderGraficoDespesasCategoria(lancs) {
    const ctx = document.getElementById('chartDespesasCategoria');
    if (!ctx) return;
    
    // Destruir gráfico anterior
    if (chartDespesasCategoria) chartDespesasCategoria.destroy();
    
    // Agrupar despesas pagas por categoria
    const despesasPorCat = {};
    
    lancs
        .filter(l => l.tipo === 'pagar' && l.status === 'pago' && l.categoria)
        .forEach(l => {
            const cat = categorias.find(c => c.id === l.categoria);
            const nome = cat ? cat.nome : 'Sem categoria';
            despesasPorCat[nome] = (despesasPorCat[nome] || 0) + (l.valor || 0);
        });
    
    const labels = Object.keys(despesasPorCat);
    const valores = Object.values(despesasPorCat);
    
    if (labels.length === 0) {
        // Sem dados
        const noData = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Sem dados'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#e5e7eb']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });
        return;
    }
    
    // Cores variadas
    const cores = [
        '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
        '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
    ];
    
    chartDespesasCategoria = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: cores.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { padding: 10, font: { size: 11 } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const valor = context.parsed;
                            const total = context.dataset.data.reduce((a,b) => a+b, 0);
                            const percent = ((valor/total)*100).toFixed(1);
                            return context.label + ': R$ ' + valor.toFixed(2).replace('.', ',') + ' (' + percent + '%)';
                        }
                    }
                }
            }
        }
    });
}

function renderGraficoEvolucaoSaldo(lancs) {
    const ctx = document.getElementById('chartEvolucaoSaldo');
    if (!ctx) return;
    
    // Destruir gráfico anterior
    if (chartEvolucaoSaldo) chartEvolucaoSaldo.destroy();
    
    // Calcular evolução do saldo nos últimos 6 meses
    const hoje = new Date();
    const meses = [];
    const labels = [];
    
    for (let i = 5; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        meses.push({ mes: data.getMonth(), ano: data.getFullYear() });
        labels.push(data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }));
    }
    
    let saldoAcumulado = currentEmpresa.saldo || 0;
    const saldos = [];
    
    meses.forEach(({mes, ano}) => {
        const receitasDoMes = lancs
            .filter(l => {
                const d = new Date(l.vencimento);
                return l.tipo === 'receber' && l.status === 'pago' && d.getMonth() === mes && d.getFullYear() === ano;
            })
            .reduce((sum, l) => sum + (l.valor || 0), 0);
        
        const despesasDoMes = lancs
            .filter(l => {
                const d = new Date(l.vencimento);
                return l.tipo === 'pagar' && l.status === 'pago' && d.getMonth() === mes && d.getFullYear() === ano;
            })
            .reduce((sum, l) => sum + (l.valor || 0), 0);
        
        saldoAcumulado += receitasDoMes - despesasDoMes;
        saldos.push(saldoAcumulado);
    });
    
    chartEvolucaoSaldo = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Saldo',
                data: saldos,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Saldo: R$ ' + context.parsed.y.toFixed(2).replace('.', ',');
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

// ===================== START =====================
init();

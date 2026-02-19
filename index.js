<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rufo Gestão - Sistema Financeiro</title>
    <link rel="manifest" href="manifest.json">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
            --primary: #1e3a5f; --secondary: #2c5f8d; --success: #10b981;
            --warning: #f59e0b; --danger: #ef4444; --light: #f8fafc;
            --white: #ffffff; --border: #e2e8f0; --text: #1e293b; --text-light: #64748b;
        }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: var(--light); color: var(--text); }

        /* LOADING */
        #loadingScreen { position:fixed; top:0; left:0; width:100%; height:100%; background: linear-gradient(135deg,var(--primary),var(--secondary)); display:flex; align-items:center; justify-content:center; z-index:9999; flex-direction:column; gap:20px; }
        .loading-spinner { width:50px; height:50px; border:4px solid rgba(255,255,255,0.3); border-top:4px solid white; border-radius:50%; animation:spin 1s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .loading-text { color:white; font-size:18px; font-weight:600; }

        /* LOGIN */
        .login-screen { min-height:100vh; background:linear-gradient(135deg,var(--primary),var(--secondary)); display:flex; align-items:center; justify-content:center; padding:20px; }
        .login-container { background:white; border-radius:20px; box-shadow:0 20px 60px rgba(0,0,0,0.3); width:900px; max-width:100%; display:flex; animation:slideUp 0.5s; }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .login-left { flex:1; background:linear-gradient(135deg,var(--primary),var(--secondary)); padding:60px 40px; color:white; border-radius:20px 0 0 20px; display:flex; flex-direction:column; justify-content:center; }
        .login-logo { width:150px; margin-bottom:20px; }
        .login-left h1 { font-size:28px; font-weight:700; margin-bottom:8px; }
        .login-left p { font-size:14px; opacity:0.9; }
        .login-right { flex:1; padding:60px 40px; }
        .login-right h2 { font-size:28px; color:var(--primary); margin-bottom:8px; }
        .login-right p { color:var(--text-light); font-size:14px; margin-bottom:30px; }

        /* FORMS */
        .form-group { margin-bottom:20px; }
        .form-group label { display:block; font-size:14px; font-weight:600; margin-bottom:8px; }
        .form-group input, .form-group select, .form-group textarea {
            width:100%; padding:12px 16px; border:2px solid var(--border); border-radius:10px; font-size:15px; transition:all 0.3s; font-family:inherit;
        }
        .form-group input:focus, .form-group select:focus { outline:none; border-color:var(--secondary); box-shadow:0 0 0 3px rgba(44,95,141,0.1); }

        /* BUTTONS */
        .btn { padding:12px 24px; border:none; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.3s; display:inline-flex; align-items:center; gap:8px; }
        .btn-primary { background:linear-gradient(135deg,var(--success),#059669); color:white; width:100%; justify-content:center; }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 10px 25px rgba(16,185,129,0.3); }
        .btn-add { background:var(--success); color:white; }
        .btn-secondary { background:var(--secondary); color:white; }
        .btn-danger { background:var(--danger); color:white; }
        .btn-warning { background:var(--warning); color:white; }
        .btn-light { background:var(--border); color:var(--text); }

        /* NAVBAR */
        .navbar { background:white; padding:15px 30px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 10px rgba(0,0,0,0.05); position:sticky; top:0; z-index:100; }
        .navbar-brand { display:flex; align-items:center; gap:12px; }
        .navbar-logo { width:45px; }
        .navbar-title h3 { font-size:18px; color:var(--primary); }
        .navbar-title p { font-size:12px; color:var(--text-light); }
        .navbar-right { display:flex; align-items:center; gap:15px; }
        .user-badge { background:var(--light); padding:8px 15px; border-radius:20px; font-size:13px; }
        .user-badge strong { color:var(--primary); }
        .btn-nav { padding:8px 16px; border:none; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; }
        .btn-logout { background:var(--danger); color:white; }
        .btn-back { background:var(--secondary); color:white; }

        /* MAIN */
        .main-content { padding:30px; max-width:1600px; margin:0 auto; }

        /* STATS */
        .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:20px; margin-bottom:30px; }
        .stat-card { background:white; padding:20px; border-radius:15px; box-shadow:0 2px 10px rgba(0,0,0,0.05); }
        .stat-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
        .stat-title { font-size:13px; color:var(--text-light); font-weight:500; }
        .stat-icon { font-size:24px; }
        .stat-value { font-size:28px; font-weight:700; color:var(--primary); }
        .stat-value.green { color:var(--success); }
        .stat-value.red { color:var(--danger); }

        /* SECTION */
        .section-card { background:white; padding:25px; border-radius:15px; box-shadow:0 2px 10px rgba(0,0,0,0.05); margin-bottom:25px; }
        .section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px; }
        .section-title { font-size:20px; color:var(--primary); font-weight:700; }

        /* TABS */
        .tabs { background:white; padding:15px 20px; border-radius:15px; margin-bottom:25px; display:flex; gap:10px; flex-wrap:wrap; box-shadow:0 2px 10px rgba(0,0,0,0.05); overflow-x:auto; }
        .tab-btn { padding:10px 20px; background:transparent; border:2px solid var(--border); border-radius:10px; cursor:pointer; font-weight:600; font-size:13px; transition:all 0.3s; white-space:nowrap; }
        .tab-btn.active { background:var(--primary); color:white; border-color:var(--primary); }
        .tab-content { display:none; }
        .tab-content.active { display:block; }

        /* TABLE */
        .table-wrapper { overflow-x:auto; }
        table { width:100%; border-collapse:collapse; min-width:600px; }
        thead { background:var(--light); }
        th { padding:12px 15px; text-align:left; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:var(--text-light); }
        td { padding:14px 15px; border-bottom:1px solid var(--border); font-size:13px; }
        tr:hover { background:#fafafa; }
        .empty-row td { text-align:center; padding:40px; color:var(--text-light); }

        /* STATUS */
        .badge { padding:5px 12px; border-radius:20px; font-size:11px; font-weight:700; display:inline-block; }
        .badge-pago { background:#d1fae5; color:#065f46; }
        .badge-aberto { background:#fef3c7; color:#92400e; }
        .badge-atrasado { background:#fee2e2; color:#991b1b; }
        .badge-admin { background:#dbeafe; color:#1e40af; }
        .badge-client { background:#f3e8ff; color:#6b21a8; }

        /* ACTIONS */
        .actions { display:flex; gap:5px; flex-wrap:wrap; }
        .btn-sm { padding:5px 10px; border:none; border-radius:6px; cursor:pointer; font-size:11px; font-weight:600; }
        .btn-sm-success { background:var(--success); color:white; }
        .btn-sm-primary { background:var(--secondary); color:white; }
        .btn-sm-danger { background:var(--danger); color:white; }
        .btn-sm-warning { background:var(--warning); color:white; }
        .btn-sm-light { background:#e2e8f0; color:var(--text); }

        /* FILTERS */
        .filters { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:20px; padding:15px; background:var(--light); border-radius:10px; align-items:flex-end; }
        .filter-group { flex:1; min-width:160px; }
        .filter-group label { display:block; font-size:12px; font-weight:600; margin-bottom:5px; }
        .filter-group select, .filter-group input { width:100%; padding:8px 12px; border:2px solid var(--border); border-radius:8px; font-size:13px; }

        /* MODAL */
        .modal { display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000; align-items:center; justify-content:center; padding:20px; }
        .modal.active { display:flex; }
        .modal-box { background:white; padding:30px; border-radius:15px; max-width:550px; width:100%; max-height:90vh; overflow-y:auto; }
        .modal-box h2 { font-size:20px; color:var(--primary); margin-bottom:20px; }
        .modal-actions { display:flex; gap:10px; margin-top:20px; }
        .modal-actions button { flex:1; padding:12px; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-size:14px; }
        .btn-cancel { background:var(--border); color:var(--text); }
        .btn-submit { background:var(--success); color:white; }

        /* DRE */
        .dre-wrapper { overflow-x:auto; }
        .dre-table { width:100%; border-collapse:collapse; min-width:800px; }
        .dre-table th { background:var(--primary); color:white; padding:12px 15px; font-size:12px; text-align:right; white-space:nowrap; }
        .dre-table th:first-child { text-align:left; min-width:200px; }
        .dre-table td { padding:10px 15px; border-bottom:1px solid var(--border); font-size:13px; text-align:right; }
        .dre-table td:first-child { text-align:left; font-weight:500; }
        .dre-table tr.subtotal td { background:#f1f5f9; font-weight:700; }
        .dre-table tr.total-row td { background:var(--primary); color:white; font-weight:700; font-size:14px; }
        .dre-table tr.section-header td { background:#e2e8f0; font-weight:700; font-size:12px; text-transform:uppercase; letter-spacing:0.5px; }
        .dre-input { width:100%; padding:4px 8px; border:1px solid var(--border); border-radius:4px; text-align:right; font-size:13px; background:white; }
        .dre-input:focus { outline:none; border-color:var(--secondary); }

        /* INDICATORS */
        .indicators-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:15px; }
        .indicator-item { text-align:center; padding:20px; background:var(--light); border-radius:10px; }
        .indicator-label { font-size:11px; color:var(--text-light); margin-bottom:8px; text-transform:uppercase; font-weight:600; }
        .indicator-value { font-size:22px; font-weight:700; color:var(--primary); }

        /* PASSWORD DISPLAY */
        .password-display { background:#fef3c7; border:2px solid var(--warning); border-radius:10px; padding:20px; text-align:center; margin-top:15px; }
        .password-display .pwd { font-size:28px; font-weight:700; letter-spacing:5px; color:var(--primary); margin:10px 0; }
        .password-display p { font-size:13px; color:var(--text-light); }

        /* ALERTS */
        .alert { padding:15px 20px; border-radius:10px; margin-bottom:20px; display:flex; align-items:center; gap:12px; font-size:14px; }
        .alert-info { background:#dbeafe; border-left:4px solid var(--secondary); color:#1e40af; }
        .alert-warning { background:#fef3c7; border-left:4px solid var(--warning); color:#92400e; }

        /* HIDDEN */
        .hidden { display:none !important; }

        @media (max-width:768px) {
            .login-container { flex-direction:column; }
            .login-left { border-radius:20px 20px 0 0; padding:40px 30px; }
            .login-right { padding:30px; }
            .stats-grid { grid-template-columns:1fr 1fr; }
            .main-content { padding:15px; }
            .filters { flex-direction:column; }
        }
        @media print {
            .navbar, .tabs, .btn, button, .filters, .actions { display:none !important; }
        }
    </style>
</head>
<body>

<!-- LOADING -->
<div id="loadingScreen">
    <div class="loading-spinner"></div>
    <div class="loading-text">Conectando ao sistema...</div>
</div>

<!-- LOGIN -->
<div id="loginScreen" class="login-screen hidden">
    <div class="login-container">
        <div class="login-left">
            <img src="logo.png" alt="Rufo Gestão" class="login-logo" onerror="this.style.display='none'">
            <h1>Rufo Gestão</h1>
            <p>Decisão Financeira Rufo<br>Consultoria que gera crescimento</p>
        </div>
        <div class="login-right">
            <h2>Bem-vindo!</h2>
            <p>Acesse sua conta para continuar</p>
            <div id="loginError" class="alert alert-warning hidden">❌ E-mail ou senha incorretos!</div>
            <form id="loginForm">
                <div class="form-group">
                    <label>E-mail</label>
                    <input type="email" id="loginEmail" placeholder="seu@email.com" required>
                </div>
                <div class="form-group">
                    <label>Senha</label>
                    <input type="password" id="loginSenha" placeholder="••••••••" required>
                </div>
                <button type="submit" class="btn btn-primary">Entrar no Sistema</button>
            </form>
        </div>
    </div>
</div>

<!-- ADMIN PANEL -->
<div id="adminPanel" class="hidden">
    <nav class="navbar">
        <div class="navbar-brand">
            <img src="logo.png" alt="Logo" class="navbar-logo" onerror="this.style.display='none'">
            <div class="navbar-title">
                <h3>Rufo Gestão</h3>
                <p>Painel Administrativo</p>
            </div>
        </div>
        <div class="navbar-right">
            <div class="user-badge">👤 <strong id="adminNomeDisplay">Admin</strong></div>
            <button class="btn-nav btn-logout" onclick="logout()">Sair</button>
        </div>
    </nav>
    <div class="main-content">
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-header"><span class="stat-title">Total Clientes</span><span class="stat-icon">🏢</span></div><div class="stat-value" id="statClientes">0</div></div>
            <div class="stat-card"><div class="stat-header"><span class="stat-title">A Vencer (7 dias)</span><span class="stat-icon">⏰</span></div><div class="stat-value" id="statVencer">0</div></div>
            <div class="stat-card"><div class="stat-header"><span class="stat-title">Contas Atrasadas</span><span class="stat-icon">⚠️</span></div><div class="stat-value red" id="statAtrasadas">0</div></div>
            <div class="stat-card"><div class="stat-header"><span class="stat-title">Administradores</span><span class="stat-icon">👨‍💼</span></div><div class="stat-value" id="statAdmins">0</div></div>
        </div>

        <div class="tabs">
            <button class="tab-btn active" data-tab="tabEmpresas">🏢 Empresas</button>
            <button class="tab-btn" data-tab="tabAdmins">👨‍💼 Administradores</button>
        </div>

        <!-- EMPRESAS -->
        <div id="tabEmpresas" class="tab-content active">
            <div class="section-card">
                <div class="section-header">
                    <h2 class="section-title">Empresas Clientes</h2>
                    <button class="btn btn-add" onclick="abrirModalEmpresa()">+ Nova Empresa</button>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead><tr><th>Empresa</th><th>CNPJ</th><th>Responsável</th><th>E-mail Login</th><th>Ações</th></tr></thead>
                        <tbody id="tbEmpresas"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- ADMINS -->
        <div id="tabAdmins" class="tab-content">
            <div class="section-card">
                <div class="section-header">
                    <h2 class="section-title">Administradores</h2>
                    <button class="btn btn-add" onclick="abrirModalAdmin()">+ Novo Admin</button>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead><tr><th>Nome</th><th>E-mail</th><th>Ações</th></tr></thead>
                        <tbody id="tbAdmins"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- CLIENTE PANEL -->
<div id="clientePanel" class="hidden">
    <nav class="navbar">
        <div class="navbar-brand">
            <img src="logo.png" alt="Logo" class="navbar-logo" onerror="this.style.display='none'">
            <div class="navbar-title">
                <h3 id="empresaNomeNav">Empresa</h3>
                <p id="empresaCnpjNav">CNPJ</p>
            </div>
        </div>
        <div class="navbar-right">
            <button id="btnVoltarAdmin" class="btn-nav btn-back hidden" onclick="voltarAdmin()">← Voltar</button>
            <div class="user-badge">👤 <strong id="clienteNomeDisplay">Cliente</strong></div>
            <button class="btn-nav btn-logout" onclick="logout()">Sair</button>
        </div>
    </nav>
    <div class="main-content">
        <div class="tabs">
            <button class="tab-btn active" data-tab="tabVisao">📊 Visão Geral</button>
            <button class="tab-btn" data-tab="tabDRE">📈 DRE</button>
            <button class="tab-btn" data-tab="tabFluxo">💰 Fluxo de Caixa</button>
            <button class="tab-btn" data-tab="tabPagar">📤 Contas a Pagar</button>
            <button class="tab-btn" data-tab="tabReceber">📥 Contas a Receber</button>
            <button class="tab-btn" data-tab="tabUpload">📸 Upload de Boletos</button>
        </div>

        <!-- VISÃO GERAL -->
        <div id="tabVisao" class="tab-content active">
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-header"><span class="stat-title">Receita do Mês</span><span class="stat-icon">💰</span></div><div class="stat-value green" id="vReceitaMes">R$ 0</div></div>
                <div class="stat-card"><div class="stat-header"><span class="stat-title">Despesas do Mês</span><span class="stat-icon">💸</span></div><div class="stat-value red" id="vDespesaMes">R$ 0</div></div>
                <div class="stat-card"><div class="stat-header"><span class="stat-title">Lucro Líquido</span><span class="stat-icon">📈</span></div><div class="stat-value" id="vLucro">R$ 0</div></div>
                <div class="stat-card"><div class="stat-header"><span class="stat-title">Saldo em Caixa</span><span class="stat-icon">🏦</span></div><div class="stat-value" id="vSaldo">R$ 0</div></div>
                <div class="stat-card"><div class="stat-header"><span class="stat-title">A Pagar (aberto)</span><span class="stat-icon">📤</span></div><div class="stat-value red" id="vAPagar">R$ 0</div></div>
                <div class="stat-card"><div class="stat-header"><span class="stat-title">A Receber (aberto)</span><span class="stat-icon">📥</span></div><div class="stat-value green" id="vAReceber">R$ 0</div></div>
            </div>
            <div class="section-card">
                <h3 class="section-title" style="margin-bottom:20px;">Indicadores Financeiros</h3>
                <div class="indicators-grid">
                    <div class="indicator-item"><div class="indicator-label">Margem de Contribuição</div><div class="indicator-value" id="iMargemContr">0%</div></div>
                    <div class="indicator-item"><div class="indicator-label">Margem Líquida</div><div class="indicator-value" id="iMargemLiq">0%</div></div>
                    <div class="indicator-item"><div class="indicator-label">Prazo Médio Receb.</div><div class="indicator-value" id="iPMR">0 dias</div></div>
                    <div class="indicator-item"><div class="indicator-label">Prazo Médio Pgto</div><div class="indicator-value" id="iPMP">0 dias</div></div>
                </div>
            </div>
        </div>

        <!-- DRE -->
        <div id="tabDRE" class="tab-content">
            <div class="section-card">
                <div class="section-header">
                    <h2 class="section-title">DRE - Demonstração do Resultado</h2>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;">
                        <select id="dreFiltroAno" class="btn btn-light" onchange="renderDRE()" style="padding:8px 12px;border:2px solid var(--border);border-radius:8px;"></select>
                        <button class="btn btn-secondary" onclick="salvarDRE()">💾 Salvar DRE</button>
                        <button class="btn btn-light" onclick="window.print()">📄 PDF</button>
                    </div>
                </div>
                <div class="alert alert-info">✏️ <strong>DRE Editável</strong> - Clique nos valores para editar. Clique em "Salvar DRE" para guardar.</div>
                <div class="dre-wrapper">
                    <table class="dre-table" id="dreTable">
                        <thead id="dreHead"></thead>
                        <tbody id="dreBody"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- FLUXO DE CAIXA -->
        <div id="tabFluxo" class="tab-content">
            <div class="section-card">
                <div class="section-header">
                    <h2 class="section-title">Fluxo de Caixa</h2>
                    <button class="btn btn-light" onclick="window.print()">📄 PDF</button>
                </div>
                <div class="table-wrapper">
                    <table id="fluxoTable">
                        <thead><tr><th>Descrição</th><th style="text-align:right;">Projetado</th><th style="text-align:right;">Realizado</th><th style="text-align:right;">Diferença</th></tr></thead>
                        <tbody id="tbFluxo"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- CONTAS A PAGAR -->
        <div id="tabPagar" class="tab-content">
            <div class="section-card">
                <div class="section-header">
                    <h2 class="section-title">Contas a Pagar</h2>
                    <button class="btn btn-add" onclick="abrirModalLanc('pagar')">+ Nova Despesa</button>
                </div>
                <div class="filters">
                    <div class="filter-group"><label>Status</label><select id="fPagarStatus" onchange="renderPagar()"><option value="">Todos</option><option>aberto</option><option>pago</option><option>atrasado</option></select></div>
                    <div class="filter-group"><label>Período</label><select id="fPagarPeriodo" onchange="renderPagar()"><option value="">Todos</option><option value="hoje">Hoje</option><option value="semana">Esta Semana</option><option value="mes">Este Mês</option><option value="30dias">30 dias</option><option value="90dias">90 dias</option></select></div>
                    <div class="filter-group"><label>De</label><input type="date" id="fPagarDe" onchange="renderPagar()"></div>
                    <div class="filter-group"><label>Até</label><input type="date" id="fPagarAte" onchange="renderPagar()"></div>
                    <button class="btn btn-light" onclick="limparFiltros('pagar')" style="align-self:flex-end;">Limpar</button>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead><tr><th>Competência</th><th>Vencimento</th><th>Descrição</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead>
                        <tbody id="tbPagar"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- CONTAS A RECEBER -->
        <div id="tabReceber" class="tab-content">
            <div class="section-card">
                <div class="section-header">
                    <h2 class="section-title">Contas a Receber</h2>
                    <button class="btn btn-add" onclick="abrirModalLanc('receber')">+ Nova Receita</button>
                </div>
                <div class="filters">
                    <div class="filter-group"><label>Status</label><select id="fReceberStatus" onchange="renderReceber()"><option value="">Todos</option><option>aberto</option><option>pago</option><option>atrasado</option></select></div>
                    <div class="filter-group"><label>Período</label><select id="fReceberPeriodo" onchange="renderReceber()"><option value="">Todos</option><option value="hoje">Hoje</option><option value="semana">Esta Semana</option><option value="mes">Este Mês</option><option value="30dias">30 dias</option><option value="90dias">90 dias</option></select></div>
                    <div class="filter-group"><label>De</label><input type="date" id="fReceberDe" onchange="renderReceber()"></div>
                    <div class="filter-group"><label>Até</label><input type="date" id="fReceberAte" onchange="renderReceber()"></div>
                    <button class="btn btn-light" onclick="limparFiltros('receber')" style="align-self:flex-end;">Limpar</button>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead><tr><th>Competência</th><th>Vencimento</th><th>Descrição</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead>
                        <tbody id="tbReceber"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- UPLOAD DE BOLETOS -->
        <div id="tabUpload" class="tab-content">
            <div class="section-card">
                <h2 class="section-title">📸 Upload de Boletos e Planilhas</h2>
                <p style="color:var(--text-light);margin-bottom:20px;">Arraste arquivos ou clique para selecionar. Suporte: JPG, PNG, PDF (boletos) e XLSX, CSV (planilhas)</p>
                
                <div id="uploadDropZone" style="border:3px dashed var(--border);border-radius:15px;padding:60px 20px;text-align:center;background:var(--light);cursor:pointer;transition:all 0.3s;" onclick="document.getElementById('uploadInput').click()">
                    <div style="font-size:48px;margin-bottom:15px;">📤</div>
                    <p style="font-size:18px;font-weight:600;color:var(--primary);margin-bottom:8px;">Clique ou arraste arquivos aqui</p>
                    <p style="font-size:13px;color:var(--text-light);">Imagens (JPG/PNG/PDF) ou Planilhas (XLSX/CSV)</p>
                    <input type="file" id="uploadInput" accept=".jpg,.jpeg,.png,.pdf,.xlsx,.xls,.csv" multiple style="display:none;" onchange="processarArquivos(this.files)">
                </div>

                <div id="uploadPreview" style="margin-top:25px;display:none;">
                    <div class="section-header">
                        <h3 class="section-title">📋 Pré-visualização</h3>
                        <div style="display:flex;gap:10px;">
                            <button class="btn btn-secondary" onclick="confirmarUpload()">✅ Confirmar e Lançar</button>
                            <button class="btn btn-light" onclick="cancelarUpload()">❌ Cancelar</button>
                        </div>
                    </div>
                    <div id="uploadList"></div>
                </div>

                <div id="uploadProcessing" style="display:none;text-align:center;padding:40px;">
                    <div class="loading-spinner" style="width:40px;height:40px;margin:0 auto 20px;"></div>
                    <p style="font-size:16px;color:var(--text-light);">Processando arquivos...</p>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- MODAL EMPRESA -->
<div id="modalEmpresa" class="modal">
    <div class="modal-box">
        <h2 id="modalEmpresaTitulo">Nova Empresa</h2>
        <form id="formEmpresa">
            <input type="hidden" id="empresaEditId">
            <div class="form-group"><label>Razão Social *</label><input type="text" id="eRazao" required></div>
            <div class="form-group"><label>CNPJ *</label><input type="text" id="eCnpj" required></div>
            <div class="form-group"><label>Responsável *</label><input type="text" id="eResponsavel" required></div>
            <div class="form-group"><label>Telefone / WhatsApp</label><input type="tel" id="eTelefone"></div>
            <div class="form-group"><label>E-mail (login do cliente) *</label><input type="email" id="eEmail" required></div>
            <div class="form-group"><label id="eSenhaLabel">Senha inicial do cliente *</label><input type="text" id="eSenha" placeholder="mínimo 6 caracteres"></div>
            <div class="form-group"><label>Saldo inicial (R$)</label><input type="number" step="0.01" id="eSaldo" value="0"></div>
            <div class="modal-actions">
                <button type="button" class="btn-cancel" onclick="fecharModal('modalEmpresa')">Cancelar</button>
                <button type="submit" class="btn-submit">Salvar</button>
            </div>
        </form>
    </div>
</div>

<!-- MODAL ADMIN -->
<div id="modalAdmin" class="modal">
    <div class="modal-box">
        <h2 id="modalAdminTitulo">Novo Administrador</h2>
        <form id="formAdmin">
            <input type="hidden" id="adminEditId">
            <div class="form-group"><label>Nome *</label><input type="text" id="aNome" required></div>
            <div class="form-group"><label>E-mail *</label><input type="email" id="aEmail" required></div>
            <div class="form-group"><label id="aSenhaLabel">Senha *</label><input type="text" id="aSenha" placeholder="mínimo 6 caracteres"></div>
            <div class="modal-actions">
                <button type="button" class="btn-cancel" onclick="fecharModal('modalAdmin')">Cancelar</button>
                <button type="submit" class="btn-submit">Salvar</button>
            </div>
        </form>
    </div>
</div>

<!-- MODAL RESET SENHA -->
<div id="modalReset" class="modal">
    <div class="modal-box">
        <h2>Resetar Senha</h2>
        <p id="resetUserInfo" style="color:var(--text-light);margin-bottom:15px;"></p>
        <div class="password-display">
            <p>Nova senha gerada:</p>
            <div class="pwd" id="novaSenhaDisplay">------</div>
            <p>⚠️ Anote e envie para o usuário via WhatsApp ou e-mail!</p>
        </div>
        <div class="modal-actions">
            <button type="button" class="btn-cancel" onclick="fecharModal('modalReset')">Fechar</button>
            <button type="button" class="btn-submit" onclick="confirmarReset()">✅ Confirmar Reset</button>
        </div>
    </div>
</div>

<!-- MODAL LANÇAMENTO -->
<div id="modalLanc" class="modal">
    <div class="modal-box">
        <h2 id="modalLancTitulo">Novo Lançamento</h2>
        <form id="formLanc">
            <input type="hidden" id="lancEditId">
            <input type="hidden" id="lancTipo">
            <div class="form-group"><label>Mês de Competência *</label><input type="month" id="lCompetencia" required></div>
            <div class="form-group"><label>Descrição *</label><input type="text" id="lDescricao" required></div>
            <div class="form-group"><label>Valor (R$) *</label><input type="number" step="0.01" id="lValor" required></div>
            <div class="form-group"><label>Vencimento *</label><input type="date" id="lVencimento" required></div>
            <div class="form-group"><label>Status</label>
                <select id="lStatus">
                    <option value="aberto">Em Aberto</option>
                    <option value="pago">Pago/Recebido</option>
                    <option value="atrasado">Atrasado</option>
                </select>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn-cancel" onclick="fecharModal('modalLanc')">Cancelar</button>
                <button type="submit" class="btn-submit">Salvar</button>
            </div>
        </form>
    </div>
</div>

<!-- MODAL CONFIRMAR EXCLUSÃO -->
<div id="modalConfirm" class="modal">
    <div class="modal-box">
        <h2>⚠️ Confirmar Exclusão</h2>
        <p id="confirmMsg" style="margin:15px 0;color:var(--text-light);"></p>
        <div class="modal-actions">
            <button class="btn-cancel" onclick="fecharModal('modalConfirm')">Cancelar</button>
            <button class="btn-submit" id="confirmBtn" style="background:var(--danger);">Excluir</button>
        </div>
    </div>
</div>

<script type="module" src="app.js"></script>
<script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>
</body>
</html>

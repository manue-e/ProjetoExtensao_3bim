import { db } from "../firebase/firebase.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// ==========================================
// Autenticação e Permissões
// ==========================================
const auth = getAuth();
let usuarioLogado = null;
let isAdmin = false;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    if (user.email !== "adm@daedalo.com") {
        window.location.href = "agenda.html";
        return;
    }

    usuarioLogado = user;
    isAdmin = true;

    await carregarListaClientes();
});

// ==========================================
// Captura de Elementos do DOM
// ==========================================
const tabelaClientesBody = document.getElementById("tabelaClientesBody");
const btnNovoCliente = document.getElementById("btnNovoCliente");
const btnGerarRelatorio = document.getElementById("btnGerarRelatorio");

// Modais
const modalNovoCliente = document.getElementById("modalNovoCliente");
const fecharModalNovoCliente = document.getElementById("fecharModalNovoCliente");
const formNovoCliente = document.getElementById("formNovoCliente");

const modalVisualizarCliente = document.getElementById("modalVisualizarCliente");
const fecharModalVisualizarCliente = document.getElementById("fecharModalVisualizarCliente");

const modalRelatorio = document.getElementById("modalRelatorio");
const fecharModalRelatorio = document.getElementById("fecharModalRelatorio");

// Elementos de Visualização Simples
const visualizarNomeCliente = document.getElementById("visualizarNomeCliente");
const visualizarEmailCliente = document.getElementById("visualizarEmailCliente");
const visualizarTelefoneCliente = document.getElementById("visualizarTelefoneCliente");
const visualizarAbertosCliente = document.getElementById("visualizarAbertosCliente");
const visualizarFechadosCliente = document.getElementById("visualizarFechadosCliente");
const visualizarTotalCliente = document.getElementById("visualizarTotalCliente");

// Elementos do Relatório
const selectClientesRelatorio = document.getElementById("selectClientesRelatorio");
const containerTagsClientes = document.getElementById("containerTagsClientes");
const inputDataDe = document.getElementById("inputDataDe");
const inputDataPara = document.getElementById("inputDataPara");
const btnGerarPrevia = document.getElementById("btnGerarPrevia");
const areaPreviaRelatorio = document.getElementById("areaPreviaRelatorio");
const textoPeriodoRelatorio = document.getElementById("textoPeriodoRelatorio");
const containerGraficosGerais = document.getElementById("containerGraficosGerais");
const containerGraficosIndividuais = document.getElementById("containerGraficosIndividuais");
const btnBaixarPDF = document.getElementById("btnBaixarPDF");

// Variáveis Globais de Estado
let listaDeClientes = [];
let agendamentosGlobais = [];
let clientesSelecionadosParaRelatorio = [];
let instanciasGraficos = []; 

// ==========================================
// Funções Gerais (Tabela e DB)
// ==========================================

async function carregarListaClientes() {
    tabelaClientesBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Carregando clientes baseados nos agendamentos...</td></tr>';
    
    try {
        const snapshot = await getDocs(collection(db, "agendamentos"));
        agendamentosGlobais = [];
        const mapClientes = {};

        snapshot.forEach((documento) => {
            const dados = documento.data();
            agendamentosGlobais.push(dados); 

            const email = dados.emailCliente;

            if (email) {
                if (!mapClientes[email]) {
                    mapClientes[email] = {
                        id: email,
                        nome: email.split('@')[0], 
                        email: email,
                        totalAgendamentos: 0,
                        agendamentosAbertos: 0,
                        agendamentosFechados: 0,
                        agendamentosCancelados: 0
                    };
                }

                mapClientes[email].totalAgendamentos++;
                
                if (dados.status === "pendente") {
                    mapClientes[email].agendamentosAbertos++;
                }
                
                if (dados.status === "concluido") {
                    mapClientes[email].agendamentosFechados++;
                }

                if (dados.status === "cancelado") {
                    mapClientes[email].agendamentosCancelados++;
                }
            }
        });

        listaDeClientes = Object.values(mapClientes);

        if (listaDeClientes.length === 0) {
            tabelaClientesBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum cliente com agendamentos no momento.</td></tr>';
            return;
        }

        renderizarTabelaClientes();
        popularSelectRelatorio();

    } catch (error) {
        console.error("Erro ao montar clientes: ", error);
        tabelaClientesBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: red;"><i class="bi bi-x-circle-fill"></i> Erro ao carregar dados do banco.</td></tr>`;
    }
}

function renderizarTabelaClientes() {
    tabelaClientesBody.innerHTML = "";

    listaDeClientes.forEach(cliente => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td style="text-transform: capitalize;">${cliente.nome}</td>
            <td>${cliente.email}</td>
            <td>${cliente.totalAgendamentos || 0}</td>
            <td>${cliente.agendamentosAbertos || 0}</td>
            <td style="font-size: 1.2rem; min-width: 80px;">
                <button class="btn-icon btn-visualizar" data-id="${cliente.id}" style="background:none; border:none; color: #0dcaf0; cursor:pointer; margin-right:8px;" title="Visualizar Cadastro">
                    <i class="bi bi-eye-fill"></i>
                </button>
                <button class="btn-icon btn-excluir" data-id="${cliente.id}" style="background:none; border:none; color: #dc3545; cursor:pointer;" title="Excluir Registros">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </td>
        `;

        tabelaClientesBody.appendChild(tr);
    });

    adicionarEventosBotoesTabela();
}

function adicionarEventosBotoesTabela() {
    document.querySelectorAll(".btn-visualizar").forEach(botao => {
        botao.addEventListener("click", (e) => {
            abrirModalVisualizarCliente(e.currentTarget.getAttribute("data-id"));
        });
    });

    document.querySelectorAll(".btn-excluir").forEach(botao => {
        botao.addEventListener("click", (e) => {
            excluirCadastroCliente(e.currentTarget.getAttribute("data-id"));
        });
    });
}

function abrirModalVisualizarCliente(idCliente) {
    const cliente = listaDeClientes.find(c => c.id === idCliente);
    
    if (cliente) {
        visualizarNomeCliente.textContent = cliente.nome;
        visualizarEmailCliente.textContent = cliente.email;
        visualizarTelefoneCliente.textContent = "Não registrado (Auth)"; 
        visualizarTotalCliente.textContent = cliente.totalAgendamentos || 0;
        visualizarAbertosCliente.textContent = cliente.agendamentosAbertos || 0;
        visualizarFechadosCliente.textContent = cliente.agendamentosFechados || 0;

        modalVisualizarCliente.style.display = "block";
    }
}

async function excluirCadastroCliente(emailCliente) {
    const confirmacao = confirm(`Tem certeza que deseja apagar todos os agendamentos de ${emailCliente}?`);
    
    if (confirmacao) {
        try {
            const q = query(collection(db, "agendamentos"), where("emailCliente", "==", emailCliente));
            const snapshot = await getDocs(q);
            
            const promessasDelecao = [];
            snapshot.forEach((documento) => {
                promessasDelecao.push(deleteDoc(doc(db, "agendamentos", documento.id)));
            });

            await Promise.all(promessasDelecao);

            alert("Registros do cliente excluídos com sucesso.");
            await carregarListaClientes();
        } catch (error) {
            console.error("Erro ao excluir registros do cliente: ", error);
            alert("Erro ao excluir registros.");
        }
    }
}

async function salvarDadosNovoCliente(event) {
    event.preventDefault();

    const email = document.getElementById("inputEmailCliente").value;
    const senha = document.getElementById("inputSenhaCliente").value;
    const confirmaSenha = document.getElementById("inputConfirmarSenhaCliente").value;

    if (senha !== confirmaSenha) {
        alert("As senhas não coincidem!");
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, email, senha);
        alert("Cliente cadastrado no Authentication com sucesso!");
        fecharModais();
    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
            alert("Já existe uma conta cadastrada com este e-mail no banco.");
        } else {
            console.error("Erro ao cadastrar cliente: ", error);
            alert("Erro ao cadastrar o cliente: " + error.message);
        }
    }
}

// ==========================================
// Lógica do Modal de Relatório
// ==========================================

function popularSelectRelatorio() {
    selectClientesRelatorio.innerHTML = '<option value="">Selecione um cliente...</option>';
    listaDeClientes.forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.email;
        option.textContent = `${cliente.nome} (${cliente.email})`;
        selectClientesRelatorio.appendChild(option);
    });
}

function renderizarTagsClientes() {
    containerTagsClientes.innerHTML = "";
    
    clientesSelecionadosParaRelatorio.forEach(email => {
        const cliente = listaDeClientes.find(c => c.email === email);
        const tag = document.createElement("div");
        tag.className = "cliente-tag";
        
        tag.innerHTML = `
            ${cliente ? cliente.nome : email}
            <span class="remover-tag" data-email="${email}">X</span>
        `;
        
        containerTagsClientes.appendChild(tag);
    });

    document.querySelectorAll(".remover-tag").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const emailRemover = e.currentTarget.getAttribute("data-email");
            clientesSelecionadosParaRelatorio = clientesSelecionadosParaRelatorio.filter(em => em !== emailRemover);
            renderizarTagsClientes();
        });
    });
}

function destruirGraficosAnteriores() {
    instanciasGraficos.forEach(grafico => grafico.destroy());
    instanciasGraficos = [];
}

function gerarPreviaRelatorio() {
    if (clientesSelecionadosParaRelatorio.length === 0) {
        alert("Selecione pelo menos um cliente para gerar o relatório.");
        return;
    }

    const dataDe = inputDataDe.value;
    const dataPara = inputDataPara.value;

    if (!dataDe || !dataPara) {
        alert("Selecione o período completo (De e Para).");
        return;
    }

    const agendamentosFiltrados = agendamentosGlobais.filter(ag => {
        const agData = new Date(ag.data);
        const filtroDe = new Date(dataDe);
        const filtroPara = new Date(dataPara);
        
        agData.setHours(0,0,0,0); filtroDe.setHours(0,0,0,0); filtroPara.setHours(0,0,0,0);

        const atendeData = agData >= filtroDe && agData <= filtroPara;
        const atendeCliente = clientesSelecionadosParaRelatorio.includes(ag.emailCliente);
        
        return atendeData && atendeCliente;
    });

    destruirGraficosAnteriores();
    containerGraficosGerais.style.display = "none";
    containerGraficosIndividuais.innerHTML = "";
    
    const formatadorData = new Intl.DateTimeFormat('pt-BR');
    textoPeriodoRelatorio.textContent = `Período: ${formatadorData.format(new Date(dataDe))} a ${formatadorData.format(new Date(dataPara))}`;
    
    areaPreviaRelatorio.style.display = "block";

    // Se mais de um, gera a sessão global
    if (clientesSelecionadosParaRelatorio.length > 1) {
        gerarGraficosGeraisMulticlientes(agendamentosFiltrados);
    }

    // Gera a sessão específica de cada um
    clientesSelecionadosParaRelatorio.forEach((emailCliente) => {
        gerarSecaoEspecificaCliente(emailCliente, agendamentosFiltrados);
    });
}

function gerarGraficosGeraisMulticlientes(agendamentos) {
    containerGraficosGerais.style.display = "block";

    // 1. Lógica para Gráfico de Status (Linha Horizontal Empilhada)
    let totalAbertos = 0;
    let totalFechados = 0;
    let totalCancelados = 0;

    clientesSelecionadosParaRelatorio.forEach(email => {
        agendamentos.forEach(ag => {
            if (ag.emailCliente === email) {
                if (ag.status === "pendente") totalAbertos++;
                if (ag.status === "concluido") totalFechados++;
                if (ag.status === "cancelado") totalCancelados++;
            }
        });
    });

    // Ajuste da altura do container para o gráfico horizontal ficar bonito
    document.getElementById("graficoStatusGeral").parentElement.style.height = "150px";
    
    const ctxStatus = document.getElementById("graficoStatusGeral").getContext("2d");
    const graficoGeral = new Chart(ctxStatus, {
        type: 'bar',
        data: {
            labels: ['Status Geral'],
            datasets: [
                {
                    label: 'Concluídos',
                    data: [totalFechados],
                    backgroundColor: '#198754' // Verde
                },
                {
                    label: 'Em Aberto',
                    data: [totalAbertos],
                    backgroundColor: '#6c757d' // Cinza
                },
                {
                    label: 'Cancelados',
                    data: [totalCancelados],
                    backgroundColor: '#dc3545' // Vermelho
                }
            ]
        },
        options: {
            indexAxis: 'y', // Transforma em linha horizontal
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { stacked: true, display: false },
                y: { stacked: true, display: false }
            },
            plugins: {
                title: { display: true, text: 'Visão Geral de Status (Todos os Selecionados)' },
                legend: { position: 'bottom' }
            }
        }
    });

    // 2. Lógica para Gráfico Geral de Serviços Mais Utilizados
    const frequenciaServicosGeral = {};
    
    agendamentos.forEach(ag => {
        const serv = ag.titulo || "Outros";
        if (!frequenciaServicosGeral[serv]) frequenciaServicosGeral[serv] = 0;
        frequenciaServicosGeral[serv]++;
    });

    const rankingGeralServicos = Object.entries(frequenciaServicosGeral).sort((a, b) => b[1] - a[1]);
    const labelsServicosGerais = rankingGeralServicos.map(item => item[0]);
    const dadosServicosGerais = rankingGeralServicos.map(item => item[1]);
    
    const servicoDestaque = labelsServicosGerais.length > 0 ? labelsServicosGerais[0] : "Nenhum";

    document.getElementById("graficoServicosGeral").parentElement.style.height = "250px";
    const ctxServicos = document.getElementById("graficoServicosGeral").getContext("2d");
    const graficoServicosGeral = new Chart(ctxServicos, {
        type: 'bar',
        data: {
            labels: labelsServicosGerais.length > 0 ? labelsServicosGerais : ['Nenhum'],
            datasets: [{
                label: 'Total de Solicitações',
                data: dadosServicosGerais.length > 0 ? dadosServicosGerais : [0],
                backgroundColor: '#0F4168' // Azul Daedalo padrão
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
            plugins: { 
                title: { display: true, text: `Ranking Geral de Serviços (Destaque: ${servicoDestaque})` },
                legend: { display: false }
            }
        }
    });

    instanciasGraficos.push(graficoGeral, graficoServicosGeral);
}

function gerarSecaoEspecificaCliente(email, agendamentos) {
    const clienteObj = listaDeClientes.find(c => c.email === email);
    const nomeExibicao = clienteObj ? clienteObj.nome : email;

    const agendamentosCliente = agendamentos.filter(ag => ag.emailCliente === email);
    
    let abertos = 0;
    let concluidos = 0;
    let cancelados = 0;
    const frequenciaServicos = {};

    agendamentosCliente.forEach(ag => {
        if (ag.status === "pendente") abertos++;
        if (ag.status === "concluido") concluidos++;
        if (ag.status === "cancelado") cancelados++;
        
        const serv = ag.titulo || "Outro";
        if (!frequenciaServicos[serv]) frequenciaServicos[serv] = 0;
        frequenciaServicos[serv]++;
    });

    const rankingServicos = Object.entries(frequenciaServicos).sort((a, b) => b[1] - a[1]);
    const topServicosLabels = rankingServicos.map(item => item[0]).slice(0, 5);
    const topServicosDados = rankingServicos.map(item => item[1]).slice(0, 5);

    const idCanvasStatus = `canvasStatus_${email.replace(/[^a-zA-Z0-9]/g, '')}`;
    const idCanvasServicos = `canvasServicos_${email.replace(/[^a-zA-Z0-9]/g, '')}`;

    // Cria a DIV que engloba o cliente inteiro. A classe 'html2pdf__page-break' garante 1 cliente por página no PDF.
    const secaoHTML = document.createElement("div");
    secaoHTML.className = "html2pdf__page-break"; 
    secaoHTML.style.marginTop = "40px";
    secaoHTML.style.borderTop = "1px solid #ccc";
    secaoHTML.style.paddingTop = "20px";

    // O flexbox 'justify-content: space-around' garante o alinhamento perfeito pedido
    secaoHTML.innerHTML = `
        <h3 style="color: #0F4168; text-transform: capitalize;">${nomeExibicao}</h3>
        <p style="font-size: 0.9rem; color: #666;">
            <strong>E-mail:</strong> ${email} <br>
            <strong>Total Agendado no Período:</strong> ${agendamentosCliente.length}
        </p>

        <div style="display: flex; justify-content: space-around; align-items: center; background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #dcdcdc; margin: 20px 0;">
            <div style="text-align: center;">
                <strong style="color: #198754; font-size: 1.6rem;">${concluidos}</strong>
                <p style="font-size: 0.9rem; color: #666; margin-top: 5px;">Concluídos</p>
            </div>
            <div style="text-align: center;">
                <strong style="color: #6c757d; font-size: 1.6rem;">${abertos}</strong>
                <p style="font-size: 0.9rem; color: #666; margin-top: 5px;">Em Aberto</p>
            </div>
            <div style="text-align: center;">
                <strong style="color: #dc3545; font-size: 1.6rem;">${cancelados}</strong>
                <p style="font-size: 0.9rem; color: #666; margin-top: 5px;">Cancelados</p>
            </div>
        </div>

        <div style="display: flex; gap: 20px; margin-top: 15px; flex-wrap: wrap;">
            <div class="grafico-container" style="flex: 1; min-width: 250px;">
                <canvas id="${idCanvasStatus}"></canvas>
            </div>
            <div class="grafico-container" style="flex: 1; min-width: 250px;">
                <canvas id="${idCanvasServicos}"></canvas>
            </div>
        </div>
    `;

    containerGraficosIndividuais.appendChild(secaoHTML);

    // Gráfico de Pizza de Status (Agora com as 3 cores padronizadas)
    const ctxStatus = document.getElementById(idCanvasStatus).getContext("2d");
    const graficoStatus = new Chart(ctxStatus, {
        type: 'pie',
        data: {
            labels: ['Concluídos', 'Em Aberto', 'Cancelados'],
            datasets: [{
                data: [concluidos, abertos, cancelados],
                backgroundColor: ['#198754', '#6c757d', '#dc3545'] // Verde, Cinza, Vermelho
            }]
        },
        options: {
            responsive: true,
            plugins: { title: { display: true, text: 'Proporção de Status' } }
        }
    });

    // Gráfico de Barras dos Serviços (Cor Padrão)
    const ctxServicos = document.getElementById(idCanvasServicos).getContext("2d");
    const graficoServicos = new Chart(ctxServicos, {
        type: 'bar',
        data: {
            labels: topServicosLabels.length > 0 ? topServicosLabels : ['Nenhum'],
            datasets: [{
                label: 'Quantidade de Pedidos',
                data: topServicosDados.length > 0 ? topServicosDados : [0],
                backgroundColor: '#0F4168' // Azul Padrão para todos
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
            plugins: { title: { display: true, text: 'Serviços Mais Requisitados' }, legend: { display: false } }
        }
    });

    instanciasGraficos.push(graficoStatus, graficoServicos);
}

function baixarPDF() {
    const elementoHTML = document.getElementById('documentoPDF');
    
    const opcoes = {
        margin:       10,
        filename:     `relatorio-daedalo-${new Date().getTime()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opcoes).from(elementoHTML).save();
}

function fecharModais() {
    modalNovoCliente.style.display = "none";
    modalVisualizarCliente.style.display = "none";
    modalRelatorio.style.display = "none";
    
    formNovoCliente.reset();
    
    selectClientesRelatorio.value = "";
    clientesSelecionadosParaRelatorio = [];
    renderizarTagsClientes();
    areaPreviaRelatorio.style.display = "none";
    destruirGraficosAnteriores();
}

// ==========================================
// Event Listeners Globais
// ==========================================

btnNovoCliente.addEventListener("click", () => modalNovoCliente.style.display = "block");
btnGerarRelatorio.addEventListener("click", () => modalRelatorio.style.display = "block");

fecharModalNovoCliente.addEventListener("click", fecharModais);
fecharModalVisualizarCliente.addEventListener("click", fecharModais);
fecharModalRelatorio.addEventListener("click", fecharModais);

formNovoCliente.addEventListener("submit", salvarDadosNovoCliente);

selectClientesRelatorio.addEventListener("change", (e) => {
    const emailSelecionado = e.target.value;
    if (emailSelecionado && !clientesSelecionadosParaRelatorio.includes(emailSelecionado)) {
        clientesSelecionadosParaRelatorio.push(emailSelecionado);
        renderizarTagsClientes();
    }
    e.target.value = ""; 
});

btnGerarPrevia.addEventListener("click", gerarPreviaRelatorio);
btnBaixarPDF.addEventListener("click", baixarPDF);

window.addEventListener("click", (event) => {
    if (
        event.target === modalNovoCliente || 
        event.target === modalVisualizarCliente || 
        event.target === modalRelatorio
    ) {
        fecharModais();
    }
});
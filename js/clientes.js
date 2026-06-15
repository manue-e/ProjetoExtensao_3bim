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

// Modal Novo Cliente
const modalNovoCliente = document.getElementById("modalNovoCliente");
const fecharModalNovoCliente = document.getElementById("fecharModalNovoCliente");
const formNovoCliente = document.getElementById("formNovoCliente");

// Modal Visualizar Cliente
const modalVisualizarCliente = document.getElementById("modalVisualizarCliente");
const fecharModalVisualizarCliente = document.getElementById("fecharModalVisualizarCliente");
const visualizarNomeCliente = document.getElementById("visualizarNomeCliente");
const visualizarEmailCliente = document.getElementById("visualizarEmailCliente");
const visualizarTelefoneCliente = document.getElementById("visualizarTelefoneCliente");
const visualizarAbertosCliente = document.getElementById("visualizarAbertosCliente");
const visualizarFechadosCliente = document.getElementById("visualizarFechadosCliente");
const visualizarTotalCliente = document.getElementById("visualizarTotalCliente");

let listaDeClientes = [];

// ==========================================
// Funções
// ==========================================

async function carregarListaClientes() {
    tabelaClientesBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Carregando clientes baseados nos agendamentos...</td></tr>';
    
    try {
        // Como os clientes ficam no Authentication, montamos a lista 
        // varrendo a coleção de agendamentos (mesma lógica do dashboard)
        const snapshot = await getDocs(collection(db, "agendamentos"));
        
        const mapClientes = {};

        snapshot.forEach((documento) => {
            const dados = documento.data();
            const email = dados.emailCliente;

            if (email) {
                // Se o cliente ainda não estiver no nosso mapa, criamos o objeto base
                if (!mapClientes[email]) {
                    mapClientes[email] = {
                        id: email, // Usando o e-mail como ID único
                        nome: email.split('@')[0], // Pega a parte antes do @ para servir de nome
                        email: email,
                        totalAgendamentos: 0,
                        agendamentosAbertos: 0,
                        agendamentosFechados: 0
                    };
                }

                // Incrementamos as estatísticas dele
                mapClientes[email].totalAgendamentos++;
                
                if (dados.status === "pendente") {
                    mapClientes[email].agendamentosAbertos++;
                }
                
                if (dados.status === "concluido") {
                    mapClientes[email].agendamentosFechados++;
                }
            }
        });

        // Converte o objeto em array para facilitar a renderização
        listaDeClientes = Object.values(mapClientes);

        if (listaDeClientes.length === 0) {
            tabelaClientesBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum cliente com agendamentos no momento.</td></tr>';
            return;
        }

        renderizarTabelaClientes();

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
    const botoesVisualizar = document.querySelectorAll(".btn-visualizar");
    const botoesExcluir = document.querySelectorAll(".btn-excluir");
    
    botoesVisualizar.forEach(botao => {
        botao.addEventListener("click", (e) => {
            const id = e.currentTarget.getAttribute("data-id");
            abrirModalVisualizarCliente(id);
        });
    });

    botoesExcluir.forEach(botao => {
        botao.addEventListener("click", (e) => {
            const id = e.currentTarget.getAttribute("data-id");
            excluirCadastroCliente(id);
        });
    });
}

function abrirModalCadastroCliente() {
    modalNovoCliente.style.display = "block";
}

function fecharModais() {
    modalNovoCliente.style.display = "none";
    modalVisualizarCliente.style.display = "none";
    formNovoCliente.reset();
}

function abrirModalVisualizarCliente(idCliente) {
    // idCliente aqui é o e-mail do cliente
    const cliente = listaDeClientes.find(c => c.id === idCliente);
    
    if (cliente) {
        visualizarNomeCliente.textContent = cliente.nome;
        visualizarEmailCliente.textContent = cliente.email;
        visualizarTelefoneCliente.textContent = "Não registrado (Auth)"; // Não tem telefone no auth padrão
        visualizarTotalCliente.textContent = cliente.totalAgendamentos || 0;
        visualizarAbertosCliente.textContent = cliente.agendamentosAbertos || 0;
        visualizarFechadosCliente.textContent = cliente.agendamentosFechados || 0;

        modalVisualizarCliente.style.display = "block";
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
        // Usa o auth oficial para criar o cliente no firebase (Padrão de cadastro.js)
        await createUserWithEmailAndPassword(auth, email, senha);
        
        alert("Cliente cadastrado no Authentication com sucesso!");
        fecharModais();
        
        // O Firebase reloga a página automaticamente para o novo usuário criado.
        // O onAuthStateChanged vai identificar que não é o Admin e o mandará pra agenda.
    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
            alert("Já existe uma conta cadastrada com este e-mail no banco.");
        } else {
            console.error("Erro ao cadastrar cliente: ", error);
            alert("Erro ao cadastrar o cliente: " + error.message);
        }
    }
}

async function excluirCadastroCliente(emailCliente) {
    const confirmacao = confirm(`Tem certeza que deseja apagar os agendamentos de ${emailCliente}? (A conta Auth só pode ser deletada via Console Firebase).`);
    
    if (confirmacao) {
        try {
            // Deleta todos os agendamentos ligados a este e-mail
            const q = query(collection(db, "agendamentos"), where("emailCliente", "==", emailCliente));
            const snapshot = await getDocs(q);
            
            const promessasDelecao = [];
            snapshot.forEach((documento) => {
                promessasDelecao.push(deleteDoc(doc(db, "agendamentos", documento.id)));
            });

            // Aguarda apagar tudo
            await Promise.all(promessasDelecao);

            alert("Registros do cliente excluídos com sucesso.");
            await carregarListaClientes();
        } catch (error) {
            console.error("Erro ao excluir registros do cliente: ", error);
            alert("Erro ao excluir registros.");
        }
    }
}

// ==========================================
// Eventos Globais
// ==========================================

btnNovoCliente.addEventListener("click", abrirModalCadastroCliente);
fecharModalNovoCliente.addEventListener("click", fecharModais);
fecharModalVisualizarCliente.addEventListener("click", fecharModais);

formNovoCliente.addEventListener("submit", salvarDadosNovoCliente);

// Fechar modal clicando fora dele
window.addEventListener("click", (event) => {
    if (event.target === modalNovoCliente || event.target === modalVisualizarCliente) {
        fecharModais();
    }
});
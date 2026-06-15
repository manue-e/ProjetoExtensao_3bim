// ==========================================
// Configuração do Firebase
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCTTALaxakoIoSB0JZQ2h7Q-nxq837Zy34",
    authDomain: "daedalo-bd.firebaseapp.com",
    databaseURL: "https://daedalo-bd-default-rtdb.firebaseio.com",
    projectId: "daedalo-bd",
    storageBucket: "daedalo-bd.firebasestorage.app",
    messagingSenderId: "577862443103",
    appId: "1:577862443103:web:2313536f5bd82d2e9bbbea"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
// Captura de Elementos do DOM
// ==========================================
const tabelaClientesBody = document.getElementById('tabelaClientesBody');
const btnNovoCliente = document.getElementById('btnNovoCliente');

// Modal Novo Cliente
const modalNovoCliente = document.getElementById('modalNovoCliente');
const fecharModalNovoCliente = document.getElementById('fecharModalNovoCliente');
const formNovoCliente = document.getElementById('formNovoCliente');

// Modal Visualizar Cliente
const modalVisualizarCliente = document.getElementById('modalVisualizarCliente');
const fecharModalVisualizarCliente = document.getElementById('fecharModalVisualizarCliente');
const visualizarNomeCliente = document.getElementById('visualizarNomeCliente');
const visualizarEmailCliente = document.getElementById('visualizarEmailCliente');
const visualizarTelefoneCliente = document.getElementById('visualizarTelefoneCliente');
const visualizarAbertosCliente = document.getElementById('visualizarAbertosCliente');
const visualizarFechadosCliente = document.getElementById('visualizarFechadosCliente');
const visualizarTotalCliente = document.getElementById('visualizarTotalCliente');

// Array local para armazenar os dados e evitar múltiplas chamadas ao banco ao visualizar
let listaDeClientes = [];

// ==========================================
// Funções
// ==========================================

// Função para buscar dados do Firebase e montar a tabela
async function carregarListaClientes() {
    tabelaClientesBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Carregando clientes...</td></tr>';
    
    try {
        // Exemplo: buscando da coleção 'clientes' no Firestore
        const querySnapshot = await getDocs(collection(db, "clientes"));
        listaDeClientes = [];
        
        querySnapshot.forEach((doc) => {
            listaDeClientes.push({ id: doc.id, ...doc.data() });
        });

        // Caso o banco esteja vazio, inserir dados mockados para visualização do DataTables
        if(listaDeClientes.length === 0) {
            listaDeClientes = [
                { id: '1', nome: 'João Silva', email: 'joao@email.com', telefone: '(11) 98888-7777', totalAgendamentos: 5, agendamentosAbertos: 2, agendamentosFechados: 3 },
                { id: '2', nome: 'Maria Oliveira', email: 'maria@email.com', telefone: '(11) 97777-6666', totalAgendamentos: 12, agendamentosAbertos: 0, agendamentosFechados: 12 },
                { id: '3', nome: 'Carlos Souza', email: 'carlos@email.com', telefone: '(11) 96666-5555', totalAgendamentos: 1, agendamentosAbertos: 1, agendamentosFechados: 0 }
            ];
        }

        renderizarTabelaClientes();

    } catch (error) {
        console.error("Erro ao buscar clientes: ", error);
        tabelaClientesBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: red;"><i class="bi bi-x-circle-fill"></i> Erro ao carregar dados.</td></tr>`;
    }
}

// Função para renderizar as linhas na tabela
function renderizarTabelaClientes() {
    tabelaClientesBody.innerHTML = '';

    listaDeClientes.forEach(cliente => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${cliente.nome}</td>
            <td>${cliente.email}</td>
            <td>${cliente.totalAgendamentos || 0}</td>
            <td>${cliente.agendamentosAbertos || 0}</td>
            <td style="font-size: 1.2rem;">
                <button class="btn-icon" data-id="${cliente.id}" data-action="visualizar" style="background:none; border:none; color: #007bff; cursor:pointer; margin-right:10px;" title="Visualizar Cadastro">
                    <i class="bi bi-eye-fill"></i>
                </button>
                <button class="btn-icon" data-id="${cliente.id}" data-action="excluir" style="background:none; border:none; color: #dc3545; cursor:pointer;" title="Excluir Registro">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </td>
        `;

        tabelaClientesBody.appendChild(tr);
    });

    adicionarEventosBotoesTabela();
}

// Função para adicionar listeners dinamicamente nos botões de ação gerados
function adicionarEventosBotoesTabela() {
    const botoesIcone = document.querySelectorAll('.btn-icon');
    
    botoesIcone.forEach(botao => {
        botao.addEventListener('click', (event) => {
            const id = event.currentTarget.getAttribute('data-id');
            const action = event.currentTarget.getAttribute('data-action');

            if (action === 'visualizar') {
                abrirModalVisualizarCliente(id);
            } else if (action === 'excluir') {
                excluirCadastroCliente(id);
            }
        });
    });
}

// Funções para controle de Modais
function abrirModalCadastroCliente() {
    modalNovoCliente.style.display = 'block';
}

function fecharModais() {
    modalNovoCliente.style.display = 'none';
    modalVisualizarCliente.style.display = 'none';
    formNovoCliente.reset();
}

// Função para popular e abrir o modal de visualização
function abrirModalVisualizarCliente(idCliente) {
    const cliente = listaDeClientes.find(c => c.id === idCliente);
    
    if (cliente) {
        visualizarNomeCliente.textContent = cliente.nome;
        visualizarEmailCliente.textContent = cliente.email;
        visualizarTelefoneCliente.textContent = cliente.telefone || 'Não informado';
        visualizarTotalCliente.textContent = cliente.totalAgendamentos || 0;
        visualizarAbertosCliente.textContent = cliente.agendamentosAbertos || 0;
        visualizarFechadosCliente.textContent = cliente.agendamentosFechados || 0;

        modalVisualizarCliente.style.display = 'block';
    }
}

// Função para salvar novo cliente
async function salvarDadosNovoCliente(event) {
    event.preventDefault();

    const senha = document.getElementById('inputSenhaCliente').value;
    const confirmaSenha = document.getElementById('inputConfirmarSenhaCliente').value;

    if (senha !== confirmaSenha) {
        alert("As senhas não coincidem!");
        return;
    }

    const novoClienteObj = {
        nome: document.getElementById('inputNomeCliente').value,
        email: document.getElementById('inputEmailCliente').value,
        telefone: document.getElementById('inputTelefoneCliente').value,
        totalAgendamentos: 0,
        agendamentosAbertos: 0,
        agendamentosFechados: 0
    };

    try {
        // Salvando no Firebase Firestore
        await addDoc(collection(db, "clientes"), novoClienteObj);
        alert("Cliente cadastrado com sucesso!");
        fecharModais();
        carregarListaClientes(); // Recarrega a tabela
    } catch (error) {
        console.error("Erro ao cadastrar cliente: ", error);
        alert("Erro ao cadastrar o cliente.");
    }
}

// Função para excluir cliente
async function excluirCadastroCliente(idCliente) {
    const confirmacao = confirm("Tem certeza que deseja excluir este cliente? Essa ação é irreversível.");
    
    if (confirmacao) {
        try {
            // Se o ID for um número gerado localmente pelo Mock, ignoramos o DB
            if(idCliente.length < 5) {
               listaDeClientes = listaDeClientes.filter(c => c.id !== idCliente);
               renderizarTabelaClientes();
               alert("Cliente mockado excluído.");
               return;
            }

            // Deletando do Firebase Firestore
            await deleteDoc(doc(db, "clientes", idCliente));
            alert("Cliente excluído com sucesso.");
            carregarListaClientes();
        } catch (error) {
            console.error("Erro ao excluir cliente: ", error);
            alert("Erro ao excluir o cliente.");
        }
    }
}

// ==========================================
// Event Listeners Globais
// ==========================================

btnNovoCliente.addEventListener('click', abrirModalCadastroCliente);
fecharModalNovoCliente.addEventListener('click', fecharModais);
fecharModalVisualizarCliente.addEventListener('click', fecharModais);
formNovoCliente.addEventListener('submit', salvarDadosNovoCliente);

// Fechar modal clicando fora dele
window.addEventListener('click', (event) => {
    if (event.target === modalNovoCliente || event.target === modalVisualizarCliente) {
        fecharModais();
    }
});

// Inicialização da página
document.addEventListener('DOMContentLoaded', carregarListaClientes);
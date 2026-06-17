import { db } from "../firebase/firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const auth = getAuth();
let filtroCliente = "";

onAuthStateChanged(auth, async (user) => {

    if(!user){
        window.location.href = "login.html";
        return;
    }

    if(user.email !== "adm@daedalo.com"){
        window.location.href = "agenda.html";
        return;
    }

    await carregarDashboard();

});

document
.getElementById("btnFiltrar")
.addEventListener("click", async () => {

    filtroCliente =
        document.getElementById("filtroCliente")
        .value
        .trim()
        .toLowerCase();

    await carregarDashboard();

});


async function carregarDashboard(){

    const snapshot =
        await getDocs(
            collection(db, "agendamentos")
        );

    let total = 0;
    let pendentes = 0;
    let concluidos = 0;
    let cancelados = 0;

    
    const clientes = {};
const servicos = {};
const agendamentos = [];

snapshot.forEach(doc => {

    const dados = doc.data();

    if(
            filtroCliente &&
            !dados.emailCliente
                ?.toLowerCase()
                .includes(filtroCliente)
        ){
            return;
        }

    total++;

    agendamentos.push(dados);

    // Status
    if(dados.status === "pendente"){
        pendentes++;
    }

    if(dados.status === "concluido"){
        concluidos++;
    }

    if(dados.status === "cancelado"){
        cancelados++;
    }

    // Clientes
    const email = dados.emailCliente;

    if(email){

        if(!clientes[email]){
            clientes[email] = 0;
        }

        clientes[email]++;
    }

    // Serviços
    if(!servicos[dados.titulo]){
        servicos[dados.titulo] = 0;
    }

    servicos[dados.titulo]++;

});
    let clienteDestaque = "";
let maiorQuantidade = 0;

for(const email in clientes){

    if(clientes[email] > maiorQuantidade){

        maiorQuantidade = clientes[email];
        clienteDestaque = email;

    }

}

agendamentos.sort(
    (a,b) => new Date(b.data) - new Date(a.data)
);

const ultimos = agendamentos.slice(0,10);
    
   
    document.getElementById("totalAgendamentos").textContent = total;

document.getElementById("pendentes").textContent = pendentes;

document.getElementById("concluidos").textContent = concluidos;

document.getElementById("cancelados").textContent = cancelados;

console.log("Clientes:", clientes);
console.log("Cliente destaque:", clienteDestaque);
console.log("Quantidade:", maiorQuantidade);

document.getElementById("clienteDestaque").textContent =
    clienteDestaque || "Nenhum";

document.getElementById("totalClienteDestaque").textContent =
    maiorQuantidade;

const containerServicos =
    document.getElementById("servicosPopulares");

containerServicos.innerHTML = "";

const rankingServicos =
    Object.entries(servicos)
    .sort((a,b) => b[1] - a[1]);

rankingServicos.forEach(([servico, quantidade]) => {

    const item = document.createElement("div");

    item.classList.add("servico-item");

    item.innerHTML = `
        <span>${servico}</span>
        <strong>${quantidade}</strong>
    `;

    containerServicos.appendChild(item);

});

const rankingClientes =
    Object.entries(clientes)
    .sort((a,b) => b[1] - a[1]);

const tbodyRanking =
    document.getElementById("rankingClientesBody");

tbodyRanking.innerHTML = "";

rankingClientes.forEach(([email, quantidade]) => {

    const linha = document.createElement("tr");

    linha.innerHTML = `
        <td>${email}</td>
        <td>${quantidade}</td>
        <td>-</td>
    `;

    tbodyRanking.appendChild(linha);

});

const tbodyUltimos =
    document.getElementById("ultimosAgendamentosBody");

tbodyUltimos.innerHTML = "";

ultimos.forEach(agendamento => {

    const linha = document.createElement("tr");

    linha.innerHTML = `
        <td>${agendamento.emailCliente || "-"}</td>
        <td>${agendamento.titulo}</td>
        <td>${agendamento.data}</td>
        <td>${agendamento.status}</td>
    `;

    tbodyUltimos.appendChild(linha);

});
}

document
.getElementById("btnLimparFiltro")
.addEventListener("click", async () => {

    filtroCliente = "";

    document.getElementById(
        "filtroCliente"
    ).value = "";

    await carregarDashboard();

});
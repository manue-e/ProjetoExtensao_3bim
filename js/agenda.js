const calendarGrid = document.getElementById("calendarGrid");
const tituloMes = document.getElementById("tituloMes");

const btnMesAnterior = document.getElementById("btnMesAnterior");
const btnProximoMes = document.getElementById("btnProximoMes");

let dataAtual = new Date();
let eventoSelecionado = null;
let dataSelecionada = null;

const eventos = {
    "2026-06-04": [
        {
            titulo: "Suporte Técnico"
        }
    ],

    "2026-06-10": [
        {
            titulo: "Consultoria TI"
        }
    ],

    "2026-06-15": [
        {
            titulo: "Monitoramento"
        }
    ]
};

const diasSemana = [
    "Dom",
    "Seg",
    "Ter",
    "Qua",
    "Qui",
    "Sex",
    "Sáb"
];

function renderizarCalendario() {

    calendarGrid.innerHTML = "";

    diasSemana.forEach(dia => {

        const header = document.createElement("div");

        header.classList.add("day-header");

        header.textContent = dia;

        calendarGrid.appendChild(header);

    });

    const ano = dataAtual.getFullYear();

    const mes = dataAtual.getMonth();

    const primeiroDia = new Date(
        ano,
        mes,
        1
    ).getDay();

    const totalDias = new Date(
        ano,
        mes + 1,
        0
    ).getDate();

    const meses = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ];

    tituloMes.textContent =
        `${meses[mes]} ${ano}`;

    for(let i = 0; i < primeiroDia; i++){

        const vazio = document.createElement("div");

        vazio.classList.add("day");

        calendarGrid.appendChild(vazio);

    }

    for(let dia = 1; dia <= totalDias; dia++){

        const dataFormatada =
            `${ano}-${String(mes + 1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;

        const dayDiv =
            document.createElement("div");

        dayDiv.classList.add("day");

        dayDiv.innerHTML =
            `<strong>${dia}</strong>`;

        if(eventos[dataFormatada]){

            eventos[dataFormatada].forEach((evento,index) => {

            const eventDiv =
                document.createElement("div");

            eventDiv.classList.add("event");

            eventDiv.innerHTML = `
                <strong>${evento.titulo}</strong>
                <small>${evento.horario || ""}</small>
            `;

            eventDiv.addEventListener(
                "click",
                (e) => {

                    e.stopPropagation();

                    abrirModalEdicao(
                        dataFormatada,
                        index
                    );

                }
            );

            dayDiv.appendChild(eventDiv);

        });

        }

        dayDiv.addEventListener(
            "click",
            () => {

                document.getElementById(
                    "dataAgendamento"
                ).value = dataFormatada;

                modal.style.display = "flex";

            }
        );

        calendarGrid.appendChild(dayDiv);

    }

}

btnMesAnterior.addEventListener(
    "click",
    () => {

        dataAtual.setMonth(
            dataAtual.getMonth() - 1
        );

        renderizarCalendario();

    }
);

btnProximoMes.addEventListener(
    "click",
    () => {

        dataAtual.setMonth(
            dataAtual.getMonth() + 1
        );

        renderizarCalendario();

    }
);

renderizarCalendario();

const btnDiario = document.getElementById("btnDiario");
const btnSemanal = document.getElementById("btnSemanal");
const btnMensal = document.getElementById("btnMensal");

let modoVisualizacao = "mensal";

btnDiario.addEventListener("click", () => {

    modoVisualizacao = "diario";

    atualizarBotoes();

    renderizarDiario();

});

btnSemanal.addEventListener("click", () => {

    modoVisualizacao = "semanal";

    atualizarBotoes();

    renderizarSemanal();

});

btnMensal.addEventListener("click", () => {

    modoVisualizacao = "mensal";

    atualizarBotoes();

    renderizarCalendario();

});

function atualizarBotoes(){

    btnDiario.classList.remove("active");
    btnSemanal.classList.remove("active");
    btnMensal.classList.remove("active");

    if(modoVisualizacao === "diario"){
        btnDiario.classList.add("active");
    }

    if(modoVisualizacao === "semanal"){
        btnSemanal.classList.add("active");
    }

    if(modoVisualizacao === "mensal"){
        btnMensal.classList.add("active");
    }

}

function renderizarDiario(){

    calendarGrid.innerHTML = "";

    const hoje = new Date();

    const dataFormatada =
        `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}-${String(hoje.getDate()).padStart(2,"0")}`;

    const dayDiv = document.createElement("div");

    dayDiv.classList.add("day");

    dayDiv.style.gridColumn = "span 7";

    dayDiv.innerHTML = `
        <h2>${hoje.toLocaleDateString("pt-BR")}</h2>
    `;

    if(eventos[dataFormatada]){

        eventos[dataFormatada].forEach((evento,index)=>{

            const eventDiv =
                document.createElement("div");

            eventDiv.classList.add("event");

            eventDiv.innerHTML = `
                <strong>${evento.titulo}</strong>
                <br>
                <small>${evento.horario}</small>
            `;

            eventDiv.addEventListener(
                "click",
                (e) => {

                    e.stopPropagation();

                    abrirModalEdicao(
                        dataFormatada,
                        index
                    );

                }
            );

            dayDiv.appendChild(eventDiv);

        });

    }else{

        const vazio =
            document.createElement("p");

        vazio.textContent =
            "Nenhum agendamento para este dia.";

        vazio.style.marginTop = "20px";

        dayDiv.appendChild(vazio);

    }

    calendarGrid.appendChild(dayDiv);

}

function renderizarSemanal(){

    calendarGrid.innerHTML = "";

    for(let i = 0; i < 7; i++){

        const dia = new Date();

        dia.setDate(dia.getDate() + i);

        const dataFormatada =
            `${dia.getFullYear()}-${String(dia.getMonth()+1).padStart(2,"0")}-${String(dia.getDate()).padStart(2,"0")}`;

        const dayDiv =
            document.createElement("div");

        dayDiv.classList.add("day");

        dayDiv.innerHTML = `
            <strong>
                ${dia.toLocaleDateString("pt-BR")}
            </strong>
        `;

        if(eventos[dataFormatada]){

            eventos[dataFormatada].forEach((evento,index)=>{

                const eventDiv =
                    document.createElement("div");

                eventDiv.classList.add("event");

                eventDiv.innerHTML = `
                    <strong>${evento.titulo}</strong>
                    <small>${evento.horario}</small>
                `;

                eventDiv.addEventListener(
                    "click",
                    (e)=>{

                        e.stopPropagation();

                        abrirModalEdicao(
                            dataFormatada,
                            index
                        );

                    }
                );

                dayDiv.appendChild(eventDiv);

            });

        }

        calendarGrid.appendChild(dayDiv);

    }

}

const modal =
document.getElementById("modalAgendamento");

const btnNovoAgendamento =
document.getElementById("btnNovoAgendamento");

btnNovoAgendamento.addEventListener(
    "click",
    () => {

        modal.style.display = "flex";

    }
);

window.addEventListener(
    "click",
    (event) => {

        if(event.target === modal){

            modal.style.display = "none";

        }

    }
);

const formAgendamento =
document.getElementById("formAgendamento");

formAgendamento.addEventListener(
    "submit",
    (e) => {

        e.preventDefault();

        const servico =
            document.getElementById("servico").value;

        const data =
            document.getElementById("dataAgendamento").value;

        if(!eventos[data]){

            eventos[data] = [];

        }

        eventos[data].push({
            titulo: servico,
            horario: horarioAgendamento.value,
            observacoes: observacoes.value
        });

        modal.style.display = "none";

        formAgendamento.reset();

        renderizarCalendario();

    }
);

const modalEditar =
document.getElementById("modalEditar");

function abrirModalEdicao(
    data,
    indice
){

    eventoSelecionado = indice;
    dataSelecionada = data;

    const evento =
        eventos[data][indice];

    document.getElementById(
        "editarServico"
    ).value =
        evento.titulo;

    document.getElementById(
        "editarHorario"
    ).value =
        evento.horario;

    document.getElementById(
        "editarObservacoes"
    ).value =
        evento.observacoes;

    modalEditar.style.display =
        "flex";

}



document
.getElementById("formEditar")
.addEventListener(
    "submit",
    (e) => {

        e.preventDefault();

        const evento =
            eventos[dataSelecionada]
            [eventoSelecionado];

        evento.titulo =
            document.getElementById(
                "editarServico"
            ).value;

        evento.horario =
            document.getElementById(
                "editarHorario"
            ).value;

        evento.observacoes =
            document.getElementById(
                "editarObservacoes"
            ).value;

        modalEditar.style.display =
            "none";

        renderizarCalendario();
            atualizarProximosServicos();

    }
);

document
.getElementById(
    "btnCancelarAgendamento"
)
.addEventListener(
    "click",
    () => {

        const confirmar =
            confirm(
                "Deseja cancelar este agendamento?"
            );

        if(!confirmar) return;

        eventos[dataSelecionada]
        .splice(
            eventoSelecionado,
            1
        );

        modalEditar.style.display =
            "none";

        renderizarCalendario();

    }
);

function atualizarProximosServicos(){

    const lista =
        document.getElementById(
            "proximosServicos"
        );

    lista.innerHTML = "";

    const todosEventos = [];

    for(const data in eventos){

        eventos[data].forEach(evento => {

            todosEventos.push({
                data,
                ...evento
            });

        });

    }

    todosEventos.sort((a,b)=>
        new Date(a.data) - new Date(b.data)
    );

    const proximos =
        todosEventos.slice(0,5);

    proximos.forEach(evento=>{

        const item =
            document.createElement("li");

        item.innerHTML = `
            <strong>${evento.titulo}</strong>
            <span>
                ${formatarData(evento.data)}
                ${evento.horario || ""}
            </span>
        `;

        item.addEventListener(
    "click",
    ()=>{

        const indiceEvento =
            eventos[evento.data].findIndex(
                e =>
                    e.titulo === evento.titulo &&
                    e.horario === evento.horario
            );

        abrirModalEdicao(
            evento.data,
            indiceEvento
        );

    }
);

        lista.appendChild(item);

    });

}

function formatarData(data){

    const partes =
        data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}

renderizarCalendario();
atualizarProximosServicos();



window.addEventListener(
    "click",
    (e)=>{

        if(
            e.target === modalEditar
        ){

            modalEditar.style.display =
                "none";

        }

    }
);

const botoesFechar =
document.querySelectorAll(".close");

botoesFechar.forEach(botao => {

    botao.addEventListener(
        "click",
        () => {

            botao
                .closest(".modal")
                .style.display = "none";

        }
    );

});
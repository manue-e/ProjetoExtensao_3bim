import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const formCadastro =
document.getElementById("formCadastro");

formCadastro.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const email =
            document.getElementById("inputEmailUsuario").value;

        const senha =
            document.getElementById("inputSenhaUsuario").value;

        const confirmarSenha =
            document.getElementById("inputConfirmarSenha").value;

        if(senha !== confirmarSenha){

            alert("As senhas não coincidem.");
            return;

        }

        try{

            await createUserWithEmailAndPassword(
                auth,
                email,
                senha
            );

            alert("Conta criada com sucesso!");

            window.location.href =
                "login.html";

        }catch(error){

            alert(error.message);

        }

    }
);
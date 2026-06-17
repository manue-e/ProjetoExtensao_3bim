import { auth } from "../firebase/firebase.js";

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

            const modalCadastro =
            document.getElementById(
                "modalCadastroSucesso"
            );

            modalCadastro.style.display =
                "flex";

            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 2000);

        }catch(error){

            if(error.code === "auth/email-already-in-use"){

                alert(
                    "Já existe uma conta cadastrada com este e-mail."
                );

            }else{

                alert(error.message);

            }

        }

    }
);
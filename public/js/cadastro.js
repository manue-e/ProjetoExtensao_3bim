import { auth, db } from "../firebase/firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const formCadastro =
document.getElementById("formCadastro");

formCadastro.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        // Capturando os novos campos do HTML
        const nome =
            document.getElementById("inputNomeUsuario").value;

        const telefone =
            document.getElementById("inputTelefoneUsuario").value;

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

            // 1. Cria o usuário no Firebase Authentication (Apenas e-mail e senha)
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                senha
            );

            const user = userCredential.user;

            // 2. Salva os dados extras (Nome e Telefone) no Firestore (Banco de Dados)
            // Cria um documento na coleção "usuarios" com o mesmo ID (uid) do Auth
            await setDoc(doc(db, "usuarios", user.uid), {
                nome: nome,
                email: email,
                telefone: telefone,
                dataCadastro: new Date().toISOString()
            });

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

                alert("Erro ao cadastrar: " + error.message);

            }

        }

    }
);
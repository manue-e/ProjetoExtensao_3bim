import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const formLogin =
document.getElementById("formLogin");

formLogin.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        const email =
            document.getElementById("email").value;

        const senha =
            document.getElementById("senha").value;

        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                senha
            );

            alert("Login realizado com sucesso!");

            window.location.href =
                "agenda.html";

        } catch (error) {

            alert("E-mail ou senha inválidos.");

            console.error(error);

        }

    }
);
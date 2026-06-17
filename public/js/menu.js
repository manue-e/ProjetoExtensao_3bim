const menuToggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");

menuToggle.addEventListener("click", () => {

    menu.classList.toggle("active");

    const icon = menuToggle.querySelector("i");

    if(menu.classList.contains("active")){
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
    }else{
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
    }

});
const findButton = document.querySelector(".find");
var tokenA = document.querySelector("#tokenA")
const spin = document.querySelector(".spin")
const tokens = document.querySelector(".tokens")
var token = document.querySelectorAll(".token");
const bal = document.querySelector("#bal")

var tokenB;
findButton.onclick = ( ) => {
 tokens.classList.toggle("hide")
}

const setData = ( e ) => {
    tokenB = e.name;
    findButton.innerHTML = `${ e.name } <i class="fa-solid fa-angle-down ml-2"></i>`;
}
spin.onclick = ( ) => {
    spin.style.transitionDuration = "2s"
    spin.style.rotate = '360deg';
    tokenA.innerHTML = tokenB;
    findButton.innerHTML = "ENSC";
    bal.innerHTML = "new bal"
}
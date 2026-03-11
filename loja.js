let produtos = [];
async function carregarProdutos() {

const grid = document.getElementById("produtos");
const categoriasContainer = document.getElementById("categorias");
const loading = document.getElementById("loading");
const empty = document.getElementById("empty");

if(loading) loading.style.display="none";
if(empty) empty.style.display="block";

try {

const resposta = await fetch("data/produtos.json");

if (!resposta.ok) {
throw new Error("Erro ao carregar JSON");
}

produtos = await resposta.json();

loading.style.display = "none";

if (!produtos.length) {
empty.classList.remove("hidden");
return;
}

produtos.sort((a, b) => (a.order || 0) - (b.order || 0));

const categorias = [
"Todos",
...new Set(produtos.map(p => p.category || "Outros"))
];

function renderizarCategorias() {

categoriasContainer.innerHTML = "";

categorias.forEach((categoria, index) => {

const btn = document.createElement("button");

btn.textContent = categoria;

btn.className = "categoria-btn";

if (index === 0) btn.classList.add("active");

btn.onclick = () => {

document
.querySelectorAll(".categoria-btn")
.forEach(b => b.classList.remove("active"));

btn.classList.add("active");

renderizarProdutos(categoria);

};

categoriasContainer.appendChild(btn);

});

}

function criarCard(produto) {

return `
<article class="card">

<div class="card-image-wrap">

<img
src="${produto.image_url}"
class="produto-img"
alt="${produto.title}"
loading="lazy">

<img
src="./img/selo_afiliado_mercado_livre.png"
class="selo-card"
alt="Afiliado Mercado Livre">

</div>

<div class="card-content">

<h3 class="card-title">${produto.title}</h3>

<p class="card-price">${produto.price}</p>

<p class="card-description">${produto.description || ""}</p>

<a
href="${produto.affiliate_url}"
target="_blank"
rel="noopener noreferrer"
class="card-button">

Ver oferta no Mercado Livre →

</a>
<div class="card-safe">
Abrirá no site oficial do Mercado Livre
</div>

</div>

</article>
`;

}

function renderizarProdutos(categoria = "Todos") {

let lista = produtos;

if (categoria !== "Todos") {
lista = produtos.filter(p => p.category === categoria);
}

grid.innerHTML = lista.map(criarCard).join("");

}

renderizarCategorias();
renderizarProdutos();

}

catch (erro) {

console.error("Erro:", erro);

loading.style.display = "none";
empty.classList.remove("hidden");

}

}
async function carregarDestaques() {

try {

const resposta = await fetch("data/destaques.json");

if(!resposta.ok){
throw new Error("Erro ao carregar destaques");
}

const dados = await resposta.json();

if(dados.hero){
renderHero(dados.hero);
}

if(dados.kits){
renderKits(dados.kits);
iniciarCarrossel();
}

}

catch(erro){

console.error("Erro ao carregar destaques:", erro);

}

}

function iniciarCarrossel(){

const track = document.querySelector(".carousel-track");
const prev = document.querySelector(".carousel-prev");
const next = document.querySelector(".carousel-next");

if(!track || !prev || !next){
console.log("Carrossel não encontrado");
return;
}

prev.addEventListener("click", () => {

track.scrollBy({
left: -300,
behavior: "smooth"
});

});

next.addEventListener("click", () => {

track.scrollBy({
left: 300,
behavior: "smooth"
});

});

}

function renderHero(hero){

const heroContainer = document.getElementById("hero");

if(!heroContainer) return;

const produto = produtos[hero.produto];

if(!produto){
console.log("Produto do hero não encontrado");
return;
}

heroContainer.innerHTML = `
<div class="hero-card">

<img class="hero-image" src="${produto.image_url}">

<div class="hero-content">

<h2>${hero.title}</h2>

<p>${hero.description}</p>

<a class="hero-button" href="${produto.affiliate_url}" target="_blank">
${hero.cta}
</a>

</div>

</div>
`;

}

function renderKits(kits){

const track = document.querySelector(".carousel-track");

if(!track) return;

track.innerHTML = "";

kits.forEach(kit => {

const itemsHTML = kit.items.map(i => {

const p = produtos[i];

if(!p) return "";

return `
<div class="kit-item">

<img src="${p.image_url}" loading="lazy">

<a href="${p.affiliate_url}" target="_blank">
Ver oferta
</a>

</div>
`;

}).join("");

track.innerHTML += `

<div class="kit-card">

<h3>${kit.title}</h3>

<p>${kit.description}</p>

<div class="kit-items">

${itemsHTML}

</div>

</div>

`;

});

}


document.addEventListener("DOMContentLoaded", async () => {

await carregarProdutos();
await carregarDestaques();

});

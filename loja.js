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

const produtos = await resposta.json();

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
}

}

catch(erro){

console.error("Erro ao carregar destaques:", erro);

}

}

function renderHero(hero){

const heroCard = document.querySelector(".hero-card");

if(!heroCard) return;

heroCard.innerHTML = `
<img src="${hero.image_url}" class="hero-image" alt="${hero.title}">

<div class="hero-content">

<h2>🎸 ${hero.title}</h2>

<p>${hero.description}</p>

<a
href="${hero.affiliate_url}"
target="_blank"
class="hero-button">

Ver oferta no Mercado Livre →

</a>

</div>
`;

}

function renderKits(kits){

const track = document.querySelector(".carousel-track");

if(!track) return;

track.innerHTML = "";

kits.forEach(kit => {

let itensHTML = "";

kit.items.forEach(item => {

itensHTML += `
<div class="kit-item">

<img src="${item.image_url}">

<a
href="${item.affiliate_url}"
target="_blank">

Ver oferta

</a>

</div>
`;

});

track.innerHTML += `
<div class="kit-card">

<h3>${kit.title}</h3>

<div class="kit-items">
${itensHTML}
</div>

</div>
`;

});

}


document.addEventListener("DOMContentLoaded", () => {

carregarProdutos();
carregarDestaques();

});

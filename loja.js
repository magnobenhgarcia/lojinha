async function carregarProdutos() {

const grid = document.getElementById("produtos");
const categoriasContainer = document.getElementById("categorias");
const loading = document.getElementById("loading");
const empty = document.getElementById("empty");

try {

```
const resposta = await fetch("data/produtos.json");
const produtos = await resposta.json();

loading.style.display = "none";

if (!produtos.length) {
  empty.classList.remove("hidden");
  return;
}

produtos.sort((a, b) => (a.order || 0) - (b.order || 0));

const categorias = [
  "Todos",
  ...new Set(produtos.map(p => p.category).filter(Boolean))
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
```

<article class="card">

<div class="card-image-wrap">

<img
src="${produto.image_url}"
class="produto-img"
alt="${produto.title}"
loading="lazy"

>

<img
src="./img/selo_afiliado_mercado_livre.png"
class="selo-card"
alt="Afiliado Mercado Livre"

>

</div>

<div class="card-content">

<h3 class="card-title">${produto.title}</h3>

<p class="card-price">${produto.price}</p>

<p class="card-description">${produto.description || ""}</p>

<a
href="${produto.affiliate_url}"
target="_blank"
rel="noopener noreferrer"
class="card-button"

>

Aproveite o desconto </a>

</div>

</article>
`;
    }

```
function renderizarProdutos(categoria = "Todos") {

  let lista = produtos;

  if (categoria !== "Todos") {
    lista = produtos.filter(p => p.category === categoria);
  }

  grid.innerHTML = lista.map(criarCard).join("");

}

renderizarCategorias();
renderizarProdutos();
```

}

catch (erro) {

```
console.error(erro);

loading.style.display = "none";
empty.classList.remove("hidden");
```

}

}

document.addEventListener("DOMContentLoaded", carregarProdutos);

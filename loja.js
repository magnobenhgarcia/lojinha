async function carregarProdutos() {

const grid = document.getElementById("produtos")
const categoriasContainer = document.getElementById("categorias")
const loading = document.getElementById("loading")
const empty = document.getElementById("empty")

try {

```
const resposta = await fetch("./data/produtos.json")

if (!resposta.ok) {
  throw new Error("Erro ao carregar produtos.json")
}

const produtos = await resposta.json()

// esconder loading
if (loading) {
  loading.style.display = "none"
}

if (!produtos || produtos.length === 0) {
  if (empty) {
    empty.classList.remove("hidden")
  }
  return
}

// ordenar
produtos.sort((a, b) => (a.order || 0) - (b.order || 0))

// extrair categorias
const categorias = [
  "Todos",
  ...new Set(
    produtos
      .map(p => p.category)
      .filter(c => c && String(c).trim() !== "")
  )
]

function renderizarCategorias() {

  if (!categoriasContainer) return

  categoriasContainer.innerHTML = ""

  categorias.forEach((categoria, index) => {

    const btn = document.createElement("button")

    btn.textContent = categoria
    btn.className = "categoria-btn"

    if (index === 0) {
      btn.classList.add("active")
    }

    btn.addEventListener("click", () => {

      document
        .querySelectorAll(".categoria-btn")
        .forEach(b => b.classList.remove("active"))

      btn.classList.add("active")

      renderizarProdutos(categoria)

    })

    categoriasContainer.appendChild(btn)

  })

}

function criarCard(produto) {

  const image = produto.image_url || produto.image || ""
  const title = produto.title || ""
  const description = produto.description || ""
  const price = produto.price || ""
  const link = produto.affiliate_url || produto.affiliate_link || "#"

  return `
    <article class="card">

      <div class="card-image-wrap">

        <img
          src="${image}"
          class="produto-img"
          alt="${title}"
          loading="lazy"
        >

        <img
          src="./img/selo_afiliado_mercado_livre.png"
          class="selo-card"
          alt="Afiliado Mercado Livre"
        >

      </div>

      <div class="card-content">

        <h3 class="card-title">${title}</h3>

        <p class="card-price">${price}</p>

        <p class="card-description">${description}</p>

        <a
          href="${link}"
          target="_blank"
          rel="noopener noreferrer"
          class="card-button"
        >
          Aproveite o desconto
        </a>

      </div>

    </article>
  `
}

function renderizarProdutos(categoria = "Todos") {

  let lista = produtos

  if (categoria !== "Todos") {
    lista = produtos.filter(p => p.category === categoria)
  }

  grid.innerHTML = ""

  if (!lista.length) {
    if (empty) {
      empty.classList.remove("hidden")
    }
    return
  }

  if (empty) {
    empty.classList.add("hidden")
  }

  grid.innerHTML = lista.map(criarCard).join("")

}

renderizarCategorias()
renderizarProdutos()
```

}

catch (erro) {

```
console.error(erro)

if (loading) {
  loading.style.display = "none"
}

if (empty) {
  empty.classList.remove("hidden")
}
```

}

}

document.addEventListener("DOMContentLoaded", carregarProdutos)

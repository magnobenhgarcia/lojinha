async function carregarProdutos() {
  try {
    const resposta = await fetch("data/produtos.json");

    if (!resposta.ok) {
      throw new Error("Erro ao carregar produtos.json");
    }

    const produtos = await resposta.json();

    const grid = document.getElementById("produtos");
    const filtros = document.getElementById("categorias");

    if (!grid) {
      throw new Error("Elemento #produtos não encontrado");
    }

    // ordenar como no Base44
    produtos.sort((a, b) => (a.order || 0) - (b.order || 0));

    const categorias = [
      "Todos",
      ...new Set(
        produtos
          .map((p) => p.category)
          .filter((c) => c && String(c).trim() !== "")
      ),
    ];

    function renderizarCategorias() {
      if (!filtros) return;

      filtros.innerHTML = "";

      categorias.forEach((categoria, index) => {
        const btn = document.createElement("button");
        btn.className = "categoria-btn" + (index === 0 ? " active" : "");
        btn.textContent = categoria;
        btn.dataset.categoria = categoria;

        btn.addEventListener("click", () => {
          document
            .querySelectorAll(".categoria-btn")
            .forEach((b) => b.classList.remove("active"));

          btn.classList.add("active");
          renderizarProdutos(categoria);
        });

        filtros.appendChild(btn);
      });
    }

    function criarCard(produto) {
      const imageUrl = produto.image_url || produto.image || "";
      const title = produto.title || "";
      const description = produto.description || "";
      const price = produto.price || "";
      const affiliateUrl = produto.affiliate_url || produto.affiliate_link || "#";
      return `
        <article class="card">
          <div class="card-image-wrap">
            <img
              src="${imageUrl}"
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
              href="${affiliateUrl}"
              target="_blank"
              rel="noopener noreferrer"
              class="card-button"
            >
              Aproveite o desconto
            </a>
          </div>
        </article>
      `;
    }

    function renderizarProdutos(categoria = "Todos") {
      let lista = produtos;

      if (categoria !== "Todos") {
        lista = produtos.filter((p) => p.category === categoria);
      }

      grid.innerHTML = "";

      if (!lista.length) {
        grid.innerHTML = `
          <div class="sem-produtos">
            Nenhum produto disponível nesta categoria.
          </div>
        `;
        return;
      }

      grid.innerHTML = lista.map(criarCard).join("");
    }

    renderizarCategorias();
    renderizarProdutos("Todos");
  } catch (erro) {
    console.error(erro);

    const grid = document.getElementById("produtos");
    if (grid) {
      grid.innerHTML = `
        <div class="sem-produtos">
          Não foi possível carregar os produtos.
        </div>
      `;
    }
  }
}

document.addEventListener("DOMContentLoaded", carregarProdutos);

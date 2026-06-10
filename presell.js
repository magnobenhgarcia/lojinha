const moneyRegex = /^R\$\s?[\d.,]+$/;

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizarProduto(produto) {
  return {
    ...produto,
    title: produto.title || "Produto recomendado",
    description: produto.description || "",
    price: moneyRegex.test(produto.price || "") ? produto.price : "",
    category: produto.category || "Oferta",
    image_url: produto.image_url || "",
    affiliate_url: produto.affiliate_url || "#",
    order: Number(produto.order || 0)
  };
}

function resolvePath(path = "") {
  if (/^(https?:|data:|\/)/.test(path)) {
    return path;
  }

  return path;
}

function getBasePath() {
  return document.body?.dataset.basePath || "";
}

function resolveDataPath(path = "") {
  if (/^(https?:|data:|\/)/.test(path)) {
    return path;
  }

  return `${getBasePath()}${path}`;
}

async function carregarJSON(path) {
  const resposta = await fetch(`${path}?v=${Date.now()}`, {
    cache: "no-store"
  });

  if (!resposta.ok) {
    throw new Error("Erro ao carregar produto.");
  }

  return resposta.json();
}

function getProdutoSolicitado(produtos) {
  const params = new URLSearchParams(window.location.search);
  const ordem = Number(
    params.get("produto") ||
    params.get("p") ||
    document.body?.dataset.produto ||
    0
  );

  if (ordem) {
    return produtos.find((produto) => Number(produto.order) === ordem);
  }

  return null;
}

function renderizarProduto(produto) {
  const container = document.getElementById("presellProduto");

  if (!container) return;

  document.title = `${produto.title} | Lojinha Magno Garcia`;

  container.innerHTML = `
    <article class="product-card presell-card">
      <div class="product-surface">
        <div class="product-category">${escapeHtml(produto.category)}</div>

        <div class="product-image-wrap">
          <img src="${escapeHtml(resolvePath(produto.image_url))}" class="produto-img" alt="${escapeHtml(produto.title)}">
          <img src="${escapeHtml(resolveDataPath("assets/selo_afiliado_mercado_livre.png"))}" class="selo-card" alt="Afiliado Mercado Livre">
        </div>

        <div class="card-content">
          <h2 class="card-title">${escapeHtml(produto.title)}</h2>
          ${produto.price ? `<p class="card-price">${escapeHtml(produto.price)}</p>` : ""}
          <p class="card-description">${escapeHtml(produto.description)}</p>
          <a href="${escapeHtml(produto.affiliate_url)}" target="_blank" rel="noopener noreferrer" class="card-button">
            Ver oferta
          </a>
          <div class="card-safe">Abre no site oficial do Mercado Livre</div>
        </div>
      </div>
    </article>
  `;
}

async function iniciarPresell() {
  const status = document.getElementById("presellStatus");

  try {
    const produtos = (await carregarJSON(resolveDataPath("data/produtos.json")))
      .map(normalizarProduto)
      .sort((a, b) => a.order - b.order);
    const produto = getProdutoSolicitado(produtos);

    if (!produto) {
      if (status) status.textContent = "Oferta não encontrada.";
      return;
    }

    if (status) status.hidden = true;
    renderizarProduto(produto);
  } catch (erro) {
    console.error(erro);
    if (status) status.textContent = "Não consegui carregar esta oferta.";
  }
}

document.addEventListener("DOMContentLoaded", iniciarPresell);

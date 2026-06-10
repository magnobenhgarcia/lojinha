let produtos = [];
let kits = [];
let kitAtual = 0;

const moneyRegex = /^R\$\s?[\d.,]+$/;
const pageConfig = document.body?.dataset || {};
const basePath = pageConfig.basePath || "./";
const fixedCategory = pageConfig.pageCategory || "";
const excludedCategories = (pageConfig.excludeCategories || "")
  .split("|")
  .map((category) => category.trim())
  .filter(Boolean);

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function resolvePath(path = "") {
  if (/^(https?:|data:|\/)/.test(path)) {
    return path;
  }

  return `${basePath}${path}`;
}

function normalizarProduto(produto) {
  return {
    ...produto,
    title: produto.title || "Produto recomendado",
    description: produto.description || "",
    price: moneyRegex.test(produto.price || "") ? produto.price : "",
    category: produto.category || "Outros",
    image_url: produto.image_url || "",
    affiliate_url: produto.affiliate_url || "#",
    order: Number(produto.order || 0)
  };
}

async function carregarJSON(path) {
  const separator = path.includes("?") ? "&" : "?";
  const resposta = await fetch(`${path}${separator}v=${Date.now()}`, {
    cache: "no-store"
  });

  if (!resposta.ok) {
    throw new Error(`Erro ao carregar ${path}`);
  }

  return resposta.json();
}

async function carregarProdutos() {
  const grid = document.getElementById("produtos");
  const categoriasContainer = document.getElementById("categorias");
  const loading = document.getElementById("loading");
  const empty = document.getElementById("empty");

  try {
    loading?.classList.remove("hidden");
    empty?.classList.add("hidden");

    const dados = await carregarJSON(resolvePath("data/produtos.json"));

    produtos = dados
      .map(normalizarProduto)
      .filter((produto) => !excludedCategories.includes(produto.category))
      .sort((a, b) => a.order - b.order);

    loading?.classList.add("hidden");

    if (!produtos.length) {
      grid.innerHTML = "";
      empty?.classList.remove("hidden");
      return;
    }

    renderizarCategorias(categoriasContainer);
    renderizarProdutos(fixedCategory || "Todos");
  } catch (erro) {
    console.error("Erro:", erro);
    loading?.classList.add("hidden");
    empty?.classList.remove("hidden");
  }
}

function renderizarCategorias(container) {
  if (!container) return;

  if (fixedCategory) {
    container.innerHTML = "";
    container.classList.add("hidden");
    return;
  }

  const categorias = ["Todos", ...new Set(produtos.map((produto) => produto.category))];

  container.innerHTML = categorias
    .map((categoria, index) => `
      <button class="categoria-btn ${index === 0 ? "active" : ""}" type="button" data-category="${escapeHtml(categoria)}">
        ${escapeHtml(categoria)}
      </button>
    `)
    .join("");

  container.querySelectorAll(".categoria-btn").forEach((botao) => {
    botao.addEventListener("click", () => {
      container.querySelectorAll(".categoria-btn").forEach((item) => item.classList.remove("active"));
      botao.classList.add("active");
      renderizarProdutos(botao.dataset.category);
    });
  });
}

function renderizarProdutos(categoria = "Todos") {
  const grid = document.getElementById("produtos");
  const empty = document.getElementById("empty");

  if (!grid) return;

  const lista = categoria === "Todos"
    ? produtos
    : produtos.filter((produto) => produto.category === categoria);

  if (!lista.length) {
    grid.innerHTML = "";
    empty?.classList.remove("hidden");
    return;
  }

  empty?.classList.add("hidden");
  grid.innerHTML = lista.map(criarCardProduto).join("");
}

function criarCardProduto(produto) {
  return `
    <article class="product-card">
      <div class="product-surface">
        <div class="product-category">${escapeHtml(produto.category)}</div>

        <div class="product-image-wrap">
          <img src="${escapeHtml(resolvePath(produto.image_url))}" class="produto-img" alt="${escapeHtml(produto.title)}" loading="lazy">
          <img src="${escapeHtml(resolvePath("assets/selo_afiliado_mercado_livre.png"))}" class="selo-card" alt="Afiliado Mercado Livre" loading="lazy">
        </div>

        <div class="card-content">
          <h3 class="card-title">${escapeHtml(produto.title)}</h3>
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

async function carregarDestaques() {
  try {
    const dados = await carregarJSON(resolvePath("data/destaques.json"));
    const heroContainer = document.getElementById("hero");
    const kitsPanel = document.querySelector(".kits-panel");
    const featuredLayout = document.querySelector(".featured-layout");
    const showcaseSection = document.querySelector(".showcase-section");
    const heroVisivel = dados.hero && dados.hero.visible !== false;
    const kitsVisivel = dados.kitsVisible !== false;

    if (heroVisivel) {
      renderHero(dados.hero);
      heroContainer?.removeAttribute("hidden");
    } else {
      if (heroContainer) heroContainer.hidden = true;
    }

    kits = kitsVisivel && Array.isArray(dados.kits) ? dados.kits : [];

    if (kits.length) {
      kitsPanel?.removeAttribute("hidden");
      renderKits();
      iniciarCarrossel();
    } else if (kitsPanel) {
      kitsPanel.hidden = true;
    }

    featuredLayout?.classList.toggle("single-feature", heroVisivel !== Boolean(kits.length));

    if (!heroVisivel && !kits.length && showcaseSection) {
      showcaseSection.hidden = true;
    }
  } catch (erro) {
    console.error("Erro ao carregar destaques:", erro);
  }
}

function getProdutoPorIndice(indice) {
  return produtos[Number(indice)] || null;
}

function renderHero(hero) {
  const heroContainer = document.getElementById("hero");
  const produto = getProdutoPorIndice(hero.produto);

  if (!heroContainer || !produto) return;

  heroContainer.innerHTML = `
    <div class="recommendation-surface">
      <div class="recommendation-content">
        <div class="recommendation-image-wrap">
          <img class="recommendation-product" src="${escapeHtml(resolvePath(produto.image_url))}" alt="${escapeHtml(produto.title)}">
        </div>
        <span class="recommendation-kicker">Escolha do Professor</span>
        <h3>${escapeHtml(hero.title || produto.title)}</h3>
        <p>${escapeHtml(hero.description || produto.description)}</p>
      </div>
      <a class="button-primary" href="${escapeHtml(produto.affiliate_url)}" target="_blank" rel="noopener noreferrer">
        ${escapeHtml(hero.cta || "Ver oferta")}
      </a>
    </div>
  `;
}

function renderKits() {
  const track = document.querySelector(".carousel-track");

  if (!track) return;

  track.innerHTML = kits.map((kit) => {
    const itemsHTML = (kit.items || [])
      .map((indice) => getProdutoPorIndice(indice))
      .filter(Boolean)
      .slice(0, 3)
      .map((produto) => `
        <div class="kit-item">
          <img src="${escapeHtml(resolvePath(produto.image_url))}" alt="${escapeHtml(produto.title)}" loading="lazy">
          <a href="${escapeHtml(produto.affiliate_url)}" target="_blank" rel="noopener noreferrer">Oferta</a>
        </div>
      `)
      .join("");

    return `
      <article class="kit-card">
        <div>
          <h4>${escapeHtml(kit.title || "Kit recomendado")}</h4>
          <p>${escapeHtml(kit.description || "")}</p>
        </div>
        <div class="kit-items">${itemsHTML}</div>
      </article>
    `;
  }).join("");

  atualizarCarrossel();
}

function iniciarCarrossel() {
  const prev = document.querySelector(".carousel-prev");
  const next = document.querySelector(".carousel-next");

  if (!prev || !next) return;

  prev.addEventListener("click", () => {
    if (!kits.length) return;
    kitAtual = (kitAtual - 1 + kits.length) % kits.length;
    atualizarCarrossel();
  });

  next.addEventListener("click", () => {
    if (!kits.length) return;
    kitAtual = (kitAtual + 1) % kits.length;
    atualizarCarrossel();
  });
}

function atualizarCarrossel() {
  const track = document.querySelector(".carousel-track");
  const card = track?.querySelector(".kit-card");

  if (!track || !card) return;

  const gap = 0;
  const deslocamento = kitAtual * (card.getBoundingClientRect().width + gap);
  track.style.transform = `translateX(-${deslocamento}px)`;
}

document.addEventListener("DOMContentLoaded", async () => {
  await carregarProdutos();
  await carregarDestaques();
  window.addEventListener("resize", atualizarCarrossel);
});

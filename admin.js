let produtos = [];

async function fetchJSONSemCache(path){
const separator = path.includes("?") ? "&" : "?";
const res = await fetch(`${path}${separator}v=${Date.now()}`, {
cache: "no-store"
});

if(!res.ok){
throw new Error(`Erro ao carregar ${path}`);
}

return res.json();
}

function normalizarImagemAdmin(src = ""){
if(!src) return "";
if(src.startsWith("http") || src.startsWith("data:") || src.startsWith("/")) return src;
return src;
}

async function carregarProdutos(){

produtos = await fetchJSONSemCache("data/produtos.json");

renderizarProdutos();

}

async function carregarDestaquesAdmin(){

try{

destaques = await fetchJSONSemCache("data/destaques.json");

}catch(erro){

console.error("Erro ao carregar destaques no admin:", erro);

destaques = {
hero:null,
kits:[]
};

}

}

async function iniciarAdmin(){

await carregarProdutos();
await carregarDestaquesAdmin();

}

iniciarAdmin();

document.addEventListener("DOMContentLoaded", () => {

const tokenInput = document.getElementById("github-token-field");
const saveToken = document.getElementById("save-token");
const clearToken = document.getElementById("clear-token");

if(tokenInput && localStorage.getItem("github_token")){
tokenInput.placeholder = "Token salvo neste navegador";
}

if(saveToken){
saveToken.addEventListener("click", () => {
const token = tokenInput.value.trim();
if(!token){
alert("Cole um token antes de salvar.");
return;
}
localStorage.setItem("github_token", token);
tokenInput.value = "";
tokenInput.placeholder = "Token salvo neste navegador";
mostrarMensagem("Token salvo ✔");
});
}

if(clearToken){
clearToken.addEventListener("click", () => {
localStorage.removeItem("github_token");
if(tokenInput){
tokenInput.value = "";
tokenInput.placeholder = "Cole seu token aqui";
}
mostrarMensagem("Token apagado");
});
}

});

let editandoIndex = null;
let menorPrecoIndex = null;
let editandoKitIndex = null;
let produtoPreviewAtual = null;

let destaques = {
  hero: null,
  kits: []
};

function salvarLocal(){
/* não salvamos mais produtos no localStorage */
}

function escaparHtml(valor = ""){
return String(valor)
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#039;");
}

function criarSlugMercadoLivre(texto = ""){
return texto
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.replace(/[^a-zA-Z0-9]+/g,"-")
.replace(/^-+|-+$/g,"")
.toLowerCase();
}

function gerarUrlBuscaMenorPreco(produto){
const slug = criarSlugMercadoLivre(produto.title || "");
return `https://lista.mercadolivre.com.br/${slug}_OrderId_PRICE`;
}

function atualizarCategorias(){

const select = document.getElementById("categoriaSelect");

select.innerHTML = `<option value="">Selecionar existente</option>`;

const categorias = [...new Set(produtos.map(p => p.category).filter(Boolean))];

categorias.forEach(cat =>{

const option = document.createElement("option");

option.value = cat;
option.textContent = cat;

select.appendChild(option);

});

}

function normalizarOrdensProdutos(){
produtos = produtos
.map((produto, indiceOriginal) => ({ produto, indiceOriginal }))
.sort((a, b) => {
const ordemA = Number(a.produto.order || 0);
const ordemB = Number(b.produto.order || 0);

if(ordemA !== ordemB){
return ordemA - ordemB;
}

return a.indiceOriginal - b.indiceOriginal;
})
.map(({ produto }, index) => ({
...produto,
order: index + 1
}));

return produtos;
}

function reposicionarProduto(produto, indiceAtual){
const listaOrdenada = produtos
.map((item, indiceOriginal) => ({ item, indiceOriginal }))
.filter(({ indiceOriginal }) => indiceOriginal !== indiceAtual)
.sort((a, b) => {
const ordemA = Number(a.item.order || 0);
const ordemB = Number(b.item.order || 0);

if(ordemA !== ordemB){
return ordemA - ordemB;
}

return a.indiceOriginal - b.indiceOriginal;
})
.map(({ item }) => item);

const total = listaOrdenada.length + 1;
const ordemDesejada = Math.min(
Math.max(parseInt(produto.order, 10) || total, 1),
total
);

listaOrdenada.splice(ordemDesejada - 1, 0, produto);
produtos = listaOrdenada.map((item, index) => ({
...item,
order: index + 1
}));

return ordemDesejada - 1;
}

function renderizarProdutos(){

const lista = document.getElementById("listaProdutos");

lista.innerHTML = "";

normalizarOrdensProdutos();

produtos.forEach((p,index)=>{

const item = document.createElement("div");
item.className = "produto-item";

item.innerHTML = `
<img src="${normalizarImagemAdmin(p.image_url)}">

<div class="produto-info">

<div class="produto-title">${p.title}</div>

<div class="produto-price">${p.price}</div>

<div>${p.description || ""}</div>

<div>Ordem: ${p.order}</div>

</div>

<div class="produto-actions">

<button class="ghost-action" onclick="abrirMenorPreco(${index})">Menor preço</button>

<button onclick="editarProduto(${index})">Editar</button>

<button onclick="excluirProduto(${index})">Excluir</button>

</div>
`;

lista.appendChild(item);

});

atualizarCategorias();

}

function abrirMenorPreco(index){
menorPrecoIndex = index;

const produto = produtos[index];
const buscaUrl = gerarUrlBuscaMenorPreco(produto);
const produtoAtualUrl = produto.mercado_livre_url || produto.affiliate_url || "";
const conteudo = document.getElementById("menorPrecoConteudo");

conteudo.innerHTML = `
<div class="menor-preco-card">
  <img src="${escaparHtml(normalizarImagemAdmin(produto.image_url))}" alt="">
  <div>
    <p class="eyebrow">Produto de referência</p>
    <h3>${escaparHtml(produto.title)}</h3>
    <p class="menor-preco-price">Preço atual na lojinha: ${escaparHtml(produto.price || "sem preço")}</p>
    <p>Abra a busca ordenada pelo menor preço, confira se é o mesmo produto e gere o link de afiliado no Mercado Livre.</p>
  </div>
</div>
<div class="menor-preco-links">
  <a href="${escaparHtml(buscaUrl)}" target="_blank" rel="noopener noreferrer">Abrir busca por menor preço</a>
  ${produtoAtualUrl ? `<a href="${escaparHtml(produtoAtualUrl)}" target="_blank" rel="noopener noreferrer">Abrir produto atual</a>` : ""}
</div>
<label>Busca gerada
  <input id="menorPrecoUrl" type="text" readonly value="${escaparHtml(buscaUrl)}">
</label>
<label>Link do anúncio escolhido
  <input id="menorPrecoNovoLink" type="url" placeholder="Cole aqui o link do produto mais barato">
</label>
<label>Link afiliado novo
  <input id="menorPrecoNovoAfiliado" type="url" placeholder="Depois de gerar no ML, cole aqui">
</label>
<label>HTML do anúncio escolhido
  <textarea id="menorPrecoNovoHtml" rows="5" placeholder="Opcional: cole aqui o código-fonte do anúncio novo para trocar título, preço e imagem"></textarea>
</label>
`;

document.getElementById("modalMenorPreco").style.display = "flex";
}

function fecharMenorPreco(){
document.getElementById("modalMenorPreco").style.display = "none";
menorPrecoIndex = null;
}

function abrirBuscaMenorPreco(){
if(menorPrecoIndex === null) return;
window.open(gerarUrlBuscaMenorPreco(produtos[menorPrecoIndex]), "_blank", "noopener");
}

async function copiarTituloMenorPreco(){
if(menorPrecoIndex === null) return;
const titulo = produtos[menorPrecoIndex].title || "";

try{
await navigator.clipboard.writeText(titulo);
mostrarMensagem("Título copiado");
}catch(erro){
prompt("Copie o titulo do produto:", titulo);
}
}

function aplicarMenorPrecoNoProduto(){
if(menorPrecoIndex === null) return;

const novoLink = document.getElementById("menorPrecoNovoLink").value.trim();
const novoAfiliado = document.getElementById("menorPrecoNovoAfiliado").value.trim();
const novoHtml = document.getElementById("menorPrecoNovoHtml").value.trim();

if(!novoLink && !novoAfiliado && !novoHtml){
alert("Cole pelo menos o link do anúncio escolhido, o link afiliado novo ou o HTML do anúncio novo.");
return;
}

if(novoLink){
produtos[menorPrecoIndex].mercado_livre_url = novoLink;
produtos[menorPrecoIndex].product_html_snapshot = "";
delete produtos[menorPrecoIndex].html_file;
}

if(novoAfiliado){
produtos[menorPrecoIndex].affiliate_url = novoAfiliado;
}

if(novoHtml){
const dados = extrairDadosDoHtml(novoHtml);

if(dados.title){
produtos[menorPrecoIndex].title = dados.title;
produtos[menorPrecoIndex].description = dados.description;
}

if(dados.price){
produtos[menorPrecoIndex].price = dados.price;
}

if(dados.image){
produtos[menorPrecoIndex].image_url = dados.image;
}

if(!novoLink && dados.url){
produtos[menorPrecoIndex].mercado_livre_url = dados.url;
}

produtos[menorPrecoIndex].product_html_snapshot = novoHtml;
delete produtos[menorPrecoIndex].html_file;
}

renderizarProdutos();
fecharMenorPreco();
mostrarMensagem(novoHtml ? "Dados novos aplicados na oferta" : "Link aplicado na oferta");
}

function abrirModal(){

editandoIndex = null;

document.getElementById("modalProduto").style.display = "flex";

limparCampos();

document.getElementById("ordem").value = produtos.length + 1;

}

function fecharModal(){
document.getElementById("modalProduto").style.display = "none";
}

function limparCampos(){

document.getElementById("titulo").value = "";
document.getElementById("descricao").value = "";
document.getElementById("produtoLink").value = "";
document.getElementById("htmlProduto").value = "";
document.getElementById("linkAfiliado").value = "";
document.getElementById("preco").value = "";
document.getElementById("imagem").value = "";
document.getElementById("ordem").value = "";
document.getElementById("categoriaInput").value = "";
document.getElementById("categoriaSelect").value = "";

}

function obterProdutoDoFormulario(){

let ordemInput = document.getElementById("ordem").value;

let ordemFinal;

if(ordemInput){

ordemFinal = parseInt(ordemInput);

}else{

if(produtos.length === 0){
ordemFinal = 1;
}else{

const maiorOrdem = Math.max(...produtos.map(p=>p.order || 0));
ordemFinal = maiorOrdem + 1;

}

}

const produto = {

title: document.getElementById("titulo").value,
description: document.getElementById("descricao").value,
mercado_livre_url: document.getElementById("produtoLink").value,
affiliate_url: document.getElementById("linkAfiliado").value,
price: document.getElementById("preco").value,
image_url: document.getElementById("imagem").value,
category:
document.getElementById("categoriaInput").value ||
document.getElementById("categoriaSelect").value,
order: ordemFinal,
product_html_snapshot: document.getElementById("htmlProduto").value

};

return produto;
}

function salvarProduto(){

const produto = obterProdutoDoFormulario();

reposicionarProduto(produto, editandoIndex);

salvarLocal();
renderizarProdutos();
fecharModal();

}

function sincronizarProdutoAberto(){
const modal = document.getElementById("modalProduto");

if(!modal || modal.style.display !== "flex"){
return;
}

const produto = obterProdutoDoFormulario();

editandoIndex = reposicionarProduto(produto, editandoIndex);

renderizarProdutos();
}

async function editarProduto(index){

const p = produtos[index];

editandoIndex = index;

document.getElementById("modalProduto").style.display = "flex";

document.getElementById("titulo").value = p.title;
document.getElementById("descricao").value = p.description;
document.getElementById("produtoLink").value = p.mercado_livre_url || "";
document.getElementById("linkAfiliado").value = p.affiliate_url;
document.getElementById("preco").value = p.price;
document.getElementById("imagem").value = p.image_url;
document.getElementById("categoriaInput").value = p.category;
document.getElementById("categoriaSelect").value = "";
document.getElementById("ordem").value = p.order;

if(p.product_html_snapshot){

document.getElementById("htmlProduto").value = p.product_html_snapshot;

}else if(p.html_file){

const res = await fetch(p.html_file);
const html = await res.text();

document.getElementById("htmlProduto").value = html;

}else{

document.getElementById("htmlProduto").value = "";

}

}

function excluirProduto(index){

if(!confirm("Excluir produto?")) return;

produtos.splice(index,1);
normalizarOrdensProdutos();

salvarLocal();
renderizarProdutos();

}

function formatarPreco(valor){

let numero = valor
.replace("R$","")
.replace(/\./g,"")
.replace(",",".")
.trim();

numero = Number(numero).toFixed(2);

return "R$ " + numero.replace(".",",");

}

function decodificarHtml(valor = ""){
const textarea = document.createElement("textarea");
textarea.innerHTML = valor;
return textarea.value;
}

function extrairDadosDoHtml(html){
const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
const urlMatch = html.match(/<meta property="og:url" content="([^"]+)"/) || html.match(/<link rel="canonical" href="([^"]+)"/);

let title = titleMatch ? decodificarHtml(titleMatch[1]) : "";
let image = imageMatch ? decodificarHtml(imageMatch[1]) : "";
let url = urlMatch ? decodificarHtml(urlMatch[1]) : "";
let price = "";

const priceMatch = title.match(/R\$\s?[\d\.,]+/);

if(priceMatch){

price = formatarPreco(priceMatch[0]);
title = title.replace(/-?\s?R\$\s?[\d\.,]+/,"").trim();

}

return {
title,
price,
image,
url,
description: title.substring(0,60)
};
}

function extrairDados(){

const html = document.getElementById("htmlProduto").value;
const produtoPreview = extrairDadosDoHtml(html);

if(!produtoPreview.title && !produtoPreview.image && !produtoPreview.price){
alert("Não consegui encontrar dados neste HTML. Confira se você copiou o código-fonte da página do produto.");
return;
}

mostrarPreview(produtoPreview);

}

function mostrarPreview(produto){

produtoPreviewAtual = produto;

const modal = document.createElement("div");

modal.className = "previewModal";

modal.innerHTML = `

<div class="preview-card">

<h2>Confirme o Produto</h2>

<div class="preview-image-box">
  <img src="${escaparHtml(produto.image)}" alt="${escaparHtml(produto.title || "Produto")}">
</div>

<h3>${escaparHtml(produto.title)}</h3>

<p class="preview-price">${escaparHtml(produto.price)}</p>

<p class="preview-description">${escaparHtml(produto.description)}</p>

<div class="preview-actions">

<button class="preview-cancel" onclick="fecharPreviewProduto()">
Cancelar
</button>

<button class="preview-confirm" onclick="confirmarPreviewAtual()">
Confirmar e usar
</button>

</div>

</div>

`;

document.body.appendChild(modal);

}

function fecharPreviewProduto(){
document.querySelector(".previewModal")?.remove();
produtoPreviewAtual = null;
}

function confirmarPreviewAtual(){
if(!produtoPreviewAtual) return;

confirmarPreview(
produtoPreviewAtual.title,
produtoPreviewAtual.price,
produtoPreviewAtual.image,
produtoPreviewAtual.description
);
}

function confirmarPreview(title,price,image,description){

document.getElementById("titulo").value = title;
document.getElementById("preco").value = price;
document.getElementById("imagem").value = image;
document.getElementById("descricao").value = description;

fecharPreviewProduto();

}

async function atualizarPrecos(){

for(const [index, p] of produtos.entries()){

let html = p.product_html_snapshot;

// 🔥 1. FALLBACK → se snapshot não existe
if(!html || typeof html !== "string" || html.trim() === ""){

  try{

    // gera caminho automático baseado no índice
    const caminho = `html/produto_${index+1}.html`;

    const res = await fetch(caminho);
    html = await res.text();

    // salva snapshot automaticamente
    p.product_html_snapshot = html;

    console.log("Snapshot recriado:", caminho);

  }catch(e){
    console.warn("Erro ao carregar HTML:", index+1, e);
    continue;
  }

}

// 🔥 2. EXTRAÇÃO (igual botão individual)

const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);

if(titleMatch){

  let title = titleMatch[1];

  const priceMatch = title.match(/R\$\s?[\d\.,]+/);

  if(priceMatch){
    p.price = formatarPreco(priceMatch[0]);
    title = title.replace(/-?\s?R\$\s?[\d\.,]+/,"").trim();
    p.title = title;
  }

}

if(imageMatch){
  p.image_url = imageMatch[1];
}

}

// 💾 salvar e atualizar UI
salvarLocal();
renderizarProdutos();

alert("Preços atualizados com fallback automático!");

}

function gerarJSON(){

const lista = produtos.map(p=>({

title: p.title,
description: p.description,
price: p.price,
image_url: p.image_url,
affiliate_url: p.affiliate_url,
category: p.category,
order: p.order

}));

return JSON.stringify(lista,null,2);

}

async function salvarArquivoGithub(token, owner, repo, path, conteudo, mensagem, tentativa = 1) {

const content = btoa(unescape(encodeURIComponent(conteudo)));

const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

const headers = {
Authorization:`token ${token}`,
Accept:"application/vnd.github+json"
};

const get = await fetch(`${url}?ref=main`,{
headers
});

let sha = null;

if(get.status === 200){

const data = await get.json();
sha = data.sha;

}else if(get.status === 401){

localStorage.removeItem("github_token");
throw new Error("TOKEN_INVALIDO");

}else if(get.status === 403){

throw new Error("O token não tem permissão para editar este repositório. No GitHub, ajuste o token com acesso ao repositório lojinha e permissão Contents: Read and write.");

}else if(get.status !== 404){

const erroGet = await get.text();
throw new Error(`Erro ao buscar SHA de ${path}: ${erroGet}`);

}

const put = await fetch(url,{

method:"PUT",

headers:{
...headers,
"Content-Type":"application/json"
},

body:JSON.stringify({

message:mensagem,
content:content,
sha:sha,
branch:"main"

})

});

if(put.status === 401){

localStorage.removeItem("github_token");
throw new Error("TOKEN_INVALIDO");

}

if(put.status === 403){

throw new Error("O token não tem permissão para salvar no GitHub. Ele precisa de Contents: Read and write no repositório lojinha.");

}

if(put.status === 409 && tentativa < 3){

console.warn(`Conflito de SHA ao salvar ${path}. Tentando novamente...`);
await new Promise(resolve => setTimeout(resolve, 700));
return salvarArquivoGithub(token, owner, repo, path, conteudo, mensagem, tentativa + 1);

}

if(!put.ok){

const erro = await put.text();
throw new Error(`Erro ao salvar ${path}: ${erro}`);

}

console.log("Arquivo salvo com Sucesso!:",path);
return put.json();

}

async function carregarArquivoGithubJSON(token, owner, repo, path) {
const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=main&v=${Date.now()}`;

const resposta = await fetch(url, {
headers: {
Authorization:`token ${token}`,
Accept:"application/vnd.github+json"
},
cache: "no-store"
});

if(resposta.status === 401){
localStorage.removeItem("github_token");
throw new Error("TOKEN_INVALIDO");
}

if(!resposta.ok){
const erro = await resposta.text();
throw new Error(`Erro ao conferir ${path}: ${erro}`);
}

const arquivo = await resposta.json();
const conteudo = decodeURIComponent(escape(atob(arquivo.content.replace(/\n/g, ""))));
return JSON.parse(conteudo);
}

function aguardar(ms){
return new Promise(resolve => setTimeout(resolve, ms));
}

function getProdutosPublicosURL(owner, repo){
const emArquivoLocal = window.location.protocol === "file:";
const emLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

if(emArquivoLocal || emLocalhost){
return `https://raw.githubusercontent.com/${owner}/${repo}/main/data/produtos.json`;
}

return new URL("data/produtos.json", window.location.href).href;
}

async function carregarProdutosPublicos(owner, repo){
const url = getProdutosPublicosURL(owner, repo);
const separator = url.includes("?") ? "&" : "?";
const resposta = await fetch(`${url}${separator}v=${Date.now()}`, {
cache: "no-store"
});

if(!resposta.ok){
throw new Error(`Erro ao conferir publicação da loja: ${resposta.status}`);
}

return resposta.json();
}

async function aguardarPublicacaoDaLoja(owner, repo, listaEsperada){
const ultimoEsperado = listaEsperada[listaEsperada.length - 1];

for(let tentativa = 0; tentativa < 12; tentativa++){
const listaPublica = await carregarProdutosPublicos(owner, repo);
const ultimoPublicado = listaPublica[listaPublica.length - 1];

if(
listaPublica.length === listaEsperada.length &&
ultimoPublicado?.title === ultimoEsperado?.title &&
Number(ultimoPublicado?.order) === Number(ultimoEsperado?.order)
){
return listaPublica;
}

await aguardar(5000);
}

return null;
}

async function salvarGithub() {
  try {
    let token = localStorage.getItem("github_token");

    if (!token) {
      token = prompt("Digite seu GitHub Token");
      if (!token) return;
      localStorage.setItem("github_token", token);
    }

    const owner = "magnobenhgarcia";
    const repo = "lojinha";

    sincronizarProdutoAberto();
    normalizarOrdensProdutos();

    console.log("Produtos antes de salvar:", produtos);

    for (const produto of produtos) {
      const html = produto.product_html_snapshot;

      if (html && html.trim()) {
        const path = `html/produto_${produto.order}.html`;

        await salvarArquivoGithub(
          token,
          owner,
          repo,
          path,
          html,
          `update produto ${produto.order}`
        );

        produto.html_file = path;
      }
    }

    const lista = produtos.map(p => {
      const produto = {
      title: p.title,
      description: p.description,
      price: p.price,
      image_url: p.image_url,
      affiliate_url: p.affiliate_url,
      category: p.category,
      order: p.order
      };

      if(p.mercado_livre_url){
        produto.mercado_livre_url = p.mercado_livre_url;
      }

      if(p.html_file){
        produto.html_file = p.html_file;
      }

      return produto;
    });

    await salvarArquivoGithub(
      token,
      owner,
      repo,
      "data/produtos.json",
      JSON.stringify(lista, null, 2),
      "update produtos"
    );

    const listaConfirmada = await carregarArquivoGithubJSON(
      token,
      owner,
      repo,
      "data/produtos.json"
    );

    if(listaConfirmada.length !== lista.length){
      throw new Error(`O GitHub confirmou ${listaConfirmada.length} produtos, mas o editor tentou salvar ${lista.length}. Reabra o editor antes de tentar de novo.`);
    }

    produtos = listaConfirmada;
    renderizarProdutos();

    const ultimoProduto = produtos[produtos.length - 1]?.title || "produto";
    mostrarMensagem(
      `Loja salva no GitHub. Aguardando publicar ${produtos.length} produtos...`,
      { persistente: true, carregando: true }
    );

    const listaPublicada = await aguardarPublicacaoDaLoja(owner, repo, listaConfirmada);

    if(listaPublicada){
      produtos = listaPublicada;
      renderizarProdutos();
      mostrarMensagem(`Loja publicada ✔ ${produtos.length} produtos. Último: ${ultimoProduto}`);
    }else{
      mostrarMensagem(`GitHub salvo ✔ ${produtos.length} produtos. A publicação ainda está processando.`);
    }
    
  }catch(erro){

if(erro.message === "TOKEN_INVALIDO"){

alert("Seu token GitHub expirou. Insira um novo token.");

localStorage.removeItem("github_token");

salvarGithub(); // tenta novamente

return;

}

console.error("ERRO AO SALVAR:",erro);

alert("Erro ao salvar no GitHub:\n\n"+erro.message);

}
}

let mensagemAtual = null;
let mensagemTimer = null;

function mostrarMensagem(texto, opcoes = {}){

if(mensagemAtual){
mensagemAtual.remove();
mensagemAtual = null;
}

if(mensagemTimer){
clearTimeout(mensagemTimer);
mensagemTimer = null;
}

const msg = document.createElement("div");
msg.className = `toast-message${opcoes.carregando ? " is-loading" : ""}`;
msg.innerHTML = `
  ${opcoes.carregando ? '<span class="toast-spinner" aria-hidden="true"></span>' : ""}
  <span>${escaparHtml(texto)}</span>
`;

document.body.appendChild(msg);
mensagemAtual = msg;

if(!opcoes.persistente){
mensagemTimer = setTimeout(()=>{
msg.remove();
if(mensagemAtual === msg){
mensagemAtual = null;
}
mensagemTimer = null;
},4200);
}

}


/* HERO */

function abrirHero(){

document.getElementById("modalHero").style.display="flex";

const select=document.getElementById("heroProduto");

select.innerHTML="";

produtos.forEach((p,i)=>{

const option=document.createElement("option");

option.value=i;

option.textContent=p.title;

select.appendChild(option);

});

const hero = destaques.hero || {};

document.getElementById("heroVisivel").checked = hero.visible !== false;
document.getElementById("heroProduto").value = hero.produto ?? 0;
document.getElementById("heroTitulo").value = hero.title || "";
document.getElementById("heroDescricao").value = hero.description || "";
document.getElementById("heroCTA").value = hero.cta || "";

/* mostrar hero atual */
renderListaHero();

}

function fecharHero(){
document.getElementById("modalHero").style.display="none";
}

async function salvarHero(){

destaques.hero={
visible:document.getElementById("heroVisivel").checked,
produto:Number(document.getElementById("heroProduto").value),
title:document.getElementById("heroTitulo").value,
description:document.getElementById("heroDescricao").value,
cta:document.getElementById("heroCTA").value
};

await salvarDestaquesGithub();

/* atualizar lista visual */
renderListaHero();

fecharHero();

alert("Hero salvo");

}
  
  function renderListaHero(){

const lista=document.getElementById("listaHero");

if(!destaques.hero){

lista.innerHTML="<p>Nenhum hero definido</p>";
return;

}

const p=produtos[destaques.hero.produto];

lista.innerHTML=`
<div class="produto-item">
<img src="${normalizarImagemAdmin(p?.image_url || "")}">
<div class="produto-info">
<div class="produto-title">${p?.title || "Produto não encontrado"}</div>
<div>${destaques.hero.visible === false ? "Hero oculto na lojinha" : "Hero visível na lojinha"}</div>
</div>
</div>
`;

}

/* KITS */

function abrirKits(){

document.getElementById("modalKits").style.display="flex";

editandoKitIndex = null;
document.getElementById("kitsVisivel").checked = destaques.kitsVisible !== false;
document.getElementById("kitTitulo").value = "";
document.getElementById("kitDescricao").value = "";
document.getElementById("kitCTA").value = "";
document.getElementById("kitProdutos").innerHTML="";

adicionarProdutoKit();

/* mostrar kits existentes */
renderListaKits();

}

function fecharKits(){
document.getElementById("modalKits").style.display="none";
}

function adicionarProdutoKit(){

const container=document.getElementById("kitProdutos");

const select=document.createElement("select");

produtos.forEach((p,i)=>{

const option=document.createElement("option");

option.value=i;

option.textContent=p.title;

select.appendChild(option);

});

container.appendChild(select);

}

function carregarKitParaEdicao(index){

const kit = destaques.kits[index];

if(!kit) return;

editandoKitIndex = index;

document.getElementById("kitTitulo").value = kit.title || "";
document.getElementById("kitDescricao").value = kit.description || "";
document.getElementById("kitCTA").value = kit.cta || "";

const container = document.getElementById("kitProdutos");
container.innerHTML = "";

(kit.items || []).forEach((produtoIndex) => {
adicionarProdutoKit();
const selects = container.querySelectorAll("select");
selects[selects.length - 1].value = produtoIndex;
});

if(!(kit.items || []).length){
adicionarProdutoKit();
}

mostrarMensagem("Kit carregado para edição");

}

async function salvarKit(){

const selects=document.querySelectorAll("#kitProdutos select");

const items=[...selects].map(s=>Number(s.value));

destaques.kitsVisible = document.getElementById("kitsVisivel").checked;

const kit={
title:document.getElementById("kitTitulo").value,
description:document.getElementById("kitDescricao").value,
cta:document.getElementById("kitCTA").value,
items:items
};

if(!kit.title){
await salvarDestaquesGithub();
renderListaKits();
mostrarMensagem("Configuração do carrossel salva");
return;
}

if(!Array.isArray(destaques.kits)){
destaques.kits = [];
}

if(editandoKitIndex === null){
destaques.kits.push(kit);
}else{
destaques.kits[editandoKitIndex] = kit;
}

await salvarDestaquesGithub();

/* atualizar lista visual */
renderListaKits();

editandoKitIndex = null;
document.getElementById("kitTitulo").value = "";
document.getElementById("kitDescricao").value = "";
document.getElementById("kitCTA").value = "";
document.getElementById("kitProdutos").innerHTML = "";
adicionarProdutoKit();

mostrarMensagem("Kit salvo");

}

  function renderListaKits(){

const lista=document.getElementById("listaKits");

lista.innerHTML="";

if(destaques.kitsVisible === false){
lista.innerHTML = `<p>Carrossel oculto na lojinha.</p>`;
}

destaques.kits.forEach((kit,i)=>{

lista.innerHTML+=`
<div class="kit-admin">

<h4>${kit.title}</h4>

<p>${kit.description}</p>

<button onclick="carregarKitParaEdicao(${i})">Editar</button>

<button onclick="removerKit(${i})">Remover</button>

</div>
`;

});

}

function removerKit(index){

if(!confirm("Remover este kit?")) return;

/* remove do array */
destaques.kits.splice(index,1);

/* redesenha a lista */
renderListaKits();

/* salva novamente no GitHub */
salvarDestaquesGithub();

}

async function salvarDestaquesGithub(){

let token = localStorage.getItem("github_token");

if(!token){
token = prompt("Digite seu GitHub Token");
localStorage.setItem("github_token", token);
}

const owner="magnobenhgarcia";
const repo="lojinha";

await salvarArquivoGithub(
token,
owner,
repo,
"data/destaques.json",
JSON.stringify(destaques,null,2),
"update destaques"
);

}

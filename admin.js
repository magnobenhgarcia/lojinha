let produtos = JSON.parse(localStorage.getItem("produtos_admin")) || [];

let editandoIndex = null;

function salvarLocal(){
localStorage.setItem("produtos_admin", JSON.stringify(produtos));
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

function renderizarProdutos(){

const lista = document.getElementById("listaProdutos");

lista.innerHTML = "";

produtos.sort((a,b)=>a.order-b.order);

produtos.forEach((p,index)=>{

const item = document.createElement("div");
item.className = "produto-item";

item.innerHTML = `
<img src="${p.image_url}">

<div class="produto-info">

<div class="produto-title">${p.title}</div>

<div class="produto-price">${p.price}</div>

<div>${p.description || ""}</div>

<div>Ordem: ${p.order}</div>

</div>

<div class="produto-actions">

<button onclick="editarProduto(${index})">Editar</button>

<button onclick="excluirProduto(${index})">Excluir</button>

</div>
`;

lista.appendChild(item);

});

atualizarCategorias();

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

function salvarProduto(){

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

if(editandoIndex === null){
produtos.push(produto);
}else{
produtos[editandoIndex] = produto;
}

salvarLocal();
renderizarProdutos();
fecharModal();

}

function editarProduto(index){

const p = produtos[index];

editandoIndex = index;

document.getElementById("modalProduto").style.display = "flex";

document.getElementById("titulo").value = p.title;
document.getElementById("descricao").value = p.description;
document.getElementById("produtoLink").value = p.mercado_livre_url;
document.getElementById("htmlProduto").value = p.product_html_snapshot;
document.getElementById("linkAfiliado").value = p.affiliate_url;
document.getElementById("preco").value = p.price;
document.getElementById("imagem").value = p.image_url;
document.getElementById("categoriaInput").value = p.category;
document.getElementById("categoriaSelect").value = "";
document.getElementById("ordem").value = p.order;

}

function excluirProduto(index){

if(!confirm("Excluir produto?")) return;

produtos.splice(index,1);

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

function extrairDados(){

const html = document.getElementById("htmlProduto").value;

const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);

let title = titleMatch ? titleMatch[1] : "";
let image = imageMatch ? imageMatch[1] : "";
let price = "";

const priceMatch = title.match(/R\$\s?[\d\.,]+/);

if(priceMatch){

price = formatarPreco(priceMatch[0]);
title = title.replace(/-?\s?R\$\s?[\d\.,]+/,"").trim();

}

const produtoPreview = {
title,
price,
image,
description: title.substring(0,60)
};

mostrarPreview(produtoPreview);

}

function mostrarPreview(produto){

const modal = document.createElement("div");

modal.style.position = "fixed";
modal.style.top = "0";
modal.style.left = "0";
modal.style.width = "100%";
modal.style.height = "100%";
modal.style.background = "rgba(0,0,0,0.8)";
modal.style.display = "flex";
modal.style.alignItems = "center";
modal.style.justifyContent = "center";

modal.innerHTML = `

<div style="
background:#2a0f4a;
padding:30px;
border-radius:16px;
max-width:400px;
text-align:center;
color:white;
">

<h2>🔎 Confirme o Produto</h2>

<img src="${produto.image}" style="width:100%;border-radius:10px;margin-bottom:10px;">

<h3>${produto.title}</h3>

<p style="color:#00e676;font-size:20px;font-weight:bold">
${produto.price}
</p>

<p>${produto.description}</p>

<div style="
margin-top:20px;
display:flex;
gap:12px;
justify-content:center;
">

<button
style="
padding:10px 16px;
border-radius:8px;
border:none;
background:#777;
color:white;
cursor:pointer;
font-weight:bold;
"
onclick="this.closest('.previewModal').remove()"
>
Cancelar
</button>

<button
style="
padding:10px 18px;
border-radius:8px;
border:none;
background:#ffe600;
color:black;
cursor:pointer;
font-weight:bold;
font-size:14px;
"
onclick="confirmarPreview('${produto.title}','${produto.price}','${produto.image}','${produto.description}')"
>
✔ Confirmar e usar
</button>

</div>

</div>

`;

modal.className = "previewModal";

document.body.appendChild(modal);

}

function confirmarPreview(title,price,image,description){

document.getElementById("titulo").value = title;
document.getElementById("preco").value = price;
document.getElementById("imagem").value = image;
document.getElementById("descricao").value = description;

document.querySelector(".previewModal").remove();

}

function atualizarPrecos(){

produtos.forEach(p=>{

const html = p.product_html_snapshot;

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

});

salvarLocal();
renderizarProdutos();

alert("Preços atualizados");

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

async function salvarGithub(){

let token = localStorage.getItem("github_token");

if(!token){

token = prompt("Digite seu GitHub Token");

if(!token) return;

localStorage.setItem("github_token", token);

}

const json = gerarJSON();
const content = btoa(unescape(encodeURIComponent(json)));

const owner = "magnobenhgarcia";
const repo = "lojinha";
const path = "data/produtos.json";

const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

const get = await fetch(url);
const data = await get.json();
const sha = data.sha;

await fetch(url,{

method:"PUT",

headers:{
Authorization:`Bearer ${token}`,
"Content-Type":"application/json"
},

body: JSON.stringify({

message:"update produtos",
content:content,
sha:sha,
branch:"main"

})

});

mostrarMensagem("Produtos salvos no GitHub ✔");

}

function mostrarMensagem(texto){

const msg = document.createElement("div");

msg.innerText = texto;

msg.style.position="fixed";
msg.style.bottom="30px";
msg.style.right="30px";
msg.style.background="#00a650";
msg.style.color="white";
msg.style.padding="12px 18px";
msg.style.borderRadius="10px";
msg.style.fontWeight="bold";
msg.style.zIndex="9999";

document.body.appendChild(msg);

setTimeout(()=>{
msg.remove();
},3000);

}

let destaques = JSON.parse(localStorage.getItem("destaques_admin")) || {
hero:null,
kits:[]
};

function salvarDestaquesLocal(){
localStorage.setItem("destaques_admin", JSON.stringify(destaques));
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

}

function fecharHero(){
document.getElementById("modalHero").style.display="none";
}

function salvarHero(){

destaques.hero={
produto:document.getElementById("heroProduto").value,
title:document.getElementById("heroTitulo").value,
description:document.getElementById("heroDescricao").value,
cta:document.getElementById("heroCTA").value
};

salvarDestaquesLocal();

fecharHero();

alert("Hero salvo");
}

/* KITS */

function abrirKits(){

document.getElementById("modalKits").style.display="flex";

document.getElementById("kitProdutos").innerHTML="";

adicionarProdutoKit();

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

function salvarKit(){

const selects=document.querySelectorAll("#kitProdutos select");

const items=[...selects].map(s=>Number(s.value));

const kit={

title:document.getElementById("kitTitulo").value,

description:document.getElementById("kitDescricao").value,

cta:document.getElementById("kitCTA").value,

items:items

};

destaques.kits.push(kit);

salvarDestaquesLocal();

fecharKits();

alert("Kit salvo");

}

renderizarProdutos();

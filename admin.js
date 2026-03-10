let produtos = JSON.parse(localStorage.getItem("produtos_admin")) || [];

let editandoIndex = null;

function salvarLocal(){
localStorage.setItem("produtos_admin", JSON.stringify(produtos));
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
document.getElementById("categoria").value = "";
document.getElementById("ordem").value = "";

}

function salvarProduto(){

const produto = {

title: document.getElementById("titulo").value,
description: document.getElementById("descricao").value,
mercado_livre_url: document.getElementById("produtoLink").value,
affiliate_url: document.getElementById("linkAfiliado").value,
price: document.getElementById("preco").value,
image_url: document.getElementById("imagem").value,
category: document.getElementById("categoria").value,
order: parseInt(document.getElementById("ordem").value),
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
document.getElementById("categoria").value = p.category;
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

document.getElementById("titulo").value = title;

document.getElementById("preco").value = price;

document.getElementById("imagem").value = image;

document.getElementById("descricao").value = title.substring(0,60);

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

const token = prompt("Digite seu GitHub Token");

if(!token) return;

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

alert("Loja atualizada no GitHub!");

}

renderizarProdutos();

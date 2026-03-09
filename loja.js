async function carregarProdutos(){

const resposta = await fetch("produtos.json");
const produtos = await resposta.json();

const grid = document.getElementById("produtos");

produtos.forEach(p=>{

grid.innerHTML += `

<div class="card">

<img src="${p.image}">

<h3>${p.title}</h3>

<div class="preco">${p.price}</div>

<img class="selo-ml" src="img/selo_afiliado_mercado_livre.svg">

<a class="btn" href="${p.affiliate_link}" target="_blank">
Comprar no Mercado Livre
</a>

</div>

`;

});

}

carregarProdutos();

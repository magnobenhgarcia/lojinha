const produtos = [

{
titulo:"Violão Tagima Dallas",
preco:"429,00",
imagem:"https://http2.mlstatic.com/D_NQ_NP_614954-MLA76155786945_052024-O.webp",
link:"https://mercadolivre.com/sec/xxxx"
},

{
titulo:"Capotraste Violão Aço Nylon",
preco:"19,00",
imagem:"https://http2.mlstatic.com/D_NQ_NP_784362-MLA74939206063_032024-O.webp",
link:"https://mercadolivre.com/sec/xxxx"
},

{
titulo:"Afinador Digital Violão",
preco:"39,17",
imagem:"https://http2.mlstatic.com/D_NQ_NP_845273-MLA72042876225_102023-O.webp",
link:"https://mercadolivre.com/sec/xxxx"
}

];

const grid = document.getElementById("produtos");

produtos.forEach(p=>{

grid.innerHTML += `

<div class="card">

<img src="${p.imagem}">

<h3>${p.titulo}</h3>

<div class="preco">R$ ${p.preco}</div>

<img class="selo-ml" src="img/selo_afiliado_mercado_livre.svg">

<a class="btn" href="${p.link}" target="_blank">
Aproveite o desconto
</a>

</div>

`;

});

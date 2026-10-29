# Gestor Autônomo da Lojinha — protocolo persistente v1

Procedimento versionado para o executor local. Somente links de afiliado realmente gerados são válidos.

## Fluxo obrigatório
1. Pesquisar três ofertas e receber escolha comercial, preservando o fluxo existente.
2. Localizar janela Chrome dedicada pelo HWND em qualquer um dos dois monitores, com abas do produto e editor.
3. Conferir a URL REAL do documento Mercado Livre e ID selecionado. MLB-123 e MLB123 são equivalentes; título da aba sozinho não comprova a URL.
4. Localizar Compartilhar cujo ancestral seja Afiliados, nunca o botão genérico. Confirmar foco, visibilidade, limites do monitor e escalonamento DPI; não clicar coordenadas inconsistentes.
5. Confirmar link meli.la realmente gerado para a oferta; URL construída com ID é só página do anúncio.
6. Executar favoritos, extrair dados, confirmar categoria, salvar oferta e loja. Confirmar repositório e vitrine separadamente.
7. Quando falhar, diagnosticar janela, monitor, aba, URL, botão, visibilidade ou gerador; fazer no máximo um retry controlado quando cabível.
8. Após falha persistente de anúncio, registrar ID e checkpoint, pesquisar três novas alternativas e oferecer escolha ao usuário, sem substituição silenciosa nem recomeço.
9. Carregar protocolo validado no início de toda tarefa, inclusive em novos chats; armazenar checkpoint e histórico localmente.

## Caso de regressão: pedal, 29/10/2026
ID: MLB5468359060. Chrome HWND 6621614, monitor 2, duas abas.
URL efetiva inspecionada: https://produto.mercadolivre.com.br/MLB-5468359060-pedal-efeito-guitarra-distorco-chorus-drive-varios-vintage-_JM
O título UIAutomation recebeu prefixo Uso da memória em; o localizador rejeitava nomes sem Mercado Livre.
Há dois botões Compartilhar; um é da seção Afiliados.
O botão Afiliados foi localizado com coordenada central X=4340, além do limite X=3840 reportado para monitor 2. Não clicar até reconciliar escala DPI/coordenação de telas.

## Aceitação
Testar chat novo com anúncio real, link de afiliado validado e publicação comprovada; testar também falha induzida, três alternativas e retomada após escolha.
/* =========================================================================
   PORTFÓLIO — Fábio Gomes
   Único trabalho deste arquivo: acender o link certo do menu conforme a
   seção que está na tela.

   LEMBRETE: a rolagem suave NÃO está aqui. É CSS (scroll-behavior: smooth,
   lá no style.css). Não perder tempo procurando neste arquivo.
   ========================================================================= */

// Modo rigoroso: erro que passaria calado (tipo variável não declarada) vira
// erro de verdade. Sempre ligar isso.
"use strict";


/* -------------------------------------------------------------------------
   1. Pegar os elementos
   ------------------------------------------------------------------------- */

// Todos os <a class="menu-link"> do menu.
// Devolve uma NodeList, não um array de verdade — tem forEach, mas não tem
// map nem filter. Se eu precisar deles, converter com Array.from() antes.
const linksDoMenu = document.querySelectorAll(".menu-link");

// Descubro a seção de cada link a partir do próprio href.
// getAttribute("href") devolve a string "#sobre", e "#sobre" já é um seletor
// CSS válido — dá pra jogar direto no querySelector. Sai de graça.
//
// Vantagem: se eu adicionar uma seção nova no HTML e o link dela no menu,
// este arquivo funciona sozinho. Nada pra editar aqui.
const secoes = [];
linksDoMenu.forEach(function (link) {
    const alvo = document.querySelector(link.getAttribute("href"));

    // Proteção: se eu apagar uma seção do HTML e esquecer o link no menu,
    // querySelector devolve null e sem esse if o script inteiro quebraria.
    if (alvo) {
        secoes.push(alvo);
    }
});


/* -------------------------------------------------------------------------
   2. Acender um link e apagar os outros
   ------------------------------------------------------------------------- */

function destacarLink(idDaSecao) {
    linksDoMenu.forEach(function (link) {
        // classList.toggle com 2 argumentos: se a condição for true adiciona a
        // classe, se for false remove. Uma linha só já apaga todos e acende o
        // certo — não preciso de dois laços.
        const ehEsteLink = link.getAttribute("href") === "#" + idDaSecao;
        link.classList.toggle("ativo", ehEsteLink);
    });
}


/* -------------------------------------------------------------------------
   3. O observador
   -------------------------------------------------------------------------
   Jeito antigo: escutar o evento de scroll e calcular a posição de cada seção.
   Dispara centenas de vezes por segundo e trava a página. Não fazer isso.

   IntersectionObserver: registro as seções uma vez e o NAVEGADOR me avisa
   quando alguma entra na área de interesse. O trabalho pesado sai do meu JS.
   ------------------------------------------------------------------------- */

const observador = new IntersectionObserver(
    // Função que o navegador chama quando o estado de alguma seção muda.
    function (entradas) {
        entradas.forEach(function (entrada) {
            if (entrada.isIntersecting) {
                // entrada.target é a <section> observada
                destacarLink(entrada.target.id);
            }
        });
    },

    {
        // rootMargin com valores negativos ENCOLHE a área observada.
        // Ordem igual à do CSS: topo, direita, baixo, esquerda.
        //   -20% em cima  -> ignora a faixa que fica atrás do menu
        //   -70% embaixo  -> ignora o resto da tela
        // Sobra uma faixa fina logo abaixo do menu; a seção que cruzar ela é
        // a "que estou lendo". Sem esse recorte, 2 ou 3 seções aparecem juntas
        // e o menu acende vários links ao mesmo tempo.
        //
        // AJUSTE AQUI se o destaque parecer adiantado ou atrasado.
        rootMargin: "-20% 0px -70% 0px",

        // 0 = avisa assim que 1 pixel entrar na faixa
        threshold: 0
    }
);

// Registra as seções. Daqui pra frente é o navegador que trabalha.
secoes.forEach(function (secao) {
    observador.observe(secao);
});


/* -------------------------------------------------------------------------
   3b. Altura do menu -> espaço reservado na rolagem
   -------------------------------------------------------------------------
   O CSS tem scroll-padding-top fixo (5rem no desktop, 8rem no celular), mas
   isso é chute: a altura real do menu muda conforme os links quebram linha.
   Quando eu errava pra menos, o título da seção parava CORTADO atrás do menu.

   Aqui eu meço a altura de verdade e sobrescrevo. Assim funciona em qualquer
   largura de tela, e continua certo se eu adicionar links no menu depois.
   ------------------------------------------------------------------------- */

const menu = document.querySelector(".menu-navegacao");

function ajustarEspacoDaRolagem() {
    if (!menu) {
        return;
    }
    // offsetHeight = altura real renderizada, em pixels, já com padding e borda.
    // Somo 16px de folga pra o título não encostar na borda do menu.
    document.documentElement.style.scrollPaddingTop = (menu.offsetHeight + 16) + "px";
}

ajustarEspacoDaRolagem();

// Recalcula ao girar o celular ou redimensionar a janela — nesses momentos o
// menu pode passar de uma linha pra duas, mudando de altura.
window.addEventListener("resize", ajustarEspacoDaRolagem);


/* -------------------------------------------------------------------------
   3c. Botão "voltar ao topo"
   -------------------------------------------------------------------------
   O botão nasce visível no CSS e o JS adiciona a classe "oculto" quando o
   cabeçalho está na tela — porque ali ele não teria função nenhuma.
   Mesma proteção da animação: se este trecho falhar, o botão apenas fica
   sempre visível. Como é um <a href="#topo">, continua funcionando.
   ------------------------------------------------------------------------- */

const botaoTopo = document.getElementById("botao-topo");

// Procuro o cabeçalho pela CLASSE, não pelo id. O id muda entre as versões
// do site (#topo em português, #top em inglês) — a classe é a mesma nas duas,
// então este arquivo serve aos dois idiomas sem nenhum "if".
const cabecalho = document.querySelector(".cabecalho-principal");

if (botaoTopo && cabecalho) {
    const observadorTopo = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
            // Cabeçalho visível -> estou no topo -> esconde o botão.
            botaoTopo.classList.toggle("oculto", entrada.isIntersecting);
        });
    });

    observadorTopo.observe(cabecalho);
}


/* -------------------------------------------------------------------------
   4. Revelação dos elementos ao rolar
   -------------------------------------------------------------------------
   Mesma ferramenta da seção 3 (IntersectionObserver), outro uso: em vez de
   acender link do menu, faz o elemento aparecer subindo quando entra na tela.

   REGRA DE OURO deste trecho: a classe "revelar" (que esconde) é colocada
   AQUI PELO JS, nunca escrita no HTML. Se estivesse no HTML e este arquivo
   falhasse, o site abriria em branco. Assim, sem JS tudo aparece normal.
   ------------------------------------------------------------------------- */

// Quem tem "reduzir movimento" ligado no sistema não recebe animação nenhuma:
// nem chego a esconder os elementos. O CSS também barra, mas é melhor nem
// começar do que animar e desfazer.
const prefereMenosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefereMenosMovimento) {

    // O que vai animar. Pra incluir algo novo, é só somar o seletor aqui.
    const alvos = document.querySelectorAll(
        ".titulo-secao, .texto-sobre, .item-tempo, .categoria-habilidade, .cartao-projeto, .texto-contato, .formulario-contato"
    );

    const observadorRevelacao = new IntersectionObserver(
        function (entradas) {
            entradas.forEach(function (entrada) {
                if (!entrada.isIntersecting) {
                    return;
                }

                entrada.target.classList.add("visivel");

                // Para de observar depois que apareceu. Sem isto o elemento
                // sumiria e reapareceria toda vez que eu rolasse pra cima e
                // pra baixo — cansativo e meio brega.
                observadorRevelacao.unobserve(entrada.target);
            });
        },
        {
            // -10% embaixo: o elemento só anima quando já entrou um pouco na
            // tela de verdade, não no instante em que encosta na borda.
            rootMargin: "0px 0px -10% 0px",
            threshold: 0
        }
    );

    alvos.forEach(function (alvo, indice) {
        alvo.classList.add("revelar");

        // Escadinha: cada elemento entra 60ms depois do anterior, em grupos
        // de 3. O "% 3" impede que o item 20 espere 1,2 segundo — sem ele o
        // atraso cresce sem parar e o fim da página fica lento.
        alvo.style.transitionDelay = (indice % 3) * 60 + "ms";

        observadorRevelacao.observe(alvo);
    });
}


/* -------------------------------------------------------------------------
   5. Formulário de contato (Formspree)
   -------------------------------------------------------------------------
   O form JÁ FUNCIONA sem nada disto aqui: tem action e method no HTML, então
   o navegador envia sozinho e o Formspree mostra a página de obrigado dele.

   O que este trecho faz é melhorar: intercepta o envio, manda por trás dos
   panos e mostra o retorno na própria página. A pessoa não sai do portfólio.

   Isso se chama aprimoramento progressivo: se este JS quebrar ou não carregar,
   o formulário continua enviando do jeito tradicional. Nunca fica quebrado.
   ------------------------------------------------------------------------- */

const formulario = document.getElementById("formulario-contato");
const retorno = document.getElementById("retorno-formulario");

/* As mensagens de retorno precisam sair no idioma da página. Em vez de duplicar
   o script, leio o <html lang="..."> e escolho o conjunto de textos.
   Qualquer coisa que não comece com "en" cai no português. */
const idioma = document.documentElement.lang.toLowerCase().startsWith("en") ? "en" : "pt";

const TEXTOS = {
    pt: {
        enviando: "Enviando...",
        sucesso: "Mensagem enviada. Respondo assim que puder.",
        recusado: "Não consegui enviar agora.",
        alternativa: " Se preferir, me chame em fabiogsilva@disroot.org.",
        semConexao: "Falha de conexão. Tente de novo ou me chame em fabiogsilva@disroot.org."
    },
    en: {
        enviando: "Sending...",
        sucesso: "Message sent. I'll get back to you as soon as I can.",
        recusado: "I couldn't send it right now.",
        alternativa: " You can also reach me at fabiogsilva@disroot.org.",
        semConexao: "Connection failed. Please try again or email me at fabiogsilva@disroot.org."
    }
};

const t = TEXTOS[idioma];

// Só ligo o comportamento se os dois existirem — assim este arquivo continua
// funcionando em qualquer página que não tenha o formulário.
if (formulario && retorno) {

    formulario.addEventListener("submit", async function (evento) {
        // Segura o envio padrão do navegador (que sairia da página).
        // Sem esta linha, todo o resto aqui embaixo não adianta nada.
        evento.preventDefault();

        const botao = formulario.querySelector(".botao-enviar");

        // Desabilito o botão pra não mandar a mensagem duas vezes por
        // clique repetido enquanto o envio está em andamento.
        botao.disabled = true;
        retorno.className = "retorno-formulario";
        retorno.textContent = t.enviando;

        try {
            const resposta = await fetch(formulario.action, {
                method: "POST",

                // FormData recolhe sozinho todos os campos que têm "name".
                // Se eu adicionar um campo novo no HTML, ele já vem junto —
                // não preciso mexer aqui.
                body: new FormData(formulario),

                // ESSE HEADER É O PULO DO GATO. Sem ele o Formspree responde
                // com um redirecionamento pra página de obrigado deles.
                // Com ele, responde em JSON e eu controlo o que aparece.
                headers: { "Accept": "application/json" }
            });

            if (resposta.ok) {
                formulario.reset(); // limpa os campos
                retorno.className = "retorno-formulario sucesso";
                retorno.textContent = t.sucesso;
            } else {
                // Chegou no Formspree mas ele recusou (cota do mês estourada,
                // campo inválido, etc). A resposta traz o motivo em JSON.
                const dados = await resposta.json().catch(function () {
                    return null;
                });

                const motivo = dados && dados.errors
                    ? dados.errors.map(function (e) { return e.message; }).join(", ")
                    : t.recusado;

                retorno.className = "retorno-formulario erro";
                retorno.textContent = motivo + t.alternativa;
            }

        } catch (erro) {
            // Cai aqui quando nem chegou a sair da máquina: internet fora,
            // DNS falhou, etc. O fetch só dá erro nesses casos — resposta
            // HTTP 4xx/5xx NÃO cai no catch, por isso o if/else acima existe.
            retorno.className = "retorno-formulario erro";
            retorno.textContent = t.semConexao;

        } finally {
            // finally roda sempre, dando certo ou errado. É o lugar certo pra
            // reabilitar o botão — se eu deixasse só no try, um erro travaria
            // o botão desabilitado pra sempre.
            botao.disabled = false;
        }
    });
}

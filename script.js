const entrada = document.getElementById("entrada");

const saida = document.getElementById("saida");

const analiseProgressoes =
    document.getElementById("analiseProgressoes");

const listaProgressoes =
    document.getElementById("listaProgressoes");

const alternarProgressoes =
    document.getElementById("alternarProgressoes");

const textoChaveProgressoes =
    document.getElementById("textoChaveProgressoes");

const abaRoteiro =
    document.getElementById("abaRoteiro");

const abaPadroes =
    document.getElementById("abaPadroes");

let progressoesVisiveis = false;
let haProgressoes = false;
let modoProgressaoAtual = "roteiro";
let secoesProgressaoAtuais = [];

const botao = document.getElementById("converter");

const tom = document.getElementById("tom");

const formato = document.getElementById("formato");

const formatoBaixo =
    document.getElementById("formatoBaixo");

// Acordes fora do campo que o usuário
// decidiu manter

const acordesMantidos = new Set();

const modoAnaliseMenor =
    document.getElementById("modoAnaliseMenor");

const analiseMenor =
    document.getElementById("analiseMenor");

const analiseRelativo =
    document.getElementById("analiseRelativo");

const textoRelativo =
    document.getElementById("textoRelativo");

const alertaTom =
    document.getElementById("alertaTom");

const alertaTomTexto =
    document.getElementById("alertaTomTexto");

const corrigirTomSim =
    document.getElementById("corrigirTomSim");

const corrigirTomNao =
    document.getElementById("corrigirTomNao");

let usarRelativoMaior = false;
let tomSugerido = "";
let assinaturaTomIgnorada = "";


// ------------------------------------
// PADRÃO DE ACORDES
// ------------------------------------

const acordeCompleto =
/^[A-Ga-g](?:#|b)?(?:(?:7M|maj(?:7|9|11|13)|m(?:2|4|6|7|9|11|13)?|m7(?:b5|\(b5\))|dim7?|°7?|ø7?|aug|\+|sus(?:2|4)|7sus(?:2|4)|9sus(?:2|4)|add(?:2|9|11)|(?:2|4|5|6|7|9|11|13))(?:\((?:2|4|5|6|7|7M|9|11|13|add(?:2|9|11)|(?:#|b)(?:5|9|11|13))(?:,(?:2|4|5|6|7|7M|9|11|13|add(?:2|9|11)|(?:#|b)(?:5|9|11|13)))*\))?(?:(?:#|b)(?:5|9|11|13))*)?(?:\/(?:[A-Ga-g](?:#|b)?|9))?$/i;


function limparTokenDeAcorde(token){

    return token
        .trim()
        .replace(/^[\(\[\{]+/, "")
        .replace(/[\)\]\},;:]+$/, "");
}


function extrairAcordesDeLinha(linha){

    const limpa =
        linha
            .replace(/\[[^\]]+\]/g, "")
            .trim();

    if(limpa === ""){
        return [];
    }

    const elementos =
        limpa.split(/\s+/);

    const acordes = [];

    for(let i = 0; i < elementos.length; i++){

        const token =
            limparTokenDeAcorde(
                elementos[i]
            );

        if(token === ""){
            continue;
        }

        if(!acordeCompleto.test(token)){
            return [];
        }

        acordes.push(
            normalizarAcorde(token)
        );
    }

    return acordes;
}


function linhaEhDeAcordes(linha){

    return (
        extrairAcordesDeLinha(linha)
            .length > 0
    );
}


function linhaEhInstrumentalEntreParenteses(linha){

    const texto =
        linha.trim();

    if(
        !texto.startsWith("(") &&
        !texto.endsWith(")")
    ){
        return false;
    }

    return linhaEhDeAcordes(texto);
}


function normalizarAcorde(acorde){

    // Coloca a nota principal em maiúscula
    acorde = acorde.replace(
        /^([a-g])/,
        function(nota){
            return nota.toUpperCase();
        }
    );


    // Corrige o baixo depois da barra
    // Exemplo: c/e -> C/E

    acorde = acorde.replace(
        /\/([a-g])/,
        function(texto, nota){
            return "/" + nota.toUpperCase();
        }
    );


    // Padroniza 7m digitado como 7M quando
    // estiver sendo usado como sétima maior
    // Exemplo: f7m -> F7M

    acorde = acorde.replace(/7m$/i, "7M");


    // Corrige o "m" dos acordes menores
    // Exemplo: AM -> Am

    acorde = acorde.replace(
        /^([A-G](?:#|b)?)M(?=\d|$)/,
        "$1m"
    );


    // Padroniza algumas grafias comuns

    acorde = acorde.replace(/maj7/gi, "7M");
    acorde = acorde.replace(/ø7/gi, "ø");
    acorde = acorde.replace(/m7\(b5\)/gi, "m7b5");


    return acorde;
}


// ========================================
// DESTACA OS GRAUS NO RESULTADO
// ========================================

function destacarGraus(texto){

    const linhas = texto.split("\n");

    const resultado = linhas.map(function(linha){

        const partes = linha.split(/(\s+)/);

        const linhaFormatada = partes.map(function(parte, indice){

            // Grau principal:
            // I, IV, vi, ii7
            // vi7(9), iii7(9)
            // 1, 4, 6m, 2m7

            const ehGrau =
                /^(?:#|b)?(?:[ivIV]+|[1-7](?:m)?)(?:(?:2|4|5|6|7M|7|9|11|13|add2|add9|add11|sus2|sus4|7sus2|7sus4|9sus2|9sus4|dim7?|°7?|ø|aug|\+|m7b5)?(?:\([^)]*\))?)(?:\/(?:#|b)?(?:[ivIV]+|[1-7]|[A-G](?:#|b)?|9))?$/.test(parte);


            if(ehGrau){

                return "<span class='grau-destaque'>" +
                       parte +
                       "</span>";
            }


            // Extensão separada de um acorde maior:
            //
            // I 2
            // IV 4
            // I 6
            // V 7
            // IV 7M
            // I 9
            // V 11
            // IV 13

            const ehExtensao =
                /^(?:2|4|5|6|7|7M|9|11|13)(?:\([^)]*\))?(?:(?:#|b)(?:5|9|11|13))*$/.test(parte);


            if(ehExtensao){

                let anterior = indice - 1;


                // Ignora o espaço entre o grau e a extensão

                while(
                    anterior >= 0 &&
                    /^\s+$/.test(partes[anterior])
                ){

                    anterior--;
                }


                if(anterior >= 0){

                    const anteriorEhGrauMaior =
                        /^(?:I|II|III|IV|V|VI|VII|[1-7])$/.test(
                            partes[anterior]
                        );


                    if(anteriorEhGrauMaior){

                        return "<span class='grau-destaque'>" +
                               parte +
                               "</span>";
                    }
                }
            }


            return parte;

        }).join("");


        return linhaFormatada;

    }).join("\n");


    const resultadoComGraus =
        resultado.replace(
            /§GRAU§(.*?)§FIMGRAU§/g,
            function(textoCompleto, grau){
                return "<span class='grau-destaque'>" +
                       grau +
                       "</span>";
            }
        );

    const resultadoComAlertas =
        resultadoComGraus.replace(
            /§FORA§(\d+)§POS§(.*?)§FIM§/g,
            function(textoCompleto, posicao, acorde){

                return "<span class='acorde-fora-campo' " +
                       "data-acorde='" + acorde + "' " +
                       "data-posicao='" + posicao + "' " +
                       "title='Este acorde não pertence ao campo harmônico diatônico selecionado. Confira.'>" +
                       "<span class='icone-alerta'>⚠</span>" +
                       acorde +
                       "</span>";
            }
        );


    return resultadoComAlertas;
}

// ========================================
// CLIQUE EM ACORDE FORA DO CAMPO
// ========================================

saida.addEventListener("click", function(event){

    const elemento =
        event.target.closest(".acorde-fora-campo");

    if(!elemento){
        return;
    }

    if(
        event.target.classList.contains("manter-sim") ||
        event.target.classList.contains("manter-nao")
    ){
        return;
    }

    document
        .querySelectorAll(".pergunta-acorde")
        .forEach(function(pergunta){
            pergunta.remove();
        });

    const acorde =
        elemento.dataset.acorde;

    const pergunta =
        document.createElement("span");

    pergunta.className =
        "pergunta-acorde";

    pergunta.innerHTML =
        "<span class='texto-pergunta'>" +
            acorde +
            " — Manter acorde?" +
        "</span>" +

        "<span class='botoes-pergunta'>" +

            "<button type='button' class='manter-sim'>" +
                "Sim" +
            "</button>" +

            "<button type='button' class='manter-nao'>" +
                "Não" +
            "</button>" +

        "</span>";

    elemento.appendChild(pergunta);

});


saida.addEventListener("click", function(event){

    if(
        !event.target.classList.contains(
            "manter-sim"
        )
    ){
        return;
    }

    event.stopPropagation();

    const elemento =
        event.target.closest(
            ".acorde-fora-campo"
        );

    const acorde =
        elemento.dataset.acorde;

    const tomAnalise =
        obterTomDeAnalise();

    acordesMantidos.add(
        tomAnalise + "|" + acorde
    );

    const convertido =
        encontrarGrau(
            acorde,
            tomAnalise,
            formato.value,
            formatoBaixo.value
        );

    elemento.outerHTML =
        "<span class='grau-destaque'>" +
        convertido +
        "</span>";

});


saida.addEventListener("click", function(event){

    if(!event.target.classList.contains("manter-nao")){
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    const elemento =
        event.target.closest(".acorde-fora-campo");

    if(!elemento){
        return;
    }

    const acorde =
        elemento.dataset.acorde;

    const pergunta =
        elemento.querySelector(".pergunta-acorde");

    if(pergunta){
        pergunta.remove();
    }

    const posicao =
        Number(elemento.dataset.posicao);

    if(!Number.isNaN(posicao)){

        entrada.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        entrada.focus();

        entrada.setSelectionRange(
            posicao,
            posicao + acorde.length
        );

        const textoAntes =
            entrada.value.substring(0, posicao);

        const quantidadeLinhas =
            textoAntes.split("\n").length;

        const alturaLinha =
            parseFloat(
                getComputedStyle(entrada).lineHeight
            );

        entrada.scrollTop =
            (quantidadeLinhas - 1) * alturaLinha;
    }

});


// ========================================
// ANÁLISE AUTOMÁTICA DAS PROGRESSÕES
// ========================================

function normalizarNomeSecao(texto){
    return texto.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\[\]():\-–—]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function obterTituloEntreColchetes(linha){

    const resultado =
        linha.match(
            /^\s*\[([^\]]+)\]/
        );

    return resultado
        ? resultado[1]
        : "";
}


function removerTituloSecaoDaLinha(linha){

    return linha.replace(
        /^\s*\[[^\]]+\]\s*/,
        ""
    );
}


function identificarSecao(linha){

    const textoOriginal =
        linha.trim();

    if(!textoOriginal){
        return null;
    }

    const tituloColchetes =
        obterTituloEntreColchetes(
            textoOriginal
        );

    // Quando há [Título], só o conteúdo dos colchetes
    // deve ser analisado como nome da seção.
    const base =
        tituloColchetes ||
        textoOriginal;

    const nome =
        normalizarNomeSecao(base);

    const secoes = [
        [/^(?:intro|introducao)(?:\s+\d+)?$/, "Introdução"],

        [/^(?:primeira parte|1 parte|1a parte|parte 1|verso 1|1 verso)$/, "Primeira Parte"],
        [/^(?:segunda parte|2 parte|2a parte|parte 2|verso 2|2 verso)$/, "Segunda Parte"],
        [/^(?:terceira parte|3 parte|3a parte|parte 3|verso 3|3 verso)$/, "Terceira Parte"],

        [/^(?:verso)(?:\s+\d+)?$/, "Verso"],

        [/^(?:pre refrao)(?:\s+\d+)?$/, "Pré-Refrão"],

        [/^(?:primeiro refrao|refrao 1|1 refrao)$/, "Refrão 1"],
        [/^(?:segundo refrao|refrao 2|2 refrao)$/, "Refrão 2"],
        [/^(?:terceiro refrao|refrao 3|3 refrao)$/, "Refrão 3"],
        [/^(?:refrao final|final refrao)$/, "Refrão Final"],
        [/^(?:refrao|coro)$/, "Refrão"],

        [/^(?:ponte|bridge)(?:\s+\d+)?$/, "Ponte"],
        [/^(?:solo)(?:\s+\d+)?$/, "Solo"],

        [/^(?:instrumental|parte instrumental)(?:\s+\d+)?$/, "Instrumental"],

        [/^(?:interludio|interlude)(?:\s+\d+)?$/, "Interlúdio"],

        [/^(?:final|fim|outro|coda)(?:\s+\d+)?$/, "Final"]
    ];

    for(let i = 0; i < secoes.length; i++){

        if(secoes[i][0].test(nome)){
            return secoes[i][1];
        }
    }

    return null;
}


function grauBaseNumerico(acorde, tomAnalise){
    const convertido = encontrarGrau(acorde, tomAnalise, "numero", "grau");
    const r = convertido.match(/^(#|b)?([1-7])/);
    return r ? (r[1] || "") + r[2] : null;
}

function reduzirProgressaoRepetida(graus){

    if(graus.length < 2){
        return graus;
    }

    // Remove repetições consecutivas do mesmo grau.
    const semDuplicadosConsecutivos = [];

    graus.forEach(function(grau){

        if(
            semDuplicadosConsecutivos.length === 0 ||
            semDuplicadosConsecutivos[
                semDuplicadosConsecutivos.length - 1
            ] !== grau
        ){
            semDuplicadosConsecutivos.push(grau);
        }
    });

    const lista = semDuplicadosConsecutivos;

    if(lista.length < 2){
        return lista;
    }

    // Procura o menor ciclo que explique a sequência,
    // mesmo quando a música termina no meio do ciclo.
    const limite =
        Math.min(8, lista.length);

    for(let tamanho = 2; tamanho <= limite; tamanho++){

        let corresponde = true;

        for(let i = tamanho; i < lista.length; i++){

            if(
                lista[i] !==
                lista[i % tamanho]
            ){
                corresponde = false;
                break;
            }
        }

        if(corresponde){
            return lista.slice(0, tamanho);
        }
    }

    return lista;
}


function rotacionarArray(array, inicio){

    return array
        .slice(inicio)
        .concat(
            array.slice(0, inicio)
        );
}


function assinaturaCanonicaProgressao(graus){

    if(graus.length === 0){
        return "";
    }

    // Progressões cíclicas como 1-4-6-5 e 5-1-4-6
    // representam o mesmo movimento começando em pontos diferentes.
    const rotacoes = [];

    for(let i = 0; i < graus.length; i++){

        const rotacao =
            rotacionarArray(
                graus,
                i
            );

        rotacoes.push(
            rotacao.join("|")
        );
    }

    rotacoes.sort();

    return rotacoes[0];
}


function progressaoEhTrechoDeOutra(menor, maior){

    if(
        menor.length === 0 ||
        maior.length === 0 ||
        menor.length >= maior.length
    ){
        return false;
    }

    // Trechos muito curtos, especialmente um único grau,
    // não devem virar uma "progressão" própria.
    if(menor.length === 1){
        return true;
    }

    const ciclo =
        maior.concat(maior);

    for(
        let inicio = 0;
        inicio < maior.length;
        inicio++
    ){

        let combina = true;

        for(
            let i = 0;
            i < menor.length;
            i++
        ){

            if(
                menor[i] !==
                ciclo[inicio + i]
            ){
                combina = false;
                break;
            }
        }

        if(combina){
            return true;
        }
    }

    return false;
}


function normalizarSecoesParaResumo(secoes){

    const normalizadas =
        secoes.map(function(secao){

            return {
                nome: secao.nome,
                graus:
                    reduzirProgressaoRepetida(
                        secao.graus
                    )
            };
        });

    // Descobre quais sequências são apenas trechos
    // de uma progressão maior já identificada.
    normalizadas.forEach(function(secao){

        if(secao.graus.length === 0){
            return;
        }

        let melhor = null;

        normalizadas.forEach(function(candidata){

            if(candidata === secao){
                return;
            }

            if(
                progressaoEhTrechoDeOutra(
                    secao.graus,
                    candidata.graus
                )
            ){

                if(
                    !melhor ||
                    candidata.graus.length <
                    melhor.graus.length
                ){
                    melhor = candidata;
                }
            }
        });

        if(melhor){
            secao.graus = melhor.graus.slice();
        }
    });

    return normalizadas;
}


function extrairProgressoesPorSecao(texto, tomAnalise){

    const linhas =
        texto.split("\n");

    const secoes = [];

    let secaoAtual = null;
    let nomeSecaoAtual = "";

    let contadorInstrumental = 0;

    function criarSecao(nome){

        secaoAtual = {
            nome: nome,
            graus: []
        };

        nomeSecaoAtual = nome;

        secoes.push(secaoAtual);

        return secaoAtual;
    }


    function adicionarAcordes(
        acordes,
        destino = secaoAtual
    ){

        if(
            !destino ||
            acordes.length === 0
        ){
            return;
        }

        acordes.forEach(function(acorde){

            const grau =
                grauBaseNumerico(
                    acorde,
                    tomAnalise
                );

            if(grau){
                destino.graus.push(grau);
            }
        });
    }


    function linhaTemLetra(linha){

        const limpa =
            removerTituloSecaoDaLinha(
                linha
            ).trim();

        if(limpa === ""){
            return false;
        }

        return (
            extrairAcordesDeLinha(
                limpa
            ).length === 0
        );
    }


    function proximaLinhaSignificativa(indiceAtual){

        for(
            let i = indiceAtual + 1;
            i < linhas.length;
            i++
        ){

            if(linhas[i].trim() === ""){
                continue;
            }

            const titulo =
                identificarSecao(
                    linhas[i]
                );

            const semTitulo =
                removerTituloSecaoDaLinha(
                    linhas[i]
                );

            const acordes =
                extrairAcordesDeLinha(
                    semTitulo
                );

            return {
                indice: i,
                linha: linhas[i],
                titulo: titulo,
                acordes: acordes,
                letra:
                    !titulo &&
                    acordes.length === 0 &&
                    linhaTemLetra(
                        linhas[i]
                    )
            };
        }

        return null;
    }


    function anteriorSignificativo(indiceAtual){

        for(
            let i = indiceAtual - 1;
            i >= 0;
            i--
        ){

            if(linhas[i].trim() === ""){
                continue;
            }

            const titulo =
                identificarSecao(
                    linhas[i]
                );

            const semTitulo =
                removerTituloSecaoDaLinha(
                    linhas[i]
                );

            const acordes =
                extrairAcordesDeLinha(
                    semTitulo
                );

            return {
                indice: i,
                linha: linhas[i],
                titulo: titulo,
                acordes: acordes,
                letra:
                    !titulo &&
                    acordes.length === 0 &&
                    linhaTemLetra(
                        linhas[i]
                    )
            };
        }

        return null;
    }


    function iniciarInstrumentalAutomatico(){

        contadorInstrumental++;

        return criarSecao(
            "Instrumental " +
            contadorInstrumental
        );
    }


    for(let indice = 0; indice < linhas.length; indice++){

        const linhaOriginal =
            linhas[indice];

        const titulo =
            identificarSecao(
                linhaOriginal
            );

        const linhaSemTitulo =
            removerTituloSecaoDaLinha(
                linhaOriginal
            );

        const acordesLinha =
            extrairAcordesDeLinha(
                linhaSemTitulo
            );


        // ------------------------------------------------
        // TÍTULO EXPLÍCITO SEMPRE TEM PRIORIDADE
        // ------------------------------------------------

        if(titulo){

            criarSecao(
                titulo
            );

            // Ex.:
            // [Intro] F G C Am
            // [Introdução] ( F G C Am )
            // Os acordes da mesma linha pertencem à seção.
            if(acordesLinha.length > 0){

                adicionarAcordes(
                    acordesLinha
                );
            }

            continue;
        }


        // ------------------------------------------------
        // LINHA DE ACORDES
        // ------------------------------------------------

        if(acordesLinha.length > 0){

            const proxima =
                proximaLinhaSignificativa(
                    indice
                );

            const anterior =
                anteriorSignificativo(
                    indice
                );

            const acompanhaLetra =
                proxima &&
                proxima.letra;


            // --------------------------------------------
            // INTRODUÇÃO -> PRIMEIRA PARTE
            // --------------------------------------------
            //
            // Se há uma Introdução explícita e surge uma nova
            // linha de acordes imediatamente associada à letra,
            // essa linha já pertence à Primeira Parte.
            //
            // Ex.:
            // [Intro] F G C/E Am G
            //
            // Am G
            // Teu fogo arde em mim
            //
            // Intro: 4 5 1 6 5
            // Primeira Parte começa em: 6 5

            if(
                nomeSecaoAtual === "Introdução" &&
                acompanhaLetra
            ){

                criarSecao(
                    "Primeira Parte"
                );

                adicionarAcordes(
                    acordesLinha
                );

                continue;
            }


            // --------------------------------------------
            // CIFRA SEM TÍTULO INICIAL
            // --------------------------------------------

            if(!secaoAtual){

                if(acompanhaLetra){

                    criarSecao(
                        "Primeira Parte"
                    );

                }else{

                    criarSecao(
                        "Introdução"
                    );
                }

                adicionarAcordes(
                    acordesLinha
                );

                continue;
            }


            // --------------------------------------------
            // BLOCO INSTRUMENTAL / PASSAGEM SEM TÍTULO
            // --------------------------------------------
            //
            // Não depende de parênteses.
            // Uma sequência isolada de acordes entre trechos
            // cantados/seções pode ser inferida como instrumental.
            //
            // Parênteses apenas delimitam visualmente a sequência.

            const proximaEhTitulo =
                proxima &&
                proxima.titulo;

            const anteriorEraLetra =
                anterior &&
                anterior.letra;

            const blocoIsolado =
                !acompanhaLetra &&
                (
                    proximaEhTitulo ||
                    anteriorEraLetra
                );

            if(
                blocoIsolado &&
                nomeSecaoAtual !== "Introdução" &&
                nomeSecaoAtual !== "Instrumental"
            ){

                iniciarInstrumentalAutomatico();

                adicionarAcordes(
                    acordesLinha
                );

                // Agrupa outras linhas consecutivas de acordes
                // que também não acompanham letra.
                while(
                    indice + 1 < linhas.length
                ){

                    const proximaLinha =
                        linhas[indice + 1];

                    if(proximaLinha.trim() === ""){
                        break;
                    }

                    if(
                        identificarSecao(
                            proximaLinha
                        )
                    ){
                        break;
                    }

                    const acordesProximaLinha =
                        extrairAcordesDeLinha(
                            removerTituloSecaoDaLinha(
                                proximaLinha
                            )
                        );

                    if(
                        acordesProximaLinha.length === 0
                    ){
                        break;
                    }

                    const depois =
                        proximaLinhaSignificativa(
                            indice + 1
                        );

                    if(
                        depois &&
                        depois.letra
                    ){
                        break;
                    }

                    indice++;

                    adicionarAcordes(
                        acordesProximaLinha
                    );
                }

                secaoAtual = null;
                nomeSecaoAtual = "";

                continue;
            }


            // --------------------------------------------
            // ACORDES NORMAIS DA SEÇÃO ATUAL
            // --------------------------------------------

            adicionarAcordes(
                acordesLinha
            );

            continue;
        }


        // ------------------------------------------------
        // LINHAS DE LETRA NÃO MUDAM A SEÇÃO SOZINHAS
        // ------------------------------------------------
    }


    // O Roteiro recebe a sequência BRUTA de cada seção.
    // Nenhuma seção pode herdar ou ser substituída
    // por progressões de outras partes da música.
    return secoes.filter(function(secao){
        return secao.graus.length > 0;
    });
}


function escaparHtml(texto){
    return String(texto)
        .replace(/&/g,"&amp;").replace(/</g,"&lt;")
        .replace(/>/g,"&gt;").replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}

function encontrarMenorCicloDaSecao(graus){

    if(graus.length < 2){
        return {
            graus: graus.slice(),
            repeticoes: 1,
            restante: []
        };
    }

    const maximo =
        Math.min(
            8,
            Math.floor(graus.length / 2)
        );

    let melhor = null;

    for(let tamanho = 2; tamanho <= maximo; tamanho++){

        const ciclo =
            graus.slice(0, tamanho);

        let indice = 0;

        while(
            indice < graus.length &&
            graus[indice] ===
            ciclo[indice % tamanho]
        ){
            indice++;
        }

        const ciclosCompletos =
            Math.floor(indice / tamanho);

        if(ciclosCompletos >= 2){

            const candidato = {
                graus: ciclo,
                repeticoes: ciclosCompletos,
                restante:
                    graus.slice(
                        ciclosCompletos * tamanho
                    )
            };

            if(
                !melhor ||
                candidato.graus.length <
                melhor.graus.length
            ){
                melhor = candidato;
            }
        }
    }

    if(melhor){
        return melhor;
    }

    return {
        graus:
            graus.slice(
                0,
                Math.min(8, graus.length)
            ),
        repeticoes: 1,
        restante:
            graus.length > 8
                ? graus.slice(8)
                : []
    };
}


function dividirSecaoEmBlocos(graus){

    if(graus.length === 0){
        return [];
    }

    const blocos = [];
    let restante = graus.slice();

    while(restante.length > 0){

        const analise =
            encontrarMenorCicloDaSecao(
                restante
            );

        if(analise.graus.length === 0){
            break;
        }

        blocos.push({
            graus: analise.graus,
            repeticoes:
                analise.repeticoes
        });

        if(
            analise.repeticoes === 1 &&
            analise.restante.length ===
            restante.length
        ){
            break;
        }

        restante =
            analise.restante;

        if(blocos.length >= 4){
            break;
        }
    }

    return blocos;
}


function assinaturaBlocos(blocos){

    return blocos.map(function(bloco){

        return (
            bloco.graus.join("|") +
            "x" +
            bloco.repeticoes
        );

    }).join(";");
}


function prepararRoteiro(secoes){

    const roteiro = [];
    const ultimaAssinaturaPorNome =
        new Map();

    secoes.forEach(function(secao, indice){

        const blocos =
            dividirSecaoEmBlocos(
                secao.graus
            );

        if(blocos.length === 0){
            return;
        }

        const assinatura =
            assinaturaBlocos(
                blocos
            );

        const chaveNome =
            secao.nome;

        const repetida =
            ultimaAssinaturaPorNome.get(
                chaveNome
            ) === assinatura;

        roteiro.push({
            nome: secao.nome,
            blocos: blocos,
            repetida: repetida,
            ordem: indice
        });

        ultimaAssinaturaPorNome.set(
            chaveNome,
            assinatura
        );
    });

    return roteiro;
}


function renderizarRoteiro(secoes){

    const roteiro =
        prepararRoteiro(
            secoes
        );

    if(roteiro.length === 0){

        return (
            "<div class='progressao-vazia'>" +
            "Nenhuma seção com progressão foi identificada." +
            "</div>"
        );
    }

    let html =
        "<div class='lista-progressoes roteiro-musica'>";

    roteiro.forEach(function(item){

        html +=
            "<div class='progressao-item roteiro-item'>" +
                "<span class='progressao-titulo'>" +
                    escaparHtml(item.nome) +
                "</span>";

        if(item.repetida){

            html +=
                "<span class='roteiro-repeticao-secao'>" +
                    "Mesma progressão da ocorrência anterior" +
                "</span>";

        }else{

            item.blocos.forEach(
                function(bloco, indice){

                    html +=
                        "<div class='roteiro-bloco'>" +

                            (
                                item.blocos.length > 1
                                    ? "<span class='roteiro-letra'>" +
                                      String.fromCharCode(65 + indice) +
                                      "</span>"
                                    : ""
                            ) +

                            "<span class='progressao-graus'>" +
                                escaparHtml(
                                    bloco.graus.join(" – ")
                                ) +
                            "</span>" +

                            (
                                bloco.repeticoes > 1
                                    ? "<span class='roteiro-vezes'>×" +
                                      bloco.repeticoes +
                                      "</span>"
                                    : ""
                            ) +

                        "</div>";
                }
            );
        }

        html += "</div>";
    });

    html += "</div>";

    return html;
}


function renderizarPadroes(secoes){

    const secoesParaPadroes =
        normalizarSecoesParaResumo(
            secoes
        );

    const padroes =
        encontrarProgressaoPrincipal(
            secoesParaPadroes
        );

    if(padroes.length === 0){

        return (
            "<div class='progressao-vazia'>" +
            "Nenhum padrão recorrente foi identificado." +
            "</div>"
        );
    }

    let html =
        "<div class='lista-progressoes'>";

    padroes.forEach(function(padrao, indice){

        const titulo =
            indice === 0
                ? "Progressão principal"
                : "Padrão " + (indice + 1);

        const partes =
            Array.from(
                padrao.secoes
            ).join(", ");

        html +=
            "<div class='progressao-item'>" +

                "<div class='progressao-cabecalho'>" +
                    "<span class='progressao-titulo'>" +
                        escaparHtml(titulo) +
                    "</span>" +

                    "<span class='progressao-frequencia'>" +
                        escaparHtml(
                            padrao.ocorrencias + "×"
                        ) +
                    "</span>" +
                "</div>" +

                "<span class='progressao-graus'>" +
                    escaparHtml(
                        padrao.graus.join(" – ")
                    ) +
                "</span>" +

                "<span class='progressao-partes'>" +
                    "Aparece em: " +
                    escaparHtml(partes) +
                "</span>" +

            "</div>";
    });

    html += "</div>";

    return html;
}


function renderizarModoProgressao(){

    abaRoteiro.classList.toggle(
        "ativo",
        modoProgressaoAtual === "roteiro"
    );

    abaPadroes.classList.toggle(
        "ativo",
        modoProgressaoAtual === "padroes"
    );

    if(modoProgressaoAtual === "roteiro"){

        listaProgressoes.innerHTML =
            renderizarRoteiro(
                secoesProgressaoAtuais
            );

    }else{

        listaProgressoes.innerHTML =
            renderizarPadroes(
                secoesProgressaoAtuais
            );
    }
}


function sequenciasIguais(a, b){

    if(a.length !== b.length){
        return false;
    }

    for(let i = 0; i < a.length; i++){

        if(a[i] !== b[i]){
            return false;
        }
    }

    return true;
}


function chaveSequencia(graus){

    return graus.join("|");
}


function contarOcorrenciasPadroes(secoes){

    const mapa = new Map();

    // Trabalhamos com janelas de 3 a 8 graus.
    // Isso evita tratar movimentos muito curtos como
    // uma progressão importante e também evita caixas enormes.
    secoes.forEach(function(secao){

        const graus = secao.graus;

        if(graus.length < 3){
            return;
        }

        const maximo =
            Math.min(8, graus.length);

        for(let tamanho = 3; tamanho <= maximo; tamanho++){

            for(
                let inicio = 0;
                inicio <= graus.length - tamanho;
                inicio++
            ){

                const trecho =
                    graus.slice(
                        inicio,
                        inicio + tamanho
                    );

                const chave =
                    chaveSequencia(trecho);

                if(!mapa.has(chave)){

                    mapa.set(chave, {
                        graus: trecho,
                        ocorrencias: 0,
                        secoes: new Set()
                    });
                }

                const item =
                    mapa.get(chave);

                item.ocorrencias++;
                item.secoes.add(secao.nome);
            }
        }
    });

    return Array.from(
        mapa.values()
    );
}


function padraoContemPadrao(maior, menor){

    if(maior.length <= menor.length){
        return false;
    }

    for(
        let inicio = 0;
        inicio <= maior.length - menor.length;
        inicio++
    ){

        let igual = true;

        for(
            let i = 0;
            i < menor.length;
            i++
        ){

            if(
                maior[inicio + i] !==
                menor[i]
            ){
                igual = false;
                break;
            }
        }

        if(igual){
            return true;
        }
    }

    return false;
}


function pontuarPadrao(padrao){

    const tamanho =
        padrao.graus.length;

    const repeticoes =
        padrao.ocorrencias;

    const quantidadeSecoes =
        padrao.secoes.size;

    // Frequência pesa mais, mas sequências maiores
    // recebem bônus para evitar mostrar somente fragmentos.
    return (
        repeticoes * 10 +
        quantidadeSecoes * 5 +
        tamanho * 2
    );
}


function selecionarPadroesRelevantes(secoes){

    const candidatos =
        contarOcorrenciasPadroes(
            secoes
        )
        .filter(function(item){

            // Um padrão precisa aparecer ao menos duas vezes.
            return item.ocorrencias >= 2;
        })
        .sort(function(a, b){

            const diferenca =
                pontuarPadrao(b) -
                pontuarPadrao(a);

            if(diferenca !== 0){
                return diferenca;
            }

            return (
                b.graus.length -
                a.graus.length
            );
        });

    const escolhidos = [];

    candidatos.forEach(function(candidato){

        // Não adiciona uma sequência se ela for apenas
        // um fragmento redundante de outra já escolhida
        // com frequência semelhante.
        const redundante =
            escolhidos.some(function(escolhido){

                if(
                    padraoContemPadrao(
                        escolhido.graus,
                        candidato.graus
                    ) &&
                    escolhido.ocorrencias >=
                    candidato.ocorrencias - 1
                ){
                    return true;
                }

                if(
                    sequenciasIguais(
                        escolhido.graus,
                        candidato.graus
                    )
                ){
                    return true;
                }

                return false;
            });

        if(redundante){
            return;
        }

        escolhidos.push(candidato);
    });

    // Interface compacta: no máximo 4 padrões relevantes.
    return escolhidos.slice(0, 4);
}


function encontrarProgressaoPrincipal(secoes){

    const padroes =
        selecionarPadroesRelevantes(
            secoes
        );

    // Se nenhuma sequência se repetiu duas vezes,
    // usamos a progressão resumida mais representativa,
    // desde que tenha pelo menos três graus.
    if(padroes.length === 0){

        const alternativas =
            secoes
                .filter(function(secao){
                    return secao.graus.length >= 3;
                })
                .sort(function(a, b){
                    return b.graus.length - a.graus.length;
                });

        if(alternativas.length > 0){

            return [{
                graus:
                    alternativas[0].graus.slice(
                        0,
                        Math.min(
                            8,
                            alternativas[0].graus.length
                        )
                    ),
                ocorrencias: 1,
                secoes:
                    new Set([
                        alternativas[0].nome
                    ])
            }];
        }
    }

    return padroes;
}


function escaparHtml(texto){
    return String(texto)
        .replace(/&/g,"&amp;").replace(/</g,"&lt;")
        .replace(/>/g,"&gt;").replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}

function atualizarEstadoChaveProgressoes(){

    alternarProgressoes.classList.toggle(
        "ativo",
        progressoesVisiveis
    );

    alternarProgressoes.setAttribute(
        "aria-checked",
        progressoesVisiveis
            ? "true"
            : "false"
    );

    textoChaveProgressoes.textContent =
        progressoesVisiveis
            ? "Ocultar progressões"
            : "Mostrar progressões";
}


function mostrarProgressoes(texto,tomAnalise){

    const secoes =
        extrairProgressoesPorSecao(
            texto,
            tomAnalise
        );

    secoesProgressaoAtuais =
        secoes;

    haProgressoes =
        secoes.length > 0;

    if(!haProgressoes){

        analiseProgressoes.classList.add(
            "oculto"
        );

        listaProgressoes.innerHTML = "";

        alternarProgressoes.disabled = true;

        progressoesVisiveis = false;

        atualizarEstadoChaveProgressoes();

        return;
    }

    alternarProgressoes.disabled = false;

    renderizarModoProgressao();

    analiseProgressoes.classList.toggle(
        "oculto",
        !progressoesVisiveis
    );

    atualizarEstadoChaveProgressoes();
}


abaRoteiro.addEventListener("click", function(){

    modoProgressaoAtual = "roteiro";

    renderizarModoProgressao();
});


abaPadroes.addEventListener("click", function(){

    modoProgressaoAtual = "padroes";

    renderizarModoProgressao();
});


alternarProgressoes.addEventListener("click", function(){

    if(!haProgressoes){
        return;
    }

    progressoesVisiveis =
        !progressoesVisiveis;

    analiseProgressoes.classList.toggle(
        "oculto",
        !progressoesVisiveis
    );

    atualizarEstadoChaveProgressoes();
});

// ------------------------------------
// DETECÇÃO DE TOM E BOTÃO CONVERTER
// ------------------------------------

const tonsMaiores = [
    "C", "Db", "D", "Eb", "E", "F",
    "F#", "G", "Ab", "A", "Bb", "B"
];

const tonsMenores = [
    "Cm", "C#m", "Dm", "Ebm", "Em", "Fm",
    "F#m", "Gm", "G#m", "Am", "Bbm", "Bm"
];


function obterTomDeAnalise(){

    if(
        tomEhMenor(tom.value) &&
        usarRelativoMaior
    ){
        return obterRelativoMaior(tom.value);
    }

    return tom.value;
}


function limparTextoEntrada(){

    return entrada.value
        .replace(/\u00A0/g, " ")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .replace(/">(?=[A-Ga-g](?:#|b)?)/g, "")
        .replace(/\r/g, "");
}


function extrairAcordesDaCifra(texto){

    const acordes = [];

    texto.split("\n").forEach(function(linha){

        const encontrados =
            extrairAcordesDeLinha(linha);

        encontrados.forEach(function(acorde){
            acordes.push(acorde);
        });

    });

    return acordes;
}


function raizDoAcorde(acorde){

    const principal =
        acorde.split("/")[0];

    const resultado =
        principal.match(/^([A-G](?:#|b)?)/);

    return resultado
        ? resultado[1]
        : "";
}


function acordeTemQualidadeMenor(acorde){

    const principal =
        acorde.split("/")[0];

    const resultado =
        principal.match(
            /^[A-G](?:#|b)?(.*)$/
        );

    if(!resultado){
        return false;
    }

    const complemento = resultado[1];

    return (
        complemento.startsWith("m") &&
        !complemento.startsWith("maj")
    );
}


function acordeEhPowerChord(acorde){

    const principal =
        acorde.split("/")[0];

    return /^[A-G](?:#|b)?5$/.test(principal);
}


function acordeEhTonico(acorde, candidato){

    const raiz =
        raizDoAcorde(acorde);

    const raizTom =
        candidato.replace(/m$/, "");

    if(
        encontrarIndiceNota(
            raiz,
            [raizTom]
        ) === -1
    ){
        return false;
    }

    if(acordeEhPowerChord(acorde)){
        return true;
    }

    if(tomEhMenor(candidato)){
        return acordeTemQualidadeMenor(acorde);
    }

    return !acordeTemQualidadeMenor(acorde);
}


function pontuarTom(candidato, acordes){

    let pontos = 0;
    let pertencentes = 0;

    acordes.forEach(function(acorde){

        if(
            acordePertenceAoCampo(
                acorde,
                candidato
            )
        ){
            pontos += 4;
            pertencentes++;
        }

        if(acordeEhTonico(acorde, candidato)){
            pontos += 3;
        }

    });

    if(
        acordes.length > 0 &&
        acordeEhTonico(
            acordes[0],
            candidato
        )
    ){
        pontos += 5;
    }

    if(
        acordes.length > 1 &&
        acordeEhTonico(
            acordes[acordes.length - 1],
            candidato
        )
    ){
        pontos += 4;
    }

    return {
        tom: candidato,
        pontos: pontos,
        pertencentes: pertencentes,
        proporcao:
            acordes.length
                ? pertencentes / acordes.length
                : 0
    };
}


function detectarTomProvavel(texto){

    const acordes =
        extrairAcordesDaCifra(texto);

    if(acordes.length < 3){
        return null;
    }

    const candidatos =
        tonsMaiores.concat(tonsMenores);

    const resultados =
        candidatos
            .map(function(candidato){
                return pontuarTom(
                    candidato,
                    acordes
                );
            })
            .sort(function(a, b){

                if(b.pontos !== a.pontos){
                    return b.pontos - a.pontos;
                }

                return b.proporcao - a.proporcao;
            });

    const melhor =
        resultados[0];

    const selecionado =
        pontuarTom(
            tom.value,
            acordes
        );

    if(
        !melhor ||
        melhor.tom === tom.value ||
        melhor.proporcao < 0.60 ||
        melhor.pontos < selecionado.pontos + 5
    ){
        return null;
    }

    return melhor.tom;
}


function atualizarOpcoesTomMenor(){

    const menor =
        tomEhMenor(tom.value);

    modoAnaliseMenor.classList.toggle(
        "oculto",
        !menor
    );

    if(!menor){
        usarRelativoMaior = false;
    }

    analiseMenor.classList.toggle(
        "ativo",
        !usarRelativoMaior
    );

    analiseRelativo.classList.toggle(
        "ativo",
        usarRelativoMaior
    );

    if(menor){

        const relativo =
            obterRelativoMaior(tom.value);

        textoRelativo.textContent =
            "Relativo maior: " + relativo;
    }
    else{

        textoRelativo.textContent = "";
    }

}


function selecionarTom(novoTom){

    tom.value = novoTom;

    tomBotao.textContent = novoTom;

    document
        .querySelectorAll("#tomMenu [data-tom]")
        .forEach(function(item){

            item.classList.toggle(
                "ativo",
                item.dataset.tom === novoTom
            );

        });

    const tipo =
        tomEhMenor(novoTom)
            ? "menor"
            : "maior";

    mostrarTipoTom(tipo);

    usarRelativoMaior = false;

    atualizarOpcoesTomMenor();
    atualizarPreview();
}


function mostrarAlertaTom(novoTom, texto){

    tomSugerido = novoTom;

    alertaTomTexto.textContent =
        "Parece que essa cifra não está de acordo com o tom selecionado. Deseja corrigir para " +
        novoTom +
        "?";

    alertaTom.classList.remove("oculto");

    alertaTom.dataset.texto =
        texto;
}


function esconderAlertaTom(){

    alertaTom.classList.add("oculto");
    tomSugerido = "";

}


function converterCifra(
    ignorarDeteccao = false
){

    const texto =
        limparTextoEntrada();

    if(
        !ignorarDeteccao &&
        texto.trim() !== "" &&
        texto !== assinaturaTomIgnorada
    ){

        const detectado =
            detectarTomProvavel(texto);

        if(detectado){

            mostrarAlertaTom(
                detectado,
                texto
            );

            return;
        }

    }

    esconderAlertaTom();

    const tomAnalise =
        obterTomDeAnalise();

    const linhas =
        texto.split("\n");

    let posicaoGlobal = 0;

    const resultado =
        linhas.map(function(linha){

            const inicioLinha =
                posicaoGlobal;

            posicaoGlobal +=
                linha.length + 1;

            const acordesLinha =
                extrairAcordesDeLinha(
                    linha
                );

            if(acordesLinha.length === 0){
                return linha;
            }

            return linha.replace(
                /[A-Ga-g](?:#|b)?[^\s\]\)\},;:]*/g,
                function(
                    acorde,
                    deslocamento
                ){

                    const acordeLimpo =
                        limparTokenDeAcorde(
                            acorde
                        );

                    const acordeNormalizado =
                        normalizarAcorde(
                            acordeLimpo
                        );

                    if(
                        !acordeCompleto.test(
                            acordeNormalizado
                        )
                    ){
                        return acorde;
                    }

                    const pertenceAoCampo =
                        acordePertenceAoCampo(
                            acordeNormalizado,
                            tomAnalise
                        );

                    if(
                        !pertenceAoCampo &&
                        !acordesMantidos.has(
                            tomAnalise +
                            "|" +
                            acordeNormalizado
                        )
                    ){

                        const posicaoAcorde =
                            inicioLinha +
                            deslocamento;

                        return "§FORA§" +
                               posicaoAcorde +
                               "§POS§" +
                               acordeNormalizado +
                               "§FIM§";
                    }

                    const grauConvertido =
                        encontrarGrau(
                            acordeNormalizado,
                            tomAnalise,
                            formato.value,
                            formatoBaixo.value
                        );

                    return "§GRAU§" +
                           grauConvertido +
                           "§FIMGRAU§";

                }
            );

        }).join("\n");

    saida.innerHTML =
        destacarGraus(resultado);

    mostrarProgressoes(
        texto,
        tomAnalise
    );

}


botao.addEventListener(
    "click",
    function(){

        assinaturaTomIgnorada = "";

        converterCifra(false);

    }
);


corrigirTomSim.addEventListener(
    "click",
    function(){

        if(!tomSugerido){
            return;
        }

        const novoTom =
            tomSugerido;

        selecionarTom(novoTom);

        esconderAlertaTom();

        converterCifra(true);

    }
);


corrigirTomNao.addEventListener(
    "click",
    function(){

        assinaturaTomIgnorada =
            alertaTom.dataset.texto || "";

        esconderAlertaTom();

        converterCifra(true);

    }
);


analiseMenor.addEventListener(
    "click",
    function(){

        usarRelativoMaior = false;

        atualizarOpcoesTomMenor();
        atualizarPreview();

    }
);


analiseRelativo.addEventListener(
    "click",
    function(){

        usarRelativoMaior = true;

        atualizarOpcoesTomMenor();
        atualizarPreview();

    }
);


// ========================================
// PRÉVIA DOS GRAUS
// ========================================

function atualizarPreview(){

    const tomAnalise =
        obterTomDeAnalise();

    const escala =
        criarEscala(tomAnalise);

    if(!escala){
        return;
    }

    const menor =
        tomEhMenor(tomAnalise);

    const grausRomanos = menor
        ? [
            "i",
            "ii°",
            "III",
            "iv",
            "v",
            "VI",
            "VII"
        ]
        : [
            "I",
            "ii",
            "iii",
            "IV",
            "V",
            "vi",
            "vii°"
        ];

    const grausNumericos = menor
        ? [
            "1m",
            "2°",
            "3",
            "4m",
            "5m",
            "6",
            "7"
        ]
        : [
            "1",
            "2m",
            "3m",
            "4",
            "5",
            "6m",
            "7°"
        ];


    function acordeDoCampo(indice){

        let acorde =
            escala[indice];

        if(menor){

            if(
                indice === 0 ||
                indice === 3 ||
                indice === 4
            ){
                acorde += "m";
            }

            if(indice === 1){
                acorde += "°";
            }

        }
        else{

            if(
                indice === 1 ||
                indice === 2 ||
                indice === 5
            ){
                acorde += "m";
            }

            if(indice === 6){
                acorde += "°";
            }

        }

        return acorde;
    }


    let tituloPreview =
        "Prévia dos graus";

    if(
        tomEhMenor(tom.value) &&
        usarRelativoMaior
    ){

        tituloPreview +=
            " — relativo " +
            tomAnalise;

    }


    let htmlGraus =
        "<h3>" +
        tituloPreview +
        "</h3>";


    for(
        let i = 0;
        i < escala.length;
        i++
    ){

        const grau =
            formato.value === "romano"
                ? grausRomanos[i]
                : grausNumericos[i];

        htmlGraus +=
            "<span class='grau-preview'>" +
            acordeDoCampo(i) +
            " → " +
            grau +
            "</span>";

    }


    previewGraus.innerHTML =
        htmlGraus;


    // -----------------------------
    // PRÉVIA DO BAIXO
    // -----------------------------

    const acorde1 =
        acordeDoCampo(0) +
        "/" +
        escala[2];

    const acorde2 =
        acordeDoCampo(4) +
        "/" +
        escala[6];


    const convertido1 =
        encontrarGrau(
            acorde1,
            tomAnalise,
            formato.value,
            formatoBaixo.value
        );


    const convertido2 =
        encontrarGrau(
            acorde2,
            tomAnalise,
            formato.value,
            formatoBaixo.value
        );


    previewBaixo.innerHTML =
        "<h3>Prévia do baixo</h3>" +
        "<div>" +
        acorde1 +
        " → " +
        convertido1 +
        "</div>" +
        "<div>" +
        acorde2 +
        " → " +
        convertido2 +
        "</div>";

}


// Atualiza quando mudar o tom

tom.addEventListener(
    "change",
    atualizarPreview
);


// Atualiza quando mudar formato

formato.addEventListener(
    "change",
    atualizarPreview
);


// Atualiza quando mudar formato do baixo

formatoBaixo.addEventListener(
    "change",
    atualizarPreview
);


// Mostra a prévia ao abrir a página

atualizarPreview();

// ------------------------------------
// SELETOR PERSONALIZADO DE TOM
// ------------------------------------

const tomBotao =
    document.getElementById("tomBotao");

const tomMenu =
    document.getElementById("tomMenu");

const botoesTom =
    document.querySelectorAll(
        "#tomMenu [data-tom]"
    );

const botoesTipoTom =
    document.querySelectorAll(
        "#tomMenu [data-tipo-tom]"
    );

const listasTom =
    document.querySelectorAll(
        "#tomMenu [data-lista-tom]"
    );


function mostrarTipoTom(tipo){

    botoesTipoTom.forEach(
        function(botao){

            botao.classList.toggle(
                "ativo",
                botao.dataset.tipoTom === tipo
            );

        }
    );

    listasTom.forEach(
        function(lista){

            lista.classList.toggle(
                "oculto",
                lista.dataset.listaTom !== tipo
            );

        }
    );

}


tomBotao.addEventListener(
    "click",
    function(event){

        event.stopPropagation();

        tomMenu.classList.toggle(
            "aberto"
        );

        const tipo =
            tomEhMenor(tom.value)
                ? "menor"
                : "maior";

        mostrarTipoTom(tipo);

    }
);


botoesTipoTom.forEach(
    function(botao){

        botao.addEventListener(
            "click",
            function(event){

                event.stopPropagation();

                mostrarTipoTom(
                    botao.dataset.tipoTom
                );

            }
        );

    }
);


botoesTom.forEach(function(botao){

    botao.addEventListener(
        "click",
        function(event){

            event.stopPropagation();

            selecionarTom(
                botao.dataset.tom
            );

            tomMenu.classList.remove(
                "aberto"
            );

        }
    );

});


// Fecha ao clicar fora

document.addEventListener(
    "click",
    function(event){

        if(
            !tomMenu.contains(event.target) &&
            !tomBotao.contains(event.target)
        ){
            tomMenu.classList.remove(
                "aberto"
            );
        }

    }
);


atualizarOpcoesTomMenor();


// ========================================
// SELETOR PERSONALIZADO - FORMATO
// ========================================

const formatoBotao =
    document.getElementById("formatoBotao");

const formatoMenu =
    document.getElementById("formatoMenu");

const botoesFormato =
    document.querySelectorAll("#formatoMenu button");


formatoBotao.addEventListener("click", function(event){

    event.stopPropagation();

    formatoMenu.classList.toggle("aberto");

    baixoMenu.classList.remove("aberto");
    tomMenu.classList.remove("aberto");

});


botoesFormato.forEach(function(botao){

    botao.addEventListener("click", function(){

        const novoFormato =
            botao.dataset.formato;

        formato.value = novoFormato;

        formatoBotao.textContent =
            botao.textContent;


        botoesFormato.forEach(function(item){

            item.classList.remove("ativo");

        });


        botao.classList.add("ativo");

        formatoMenu.classList.remove("aberto");

        atualizarPreview();

    });

});


// ========================================
// SELETOR PERSONALIZADO - BAIXO
// ========================================

const baixoBotao =
    document.getElementById("baixoBotao");

const baixoMenu =
    document.getElementById("baixoMenu");

const botoesBaixo =
    document.querySelectorAll("#baixoMenu button");


baixoBotao.addEventListener("click", function(event){

    event.stopPropagation();

    baixoMenu.classList.toggle("aberto");

    formatoMenu.classList.remove("aberto");
    tomMenu.classList.remove("aberto");

});


botoesBaixo.forEach(function(botao){

    botao.addEventListener("click", function(){

        const novoBaixo =
            botao.dataset.baixo;

        formatoBaixo.value = novoBaixo;

        baixoBotao.textContent =
            botao.textContent;


        botoesBaixo.forEach(function(item){

            item.classList.remove("ativo");

        });


        botao.classList.add("ativo");

        baixoMenu.classList.remove("aberto");

        atualizarPreview();

    });

});


// ========================================
// FECHA OS NOVOS MENUS AO CLICAR FORA
// ========================================

document.addEventListener("click", function(event){

    if(
        !formatoMenu.contains(event.target) &&
        !formatoBotao.contains(event.target)
    ){
        formatoMenu.classList.remove("aberto");
    }


    if(
        !baixoMenu.contains(event.target) &&
        !baixoBotao.contains(event.target)
    ){
        baixoMenu.classList.remove("aberto");
    }

});


// ========================================
// COPIAR RESULTADO
// ========================================

const copiarResultado =
    document.getElementById("copiarResultado");

const tooltipCopiar =
    document.querySelector(".tooltip-copiar");


copiarResultado.addEventListener("click", function(){

    const texto = saida.innerText;


    if(texto.trim() === ""){

        tooltipCopiar.textContent = "Nada para copiar";

        setTimeout(function(){

            tooltipCopiar.textContent = "Copiar";

        }, 1500);

        return;

    }


    navigator.clipboard.writeText(texto)
        .then(function(){

            tooltipCopiar.textContent = "Copiado ✓";


            setTimeout(function(){

                tooltipCopiar.textContent = "Copiar";

            }, 1500);

        });

});


// ========================================
// COLAR CIFRA PRESERVANDO O ALINHAMENTO
// ========================================

entrada.addEventListener("paste", function(event){

    event.preventDefault();

    const clipboard = event.clipboardData;

    let texto = "";


    // Tenta pegar o HTML copiado do site

    const html = clipboard.getData("text/html");


    if(html){

        const temporario =
            document.createElement("div");

        temporario.innerHTML = html;


        // Preserva quebras de linha

        temporario.querySelectorAll("br").forEach(function(br){

            br.replaceWith("\n");

        });


        // Tenta preservar blocos em linhas separadas

        temporario.querySelectorAll(
            "div, p, pre"
        ).forEach(function(elemento){

            if(
                !elemento.textContent.endsWith("\n")
            ){
                elemento.append("\n");
            }

        });


        texto = temporario.innerText;

    }

    else{

        texto =
            clipboard.getData("text/plain");

    }


    texto = texto
        .replace(/\u00A0/g, " ")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .replace(/">(?=[A-G](?:#|b)?)/g, "")
        .replace(/\r/g, "")

        // Remove o CSS que vem junto do Cifra Club

        .replace(/body,\s*div,\s*pre,\s*p,\s*h1,\s*h2\s*\{[^}]*\}/g, "")
        .replace(/p\s*\{[^}]*mso-[^}]*\}/g, "")
        .replace(/b\s*\{[^}]*\}/g, "")
        .replace(/a,\s*span\.MsoHyperlink\s*\{[^}]*\}/g, "")

        // Remove excesso de linhas vazias

        .replace(/\n{3,}/g, "\n\n")

        .trim();


    const inicio = entrada.selectionStart;
    const fim = entrada.selectionEnd;


    entrada.value =
        entrada.value.substring(0, inicio) +
        texto +
        entrada.value.substring(fim);


    const novaPosicao =
        inicio + texto.length;


    entrada.selectionStart = novaPosicao;
    entrada.selectionEnd = novaPosicao;

});
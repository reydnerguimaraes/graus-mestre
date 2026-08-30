const entrada = document.getElementById("entrada");

const saida = document.getElementById("saida");

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
/^[A-Ga-g](?:#|b)?(?:(?:7M)|(?:maj(?:7|9|11|13))|(?:m(?:2|4|6|7|9|11|13)?)|(?:dim7?|°7?|ø|aug|\+|sus(?:2|4))|(?:2|4|6|7|9|11|13))?(?:(?:#|b)(?:5|9|11|13)|\((?:#|b)(?:5|9|11|13)\))*(?:\/[A-Ga-g](?:#|b)?)?$/i;

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
            // 1, 4, 6m, 2m7

 const ehGrau =
    /^(?:#|b)?(?:[ivIV]+|[1-7](?:m)?)(?:2|4|6|7M|7|9|11|13|maj7|sus2|sus4|dim7?|°7?|ø|aug|\+|\([^)]*\))?(?:\/(?:#|b)?(?:[ivIV]+|[1-7]|[A-G](?:#|b)?))?$/.test(parte);


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
    /^(?:2|4|6|7|7M|9|11|13)(?:(?:#|b)(?:5|9|11|13))?$/.test(parte);


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

const resultadoComAlertas =
    resultado.replace(
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


    // Não abre novamente se clicar nos botões
    if(
        event.target.classList.contains("manter-sim") ||
        event.target.classList.contains("manter-nao")
    ){
        return;
    }


    // Remove qualquer pergunta que já esteja aberta
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


    // Guarda que o usuário aceitou
    // esse acorde

    const tomAnalise =
        obterTomDeAnalise();

    acordesMantidos.add(
        tomAnalise + "|" + acorde
    );


    // Converte o acorde normalmente

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


    // Procura o acorde no campo onde
    // a cifra foi digitada

const posicao =
    Number(elemento.dataset.posicao);


  if(!Number.isNaN(posicao)){

        // Leva o usuário até o campo de entrada

        entrada.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


        // Coloca o foco no campo

        entrada.focus();


        // Seleciona exatamente o acorde
        // para o usuário poder substituí-lo

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

        const semTitulo =
            linha.replace(/\[[^\]]+\]/g, "").trim();

        if(semTitulo === ""){
            return;
        }

        const elementos =
            semTitulo.split(/\s+/);

        const linhaDeAcordes =
            elementos.every(function(elemento){
                return acordeCompleto.test(elemento);
            });

        if(!linhaDeAcordes){
            return;
        }

        elementos.forEach(function(acorde){

            const normalizado =
                normalizarAcorde(acorde);

            if(acordeCompleto.test(normalizado)){
                acordes.push(normalizado);
            }

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

            const semTitulo =
                linha.replace(
                    /\[[^\]]+\]/g,
                    ""
                ).trim();

            if(semTitulo === ""){
                return linha;
            }

            const elementos =
                semTitulo.split(/\s+/);

            const linhaDeAcordes =
                elementos.every(
                    function(elemento){

                        return acordeCompleto.test(
                            elemento
                        );

                    }
                );

            if(!linhaDeAcordes){
                return linha;
            }

            return linha.replace(
                /[A-Ga-g](?:#|b)?[^\s\]]*/g,
                function(
                    acorde,
                    deslocamento
                ){

                    const acordeNormalizado =
                        normalizarAcorde(
                            acorde
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

                    return encontrarGrau(
                        acordeNormalizado,
                        tomAnalise,
                        formato.value,
                        formatoBaixo.value
                    );

                }
            );

        }).join("\n");

    saida.innerHTML =
        destacarGraus(resultado);

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
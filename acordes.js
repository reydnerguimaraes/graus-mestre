const equivalencias = {
    "C#": "Db",
    "Db": "C#",

    "D#": "Eb",
    "Eb": "D#",

    "F#": "Gb",
    "Gb": "F#",

    "G#": "Ab",
    "Ab": "G#",

    "A#": "Bb",
    "Bb": "A#"
};


// ------------------------------------
// ESCALAS MAIORES
// ------------------------------------

function criarEscala(tom){

    const escalas = {

        "C": [
            "C", "D", "E", "F", "G", "A", "B"
        ],

        "Db": [
            "Db", "Eb", "F", "Gb", "Ab", "Bb", "C"
        ],

        "D": [
            "D", "E", "F#", "G", "A", "B", "C#"
        ],

        "Eb": [
            "Eb", "F", "G", "Ab", "Bb", "C", "D"
        ],

        "E": [
            "E", "F#", "G#", "A", "B", "C#", "D#"
        ],

        "F": [
            "F", "G", "A", "Bb", "C", "D", "E"
        ],

        "F#": [
            "F#", "G#", "A#", "B", "C#", "D#", "E#"
        ],

        "G": [
            "G", "A", "B", "C", "D", "E", "F#"
        ],

        "Ab": [
            "Ab", "Bb", "C", "Db", "Eb", "F", "G"
        ],

        "A": [
            "A", "B", "C#", "D", "E", "F#", "G#"
        ],

        "Bb": [
            "Bb", "C", "D", "Eb", "F", "G", "A"
        ],

        "B": [
            "B", "C#", "D#", "E", "F#", "G#", "A#"
        ],

        // ESCALAS MENORES NATURAIS

"Cm": [
    "C", "D", "Eb", "F", "G", "Ab", "Bb"
],

"C#m": [
    "C#", "D#", "E", "F#", "G#", "A", "B"
],

"Dm": [
    "D", "E", "F", "G", "A", "Bb", "C"
],

"Ebm": [
    "Eb", "F", "Gb", "Ab", "Bb", "Cb", "Db"
],

"Em": [
    "E", "F#", "G", "A", "B", "C", "D"
],

"Fm": [
    "F", "G", "Ab", "Bb", "C", "Db", "Eb"
],

"F#m": [
    "F#", "G#", "A", "B", "C#", "D", "E"
],

"Gm": [
    "G", "A", "Bb", "C", "D", "Eb", "F"
],

"G#m": [
    "G#", "A#", "B", "C#", "D#", "E", "F#"
],

"Am": [
    "A", "B", "C", "D", "E", "F", "G"
],

"Bbm": [
    "Bb", "C", "Db", "Eb", "F", "Gb", "Ab"
],

"Bm": [
    "B", "C#", "D", "E", "F#", "G", "A"
]

    };

    return escalas[tom];
}

function tomEhMenor(tom){

    return tom.endsWith("m");

}

// ------------------------------------
// RELATIVO MAIOR DOS TONS MENORES
// ------------------------------------

function obterRelativoMaior(tom){

    const relativos = {
        "Cm": "Eb",
        "C#m": "E",
        "Dm": "F",
        "Ebm": "F#",
        "Em": "G",
        "Fm": "Ab",
        "F#m": "A",
        "Gm": "Bb",
        "G#m": "B",
        "Am": "C",
        "Bbm": "Db",
        "Bm": "D"
    };

    return relativos[tom] || tom;
}


// ------------------------------------
// PROCURA NOTA NA ESCALA
// ------------------------------------

function encontrarIndiceNota(nota, escala){

    let indice = escala.indexOf(nota);

    if(indice !== -1){
        return indice;
    }


    const equivalente = equivalencias[nota];

    if(equivalente){

        indice = escala.indexOf(equivalente);

        if(indice !== -1){
            return indice;
        }

    }


    return -1;
}


// ------------------------------------
// FORMATA COMPLEMENTO NUMÉRICO
// ------------------------------------

function formatarComplementoNumero(complemento, menor){

    if(complemento === ""){

        if(menor){
            return "m";
        }

        return "";
    }


    if(menor){

        return "m" + complemento;

    }


    return complemento;
}


// ------------------------------------
// VERIFICA SE O COMPLEMENTO DEVE
// FICAR SEPARADO DO GRAU
// ------------------------------------

function separarComplementoMaior(complemento){

    if(complemento === ""){
        return false;
    }

    return /^(?:2|4|5|6|7M|7|9|11|13|add2|add9|add11|7sus2|7sus4|9sus2|9sus4)/.test(complemento);

}


// ------------------------------------
// CONVERTE ACORDE PARA GRAU
// ------------------------------------


function encontrarGrauAlterado(
    acorde,
    tom,
    formato = "romano",
    formatoBaixo = "nota"
){

    const escala = criarEscala(tom);

const notasSemitons = {
    "C": 0,
    "C#": 1,
    "Db": 1,
    "D": 2,
    "D#": 3,
    "Eb": 3,
    "E": 4,
    "E#": 5,
    "Fb": 4,
    "F": 5,
    "F#": 6,
    "Gb": 6,
    "G": 7,
    "G#": 8,
    "Ab": 8,
    "A": 9,
    "A#": 10,
    "Bb": 10,
    "B": 11,
    "B#": 0,
    "Cb": 11
};

let acordePrincipal = acorde;
let baixo = "";

if(acorde.includes("/")){

    const partes = acorde.split("/");

    acordePrincipal = partes[0];
    baixo = partes[1];
}

const resultado =
    acordePrincipal.match(/^([A-G](?:#|b)?)(.*)$/);

    if(!resultado){
        return acorde;
    }

    const nota = resultado[1];
    let complemento = resultado[2];

    const letraNota = nota.charAt(0);

    let indice = -1;

    for(let i = 0; i < escala.length; i++){

        if(escala[i].charAt(0) === letraNota){
            indice = i;
            break;
        }

    }

    if(indice === -1){
        return acorde;
    }

    const notaOriginal =
        notasSemitons[nota];

    const notaDaEscala =
        notasSemitons[escala[indice]];

    let diferenca =
        notaOriginal - notaDaEscala;

    if(diferenca > 6){
        diferenca -= 12;
    }

    if(diferenca < -6){
        diferenca += 12;
    }

    let alteracao = "";

    if(diferenca === 1){
        alteracao = "#";
    }

    if(diferenca === -1){
        alteracao = "b";
    }

const grausRomanos = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII"
];

const grausNumericos = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7"
];

    let menor = false;

    if(
        complemento.startsWith("m") &&
        !complemento.startsWith("maj")
    ){
        menor = true;
        complemento = complemento.substring(1);
    }

    let grau;

    if(formato === "romano"){

        grau =
            alteracao +
            grausRomanos[indice];

        if(menor){
            grau =
                alteracao +
                grausRomanos[indice].toLowerCase();
        }

    }

    else{

        grau =
            alteracao +
            grausNumericos[indice];

        if(menor){
            grau += "m";
        }

    }

    if(complemento !== ""){

        if(
            !menor &&
            separarComplementoMaior(complemento)
        ){
            grau += " " + complemento;
        }

        else{
            grau += complemento;
        }

    }

if(baixo){

    // Mantém o baixo como nota
    // Exemplo: Bb/D -> bVII/D

    if(formatoBaixo === "nota"){

        grau += "/" + baixo;

    }

    // Converte o baixo para grau
    // Exemplo: Bb/D -> bVII/II

    else{

        const indiceBaixo =
            encontrarIndiceNota(
                baixo,
                escala
            );

        if(indiceBaixo !== -1){

            if(formato === "romano"){

                grau += "/" +
                    grausRomanos[indiceBaixo];

            }

            else{

                grau += "/" +
                    grausNumericos[indiceBaixo];

            }

        }

        else{

            const baixoAlterado =
                encontrarGrauAlterado(
                    baixo,
                    tom,
                    formato,
                    "nota"
                );

            grau += "/" + baixoAlterado;

        }

    }

}

return grau;
}

function encontrarGrau(
    acorde,
    tom,
    formato = "romano",
    formatoBaixo = "nota"
){

    const escala = criarEscala(tom);


    const grausRomanos = [
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII"
    ];


    const grausNumericos = [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7"
    ];


    const original = acorde;


    // ------------------------------------
    // SEPARA O BAIXO
    // ------------------------------------

    let acordePrincipal = acorde;

    let baixo = "";


    if(acorde.includes("/")){

        const partes = acorde.split("/");

        acordePrincipal = partes[0];

        baixo = partes[1];

    }


    // ------------------------------------
    // SEPARA FUNDAMENTAL E COMPLEMENTO
    // ------------------------------------

    const resultadoNota = acordePrincipal.match(
        /^([A-G](?:#|b)?)(.*)$/
    );


    if(!resultadoNota){

        return original;

    }


    const nota = resultadoNota[1];

    let complemento = resultadoNota[2];


    // ------------------------------------
    // PADRONIZA MAJ7 PARA 7M
    // ------------------------------------

    if(complemento.startsWith("maj")){
        complemento = complemento.replace(/^maj/, "");
        complemento = complemento === "7" ? "7M" : "7M" + complemento;
    }

    complemento = complemento
        .replace(/^7M7/, "7M")
        .replace(/^7M9/, "7M(9)")
        .replace(/^7M11/, "7M(11)")
        .replace(/^7M13/, "7M(13)");


    // ------------------------------------
    // PROCURA O GRAU
    // ------------------------------------

    const indice = encontrarIndiceNota(
        nota,
        escala
    );


if(indice === -1){

    return encontrarGrauAlterado(
        acorde,
        tom,
        formato,
        formatoBaixo
    );

}


    // ------------------------------------
    // VERIFICA SE É MENOR
    // ------------------------------------

    let menor = false;


    if(
        complemento.startsWith("m") &&
        !complemento.startsWith("maj")
    ){

        menor = true;

        complemento = complemento.substring(1);

    }


    // ------------------------------------
    // MONTA GRAU ROMANO
    // ------------------------------------

    let grau;


    if(formato === "romano"){

        grau = grausRomanos[indice];


        // ------------------------------
        // ACORDE MENOR
        // ------------------------------
        // Am7 -> ii7
        // Em9 -> vi9

        if(menor){

            grau = grau.toLowerCase();

            grau += complemento;

        }


        // ------------------------------
        // ACORDE MAIOR
        // ------------------------------
        // F7M -> IV 7M
        // G7  -> V 7
        // C9  -> I 9
        // C   -> I

        else{

            if(
                separarComplementoMaior(
                    complemento
                )
            ){

                grau += " " + complemento;

            }

            else{

                grau += complemento;

            }

        }

    }


    // ------------------------------------
    // MONTA GRAU NUMÉRICO
    // ------------------------------------

    else{

        grau = grausNumericos[indice];


        const complementoNumero =
            formatarComplementoNumero(
                complemento,
                menor
            );


        // ------------------------------
        // ALTERAÇÕES COMPLEXAS
        // ------------------------------
        // D7#5 -> 5(7#5)

        if(
            complementoNumero.includes("#") ||
            complementoNumero.includes("b") ||
            complementoNumero.includes("(")
        ){

            grau += "(" + complementoNumero + ")";

        }


        // ------------------------------
        // ACORDE MENOR
        // ------------------------------
        // Am7 -> 2m7
        // Em9 -> 6m9

        else if(menor){

            grau += complementoNumero;

        }


        // ------------------------------
        // ACORDE MAIOR
        // ------------------------------
        // F7M -> 4 7M
        // G7  -> 5 7
        // C9  -> 1 9

        else if(
            separarComplementoMaior(
                complementoNumero
            )
        ){

            grau += " " + complementoNumero;

        }


        // ------------------------------
        // ACORDE MAIOR SIMPLES
        // ------------------------------

        else{

            grau += complementoNumero;

        }

    }


    // ------------------------------------
    // BAIXO
    // ------------------------------------

    if(baixo){


        // Mantém a nota
        // G/B -> I/B
        // G/B -> 1/B

        if(formatoBaixo === "nota"){

            grau += "/" + baixo;

        }


        // Converte o baixo para grau
        // G/B -> I/III
        // G/B -> 1/3

        else{

            const indiceBaixo =
                encontrarIndiceNota(
                    baixo,
                    escala
                );


            if(indiceBaixo !== -1){

                if(formato === "romano"){

                    grau += "/" +
                        grausRomanos[indiceBaixo];

                }

                else{

                    grau += "/" +
                        grausNumericos[indiceBaixo];

                }

            }

            else{

                grau += "/" + baixo;

            }

        }

    }


    return grau;
}

// ========================================
// VALIDAÇÃO DO CAMPO HARMÔNICO
// ========================================

function acordePertenceAoCampo(acorde, tom){

    const escala = criarEscala(tom);

    if(!escala){
        return false;
    }


    // Remove o baixo para analisar o acorde principal
    // Exemplo: C/E -> C

    let acordePrincipal = acorde.split("/")[0];


    // Identifica fundamental e complemento

    const resultado = acordePrincipal.match(
        /^([A-G](?:#|b)?)(.*)$/
    );


    if(!resultado){
        return false;
    }


    const nota = resultado[1];
    let complemento = resultado[2];

    // Power chord (ex.: G5) não é maior nem menor.
    // Para validação do campo, consideramos a fundamental.
    const ehPowerChord = complemento === "5";


    // Procura a nota exatamente como grau da escala

    const indice = encontrarIndiceNota(
        nota,
        escala
    );


    if(indice === -1){
        return false;
    }

    if(ehPowerChord){
        return true;
    }


    // ========================================
    // QUALIDADE ESPERADA DE CADA GRAU
    //
    // I    maior
    // ii   menor
    // iii  menor
    // IV   maior
    // V    maior
    // vi   menor
    // vii° diminuto
    // ========================================

    if(tomEhMenor(tom)){

    const grausMenores = [0, 3, 4];

    const segundoGrau = 1;

    const ehMenor =
        complemento.startsWith("m") &&
        !complemento.startsWith("maj");

    const ehDiminuto =
        complemento.startsWith("dim") ||
        complemento.startsWith("°") ||
        complemento.startsWith("ø") ||
        complemento.startsWith("m7b5");

    // i
    if(indice === 0){
        return ehMenor;
    }

    // ii°
    if(indice === segundoGrau){
        return ehDiminuto;
    }

    // III
    if(indice === 2){
        return !ehMenor && !ehDiminuto;
    }

 // iv
if(indice === 3){
    return ehMenor;
}

// V menor natural OU V/V7 maior
if(indice === 4){
    return true;
}

    // VI e VII
    if(indice === 5 || indice === 6){
        return !ehMenor && !ehDiminuto;
    }

}

    const grausMenores = [1, 2, 5];

    const setimoGrau = 6;


    // ----------------------------------------
    // Detecta acorde menor
    // ----------------------------------------

    const ehMenor =
        complemento.startsWith("m") &&
        !complemento.startsWith("maj");


    // ----------------------------------------
    // Detecta acorde diminuto
    // ----------------------------------------

    const ehDiminuto =
        complemento.startsWith("dim") ||
        complemento.startsWith("°") ||
        complemento.startsWith("ø") ||
        complemento.startsWith("m7b5");


    // ----------------------------------------
    // VII grau
    // ----------------------------------------

    if(indice === setimoGrau){

        return ehDiminuto;

    }


    // ----------------------------------------
    // Graus menores: ii, iii e vi
    // ----------------------------------------

    if(grausMenores.includes(indice)){

        return ehMenor;

    }


    // ----------------------------------------
    // Graus maiores: I, IV e V
    // ----------------------------------------

    if(ehMenor || ehDiminuto){

        return false;

    }


    return true;
}
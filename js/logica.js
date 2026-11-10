/* =========================================================
   LÓGICA - BIBLIOTECA DE JOGOS VIRTUAL (Aula 09)

   TEMA: catálogo de jogos (nome, gênero, ano e nota).
   ENTRADA: uma nota mínima (0 a 10), digitada com prompt, e
            depois uma lista de jogos desejados, até digitar "sair".
   PROCESSAMENTO: classificar cada jogo por época, escolher uma
            mensagem por gênero e resumir o catálogo (contar
            recomendados, somar notas, achar a maior nota).
   SAÍDA: frases no console (template literal) e relatório
            com console.table.

   PSEUDOCÓDIGO:
   1. Ler a nota mínima e validar (cancelar, vazio, texto, faixa)
   2. Para cada jogo do catálogo:
        2.1 classificar a época pelo ano (Recente / Moderno / Clássico)
        2.2 escolher a seção pelo gênero (switch)
        2.3 se nota >= nota mínima, contar como recomendado
        2.4 somar a nota e atualizar a maior nota
   3. Calcular a média das notas
   4. Pedir jogos desejados até a pessoa digitar "sair"
   5. Mostrar o relatório com console.table

   TESTE DE MESA (3 primeiras voltas do laço principal):
   | volta | jogo               | ano  | época    | somaNotas | melhor nota        |
   |-------|--------------------|------|----------|-----------|--------------------|
   |   1   | Age of Empires II  | 1999 | Clássico |    9.0    | Age of Empires II  |
   |   2   | Hades              | 2020 | Moderno  |   18.3    | Hades (9.3)        |
   |   3   | Elden Ring         | 2022 | Recente  |   27.9    | Elden Ring (9.6)   |
   (a coluna "recomendados" depende da nota mínima digitada)
   ========================================================= */

// ---------------------------------------------------------
// 1. DADOS
// ---------------------------------------------------------
const jogosCatalogo = [
  { nome: 'Age of Empires II', genero: 'Estratégia', ano: 1999, nota: 9.0 },
  { nome: 'Hades', genero: 'Ação', ano: 2020, nota: 9.3 },
  { nome: 'Elden Ring', genero: 'RPG', ano: 2022, nota: 9.6 },
  { nome: 'The Witcher 3', genero: 'RPG', ano: 2015, nota: 9.8 },
  { nome: 'Breath of the Wild', genero: 'Aventura', ano: 2017, nota: 9.7 },
  { nome: 'EA Sports FC 24', genero: 'Esportes', ano: 2023, nota: 7.5 },
];

// ---------------------------------------------------------
// 2. ENTRADA COM VALIDAÇÃO
// ---------------------------------------------------------
// Devolve um número entre 0 e 10, ou null se a pessoa cancelar
function lerNotaMinima() {
  while (true) {
    const entrada = prompt('Digite a nota mínima para recomendar um jogo (0 a 10):');

    if (entrada === null) return null; // clicou em Cancelar

    const texto = entrada.trim().replace(',', '.'); // aceita "8,5"
    if (texto === '') {
      alert('Você não digitou nada. Tente de novo.');
      continue;
    }

    const numero = Number(texto);
    if (Number.isNaN(numero)) {
      alert('Digite apenas números, por exemplo 8 ou 8.5.');
      continue;
    }
    if (numero < 0 || numero > 10) {
      alert('A nota precisa estar entre 0 e 10.');
      continue;
    }

    return numero;
  }
}

// ?? usa 8 como padrão quando a entrada for null (Cancelar)
const notaMinima = lerNotaMinima() ?? 8;

// ---------------------------------------------------------
// 3. LAÇO PRINCIPAL: classificar e resumir
// ---------------------------------------------------------
let totalRecomendados = 0; // contador
let somaNotas = 0; // acumulador
let melhorJogo = jogosCatalogo[0]; // máximo
const relatorio = [];

for (const jogo of jogosCatalogo) {
  // 3.1 if / else if / else: a condição mais alta vem primeiro
  let epoca;
  if (jogo.ano >= 2022) {
    epoca = 'Recente';
  } else if (jogo.ano >= 2010) {
    epoca = 'Moderno';
  } else {
    epoca = 'Clássico';
  }

  // 3.2 switch sobre o gênero (texto), com break e default
  let secao;
  switch (jogo.genero) {
    case 'Ação':
      secao = 'Para quem gosta de adrenalina';
      break;
    case 'Aventura':
      secao = 'Para explorar mundos';
      break;
    case 'RPG':
      secao = 'Para viver uma grande história';
      break;
    case 'Esportes':
      secao = 'Para jogar com os amigos';
      break;
    case 'Estratégia':
      secao = 'Para planejar cada jogada';
      break;
    default:
      secao = 'Outros gêneros';
      break;
  }

  // 3.3 padrões de laço: contador, acumulador e máximo
  const recomendado = jogo.nota >= notaMinima;
  if (recomendado) {
    totalRecomendados++;
  }
  somaNotas += jogo.nota;
  if (jogo.nota > melhorJogo.nota) {
    melhorJogo = jogo;
  }

  console.log(
    `${jogo.nome} (${jogo.ano}) → ${epoca} | ${secao} | nota ${jogo.nota.toFixed(1)}`
  );

  relatorio.push({
    jogo: jogo.nome,
    genero: jogo.genero,
    ano: jogo.ano,
    epoca,
    nota: jogo.nota,
    recomendado: recomendado ? 'Sim' : 'Não',
  });
}

const mediaNotas = somaNotas / jogosCatalogo.length;

// ---------------------------------------------------------
// 4. WHILE: lista de jogos desejados até digitar "sair"
// ---------------------------------------------------------
const desejados = [];
let comando = prompt('Digite o nome de um jogo que você quer jogar (ou "sair" para terminar):');

while (comando !== null && comando.trim().toLowerCase() !== 'sair') {
  const nomeDesejado = comando.trim();
  if (nomeDesejado !== '') {
    desejados.push(nomeDesejado);
  }
  // a condição é atualizada aqui dentro: sem isso, o laço seria infinito
  comando = prompt(
    `Jogos desejados até agora: ${desejados.length}. Digite outro nome ou "sair":`
  );
}

// ---------------------------------------------------------
// 5. RESULTADO
// ---------------------------------------------------------
const palavraRecomendados = totalRecomendados === 1 ? 'jogo' : 'jogos';

console.log(`Nota mínima escolhida: ${notaMinima}`);
console.log(`${totalRecomendados} ${palavraRecomendados} com nota ${notaMinima} ou mais.`);
console.log(`Média das notas do catálogo: ${mediaNotas.toFixed(2)}`);
console.log(`Jogo mais bem avaliado: ${melhorJogo.nome} (${melhorJogo.nota.toFixed(1)})`);
console.log(
  desejados.length === 0
    ? 'Nenhum jogo foi adicionado à lista de desejos.'
    : `Lista de desejos: ${desejados.join(', ')}.`
);
console.table(relatorio);
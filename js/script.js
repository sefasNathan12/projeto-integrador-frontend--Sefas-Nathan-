console.log('script.js carregou');

/* =========================================================
   SCRIPT - BIBLIOTECA DE JOGOS VIRTUAL (Aula 11)

   TEMA: preços de jogos com desconto, classificados em faixas.
   PADRÃO: processar → classificar → mostrar
     - calcularPrecoFinal: processa (aplica o desconto)
     - classificarFaixa:   classifica (barato / médio / caro)
     - criarCartaoJogo:    monta o elemento do jogo (DOM)

   Aproveita o CSS que o projeto já tem: .grade-jogos e .card-jogo
   (layout.css) e .badge (style.css). A cor de cada faixa vem da
   variável --tone, definida em faixas.css.

   Cadastro: o formulário tem o campo "Preço". Ao digitar, a faixa
   aparece na hora. Ao cadastrar, o main.js avisa com o evento
   "jogo-cadastrado" e este arquivo inclui o jogo nos cartões.
   ========================================================= */

// ---------------------------------------------------------
// 1. DADOS
// ---------------------------------------------------------
const jogosLoja = [
  { nome: 'Age of Empires II', genero: 'Estratégia', preco: 39.9 },
  { nome: 'Hades', genero: 'Ação e Aventura', preco: 73.99 },
  { nome: 'Elden Ring', genero: 'RPG', preco: 229.9 },
  { nome: 'The Witcher 3', genero: 'RPG', preco: 99.9 },
  { nome: 'Breath of the Wild', genero: 'Ação e Aventura', preco: 299 },
  { nome: 'EA Sports FC 24', genero: 'Esportes', preco: 129.9 },
];

// Texto mostrado para cada faixa (a chave também vira classe CSS)
const rotulosFaixa = {
  barato: 'Barato',
  medio: 'Médio',
  caro: 'Caro',
};

// ---------------------------------------------------------
// 2. FUNÇÕES QUE CALCULAM (não mexem na página)
// ---------------------------------------------------------

// Processa: devolve o preço com desconto, arredondado em centavos.
// O desconto tem valor padrão de 10% (0.1) e o preço original não muda.
function calcularPrecoFinal(preco, desconto = 0.1) {
  const precoComDesconto = preco * (1 - desconto);
  return Math.round(precoComDesconto * 100) / 100;
}

// Classifica: devolve a chave da faixa (3 faixas, da menor para a maior)
function classificarFaixa(precoFinal) {
  if (precoFinal < 50) {
    return 'barato';
  } else if (precoFinal < 150) {
    return 'medio';
  } else {
    return 'caro';
  }
}

// Formata um número como dinheiro: 35.91 vira "R$ 35,91"
function formatarPreco(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Texto de prévia para o campo de preço do formulário
function descreverFaixa(texto) {
  if (texto.trim() === '') return '';
  const preco = Number(texto);
  if (Number.isNaN(preco) || preco < 0) return 'Digite um preço válido.';

  const precoFinal = calcularPrecoFinal(preco);
  const faixa = classificarFaixa(precoFinal);
  return `Faixa: ${rotulosFaixa[faixa]} · ${formatarPreco(precoFinal)} com 10% de desconto`;
}

// ---------------------------------------------------------
// 3. TESTES NO CONSOLE (confira à mão antes de ligar à página)
//    calcularPrecoFinal(100)       → 90
//    calcularPrecoFinal(100, 0.5)  → 50
//    calcularPrecoFinal(100, 0)    → 100
//    classificarFaixa(35.91)       → "barato"
//    classificarFaixa(50)          → "medio"
//    classificarFaixa(150)         → "caro"
//    descreverFaixa('200')         → "Faixa: Caro · R$ 180,00 ..."
// ---------------------------------------------------------

// ---------------------------------------------------------
// 4. ARRAYS: map, filter, reduce e sort (em uma cópia)
// ---------------------------------------------------------
function analisarLista(lista) {
  // map: um novo array com o resultado de cada jogo (o original não muda)
  const analisados = lista.map((jogo) => {
    const precoFinal = calcularPrecoFinal(jogo.preco);
    return { ...jogo, precoFinal, faixa: classificarFaixa(precoFinal) };
  });

  // filter: só os jogos da faixa "caro"
  const caros = analisados.filter((jogo) => jogo.faixa === 'caro');

  // sort: copiamos com [...] antes, porque o sort altera o array original
  const ordenados = [...analisados].sort((a, b) => a.precoFinal - b.precoFinal);

  // reduce: valor total do catálogo já com desconto
  const total = analisados.reduce((soma, jogo) => soma + jogo.precoFinal, 0);

  return { ordenados, caros, total, media: total / analisados.length };
}

// ---------------------------------------------------------
// 5. FUNÇÕES QUE MEXEM NA PÁGINA (DOM)
// ---------------------------------------------------------

// Monta e devolve o elemento de um jogo
function criarCartaoJogo(jogo) {
  const cartao = document.createElement('article');
  cartao.classList.add('card-jogo', `faixa-${jogo.faixa}`);

  const titulo = document.createElement('h3');
  titulo.classList.add('card-jogo-titulo');
  titulo.textContent = jogo.nome;

  const etiqueta = document.createElement('span');
  etiqueta.classList.add('badge');
  etiqueta.textContent = rotulosFaixa[jogo.faixa];

  const genero = document.createElement('p');
  genero.classList.add('card-jogo-descricao');
  genero.textContent = jogo.genero;

  const preco = document.createElement('p');
  preco.classList.add('card-jogo-ano');
  preco.textContent = `${formatarPreco(jogo.precoFinal)} (de ${formatarPreco(jogo.preco)})`;

  cartao.append(titulo, etiqueta, genero, preco);
  return cartao;
}

// Monta e devolve a grade com um cartão por jogo
function criarGradeCartoes(jogos) {
  const grade = document.createElement('div');
  grade.classList.add('grade-jogos');
  jogos.forEach((jogo) => {
    grade.append(criarCartaoJogo(jogo));
  });
  return grade;
}

// Monta e devolve o parágrafo de resumo
function criarResumo(total, media, quantidadeCaros) {
  const resumo = document.createElement('p');
  resumo.classList.add('secao-dica', 'resumo-jogos');
  const palavra = quantidadeCaros === 1 ? 'jogo caro' : 'jogos caros';
  resumo.textContent =
    `Total com desconto: ${formatarPreco(total)} · ` +
    `Preço médio: ${formatarPreco(media)} · ` +
    `${quantidadeCaros} ${palavra}`;
  return resumo;
}

// Seleciona a área e confirma que existe; se não existir, cria uma
function obterAreaResultado() {
  let area = document.querySelector('#resultado');
  if (area !== null) return area;

  console.warn('Área #resultado não encontrada no index.html. Criando uma.');
  area = document.createElement('section');
  area.id = 'resultado';

  const titulo = document.createElement('h2');
  titulo.textContent = 'Preços com desconto';
  area.append(titulo);

  const referencia = document.querySelector('#catalogo');
  if (referencia !== null) {
    referencia.after(area);
  } else {
    (document.querySelector('main') ?? document.body).append(area);
  }
  return area;
}

// Apaga o resumo e a grade antigos e desenha de novo com os dados atuais
function desenharResultado() {
  const area = obterAreaResultado();
  const { ordenados, caros, total, media } = analisarLista(jogosLoja);

  area.querySelectorAll('.resumo-jogos, .grade-jogos').forEach((elemento) => {
    elemento.remove();
  });
  area.append(
    criarResumo(total, media, caros.length),
    criarGradeCartoes(ordenados)
  );
}

// Liga o formulário de cadastro: prévia da faixa e inclusão do jogo novo
function configurarCadastro() {
  const campoPreco = document.querySelector('#preco-jogo');
  const previa = document.querySelector('#faixa-previa');

  if (campoPreco !== null && previa !== null) {
    campoPreco.addEventListener('input', () => {
      previa.textContent = descreverFaixa(campoPreco.value);
    });
    campoPreco.form?.addEventListener('reset', () => {
      previa.textContent = '';
    });
  }

  // O main.js dispara este evento depois de adicionar o jogo na tabela
  document.addEventListener('jogo-cadastrado', (evento) => {
    const { nome, genero, preco } = evento.detail;
    const precoNumero = Number(preco);
    if (Number.isNaN(precoNumero) || precoNumero < 0) return;

    // Se o nome já existe nos cartões, só atualiza; senão, inclui
    const existente = jogosLoja.find(
      (jogo) => jogo.nome.toLowerCase() === nome.toLowerCase()
    );
    if (existente) {
      existente.genero = genero;
      existente.preco = precoNumero;
    } else {
      jogosLoja.push({ nome, genero, preco: precoNumero });
    }
    desenharResultado();
  });
}

desenharResultado();
configurarCadastro();
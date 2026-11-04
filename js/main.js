// =========================================================
// BIBLIOTECA DE JOGOS VIRTUAL - main.js
// 1. Catálogo: selos de gênero, busca por nome e filtro por categoria
// 2. Formulário: adiciona o jogo cadastrado na tabela
// =========================================================

// Tira acentos e maiúsculas: "Ação" vira "acao"
const normalizar = (texto) =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// "Ação e Aventura" vira "acao-e-aventura" (usado no CSS para a cor do gênero)
const gerarSlug = (texto) =>
  normalizar(texto).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

document.addEventListener('DOMContentLoaded', () => {
  const catalogo = iniciarCatalogo();
  iniciarFormulario(catalogo);
});

// ---------------------------------------------------------
// 1. CATÁLOGO
// ---------------------------------------------------------
function iniciarCatalogo() {
  const tabela = document.querySelector('#catalogo table');
  const tbody = tabela?.querySelector('tbody');
  const lista = document.querySelector('#categorias ul');
  if (!tbody || !lista) return null;

  let categoria = null; // slug da categoria selecionada
  let termo = ''; // texto da busca, já normalizado

  // Tira a borda antiga e coloca a tabela numa caixa que rola no celular
  tabela.removeAttribute('border');
  const rolagem = document.createElement('div');
  rolagem.className = 'tabela-scroll';
  tabela.before(rolagem);
  rolagem.append(tabela);

  // Barra de busca
  const busca = document.createElement('div');
  busca.className = 'busca';
  busca.setAttribute('role', 'search');

  const rotulo = document.createElement('label');
  rotulo.htmlFor = 'busca-jogo';
  rotulo.className = 'visually-hidden';
  rotulo.textContent = 'Buscar jogo pelo nome';

  const campo = document.createElement('input');
  campo.type = 'search';
  campo.id = 'busca-jogo';
  campo.placeholder = 'Buscar jogo pelo nome';
  campo.autocomplete = 'off';
  busca.append(rotulo, campo);

  // Mensagem de status (role="status": leitores de tela anunciam mudanças)
  const status = document.createElement('p');
  status.className = 'filtro-status';
  status.setAttribute('role', 'status');
  rolagem.before(busca, status);

  // Linha exibida quando nenhum jogo combina com os filtros
  const vazio = document.createElement('tr');
  vazio.className = 'sem-resultados';
  vazio.hidden = true;
  const celulaVazia = document.createElement('td');
  celulaVazia.colSpan = 3;
  celulaVazia.textContent = 'Nenhum jogo encontrado. Tente outro nome ou limpe os filtros.';
  vazio.append(celulaVazia);
  tbody.append(vazio);

  const linhasJogos = () => [...tbody.querySelectorAll('tr:not(.sem-resultados)')];

  // Troca o texto do gênero por um selo colorido e guarda o gênero na linha
  function prepararLinha(linha) {
    const celula = linha.cells[1];
    const genero = celula.textContent.trim();
    const selo = document.createElement('span');
    selo.className = 'badge';
    selo.dataset.genero = gerarSlug(genero);
    selo.textContent = genero;
    celula.replaceChildren(selo);

    linha.dataset.genero = gerarSlug(genero);
    garantirCategoria(genero);
  }

  // Transforma o texto do <li> em um botão (funciona com o teclado)
  function prepararCategoria(li) {
    const nome = li.textContent.trim();
    li.dataset.genero = gerarSlug(nome);

    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'categoria-btn';
    botao.setAttribute('aria-pressed', 'false');
    botao.textContent = nome;
    li.replaceChildren(botao);
  }

  // Se um jogo novo tem um gênero sem card (ex: Esportes), cria o card
  function garantirCategoria(genero) {
    const slug = gerarSlug(genero);
    if ([...lista.children].some((li) => li.dataset.genero === slug)) return;

    const li = document.createElement('li');
    li.textContent = genero;
    prepararCategoria(li);
    lista.append(li);
  }

  function atualizarStatus(visiveis, total) {
    const palavra = total === 1 ? 'jogo' : 'jogos';
    const texto = document.createElement('span');

    if (!categoria && !termo) {
      texto.textContent = `${total} ${palavra} no catálogo.`;
      status.replaceChildren(texto);
      return;
    }

    let mensagem = `Mostrando ${visiveis} de ${total} ${palavra}`;
    if (categoria) {
      const nome = lista.querySelector(`li[data-genero="${categoria}"] button`).textContent;
      mensagem += ` em “${nome}”`;
    }
    if (termo) mensagem += `, busca “${campo.value.trim()}”`;
    texto.textContent = `${mensagem}.`;

    const limpar = document.createElement('button');
    limpar.type = 'button';
    limpar.className = 'filtro-limpar';
    limpar.textContent = 'Limpar filtros';

    status.replaceChildren(texto, limpar);
  }

  // Aplica categoria + busca juntas
  function aplicar() {
    const linhas = linhasJogos();
    let visiveis = 0;

    linhas.forEach((linha) => {
      const naCategoria = !categoria || linha.dataset.genero === categoria;
      const naBusca = !termo || normalizar(linha.cells[0].textContent).includes(termo);
      linha.hidden = !(naCategoria && naBusca);
      if (!linha.hidden) visiveis++;
    });

    vazio.hidden = visiveis !== 0;

    lista.querySelectorAll('li').forEach((li) => {
      const selecionada = li.dataset.genero === categoria;
      li.querySelector('button').setAttribute('aria-pressed', String(selecionada));
    });

    atualizarStatus(visiveis, linhas.length);
  }

  function limparFiltros() {
    categoria = null;
    termo = '';
    campo.value = '';
    aplicar();
  }

  // Eventos
  lista.addEventListener('click', (evento) => {
    const botao = evento.target.closest('.categoria-btn');
    if (!botao) return;
    const slug = botao.closest('li').dataset.genero;
    categoria = categoria === slug ? null : slug; // clicar de novo desmarca
    aplicar();
  });

  campo.addEventListener('input', () => {
    termo = normalizar(campo.value);
    aplicar();
  });

  status.addEventListener('click', (evento) => {
    if (!evento.target.closest('.filtro-limpar')) return;
    limparFiltros();
    campo.focus();
  });

  // Prepara o que já existe no HTML
  [...lista.children].forEach(prepararCategoria);
  linhasJogos().forEach(prepararLinha);
  aplicar();

  // Funções que o formulário usa
  return {
    existe(nome) {
      return linhasJogos().some(
        (linha) => normalizar(linha.cells[0].textContent) === normalizar(nome)
      );
    },
    adicionar({ nome, genero, ano }) {
      const linha = document.createElement('tr');
      [nome, genero, ano].forEach((valor) => {
        const celula = document.createElement('td');
        celula.textContent = valor;
        linha.append(celula);
      });
      vazio.before(linha);
      prepararLinha(linha);
      aplicar();
    },
    limparFiltros,
  };
}

// ---------------------------------------------------------
// 2. FORMULÁRIO
// ---------------------------------------------------------
function iniciarFormulario(catalogo) {
  const form = document.querySelector('#cadastro form');
  if (!form) return;

  const aviso = document.createElement('p');
  aviso.className = 'form-aviso';
  aviso.setAttribute('role', 'status');
  form.append(aviso);

  function mostrarAviso(texto, { erro = false, link = false } = {}) {
    aviso.classList.toggle('form-aviso--erro', erro);
    aviso.replaceChildren(texto);
    if (link) {
      const ancora = document.createElement('a');
      ancora.href = '#catalogo';
      ancora.textContent = 'Ver no catálogo';
      aviso.append(' ', ancora);
    }
  }

  form.addEventListener('submit', (evento) => {
    // O navegador já bloqueou campos inválidos antes de chegar aqui
    evento.preventDefault();

    const campoNome = form.elements['nome-jogo'];
    const nome = campoNome.value.trim();
    const ano = form.elements['ano-lancamento'].value;
    const genero = form.elements['genero'].selectedOptions[0].textContent.trim();

    if (catalogo?.existe(nome)) {
      mostrarAviso(`“${nome}” já está no catálogo.`, { erro: true });
      campoNome.focus();
      return;
    }

    // Limpa filtros para o jogo novo aparecer na tabela
    catalogo?.limparFiltros();
    catalogo?.adicionar({ nome, genero, ano });

    form.reset();
    mostrarAviso(`“${nome}” foi adicionado ao catálogo.`, { link: true });
  });

  // O botão "Limpar formulário" também apaga a mensagem
  form.addEventListener('reset', () => aviso.replaceChildren());
}
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../hooks/useAvaliacoes.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const aguardar = () => new Promise((resolve) => setImmediate(resolve));

// Simula foco/desfoco da navegação e respostas da API usando o hook real.
function criarPerfil(get) {
  const slots = [];
  let indice = 0;
  let efeito;
  let limpar;
  let medicoId = 'medico-1';
  const react = {
    useState(inicial) {
      const posicao = indice++;
      if (!slots[posicao]) slots[posicao] = { value: inicial };
      return [slots[posicao].value, (valor) => { slots[posicao].value = typeof valor === 'function' ? valor(slots[posicao].value) : valor; }];
    },
    useRef(inicial) {
      const posicao = indice++;
      if (!slots[posicao]) slots[posicao] = { current: inicial };
      return slots[posicao];
    },
    useCallback(funcao, deps) {
      const posicao = indice++;
      if (!slots[posicao] || deps.some((dep, i) => dep !== slots[posicao].deps[i])) slots[posicao] = { funcao, deps };
      return slots[posicao].funcao;
    },
  };
  const context = { exports: {}, require: (nome) => {
    if (nome === 'react') return react;
    if (nome === '@react-navigation/native') return { useFocusEffect: (callback) => { efeito = callback; } };
    if (nome === '../api/uaiMedApi') return { __esModule: true, default: { get } };
    throw new Error(`Import inesperado: ${nome}`);
  } };
  vm.runInNewContext(compiled, context);
  const renderizar = () => { indice = 0; return context.exports.useAvaliacoes(medicoId); };
  renderizar();
  return {
    atual: renderizar,
    focar: () => { renderizar(); limpar = efeito(); },
    sair: () => { limpar?.(); limpar = undefined; },
    trocarMedico: (id) => { limpar?.(); medicoId = id; renderizar(); limpar = efeito(); },
  };
}

test('carrega média e quantidade ao focar e atualiza ao voltar ao perfil', async () => {
  let chamadas = 0;
  const perfil = criarPerfil(async (url) => {
    assert.equal(url, '/avaliacoes/medico/medico-1/media');
    chamadas += 1;
    return { data: chamadas === 1 ? { notaMedia: 4.5, totalAvaliacoes: 2 } : { notaMedia: 3.7, totalAvaliacoes: 3 } };
  });
  perfil.focar();
  assert.equal(perfil.atual().loading, true);
  await aguardar();
  assert.equal(perfil.atual().notaMedia, 4.5);
  assert.equal(perfil.atual().totalAvaliacoes, 2);
  perfil.sair();
  perfil.focar();
  await aguardar();
  assert.equal(perfil.atual().notaMedia, 3.7);
  assert.equal(perfil.atual().totalAvaliacoes, 3);
  assert.equal(chamadas, 2);
});

test('distingue ausência de avaliações de nota zero', async () => {
  const perfil = criarPerfil(async () => ({ data: { notaMedia: 0, totalAvaliacoes: 0 } }));
  perfil.focar();
  await aguardar();
  assert.equal(perfil.atual().notaMedia, null);
  assert.equal(perfil.atual().totalAvaliacoes, 0);
  assert.equal(perfil.atual().error, null);
});

test('exibe falha de carregamento e permite tentar novamente', async () => {
  let chamadas = 0;
  const perfil = criarPerfil(async () => {
    if (++chamadas === 1) throw { response: { data: { error: 'Servidor indisponível' } } };
    return { data: { notaMedia: '4.5', totalAvaliacoes: '2' } };
  });
  perfil.focar();
  await aguardar();
  assert.equal(perfil.atual().error, 'Servidor indisponível');
  assert.equal(perfil.atual().totalAvaliacoes, null);
  await perfil.atual().carregarMediaAvaliacoes('medico-1');
  assert.equal(perfil.atual().notaMedia, 4.5);
  assert.equal(perfil.atual().error, null);
});

test('ignora resposta atrasada de outro profissional', async () => {
  let concluirPrimeira;
  const perfil = criarPerfil((url) => url.includes('medico-1')
    ? new Promise((resolve) => { concluirPrimeira = resolve; })
    : Promise.resolve({ data: { notaMedia: 5, totalAvaliacoes: 1 } }));
  perfil.focar();
  perfil.trocarMedico('medico-2');
  await aguardar();
  concluirPrimeira({ data: { notaMedia: 2, totalAvaliacoes: 8 } });
  await aguardar();
  assert.equal(perfil.atual().notaMedia, 5);
  assert.equal(perfil.atual().totalAvaliacoes, 1);
});

test('não exibe nota ou quantidade inválida recebida da API', async () => {
  for (const data of [{ notaMedia: 'inválida', totalAvaliacoes: 2 }, { notaMedia: 6, totalAvaliacoes: 1 }, { notaMedia: 0, totalAvaliacoes: 2 }, { notaMedia: 4, totalAvaliacoes: -1 }]) {
    const perfil = criarPerfil(async () => ({ data }));
    perfil.focar();
    await aguardar();
    assert.ok(perfil.atual().error);
    assert.equal(perfil.atual().notaMedia, null);
    assert.equal(perfil.atual().totalAvaliacoes, null);
  }
});

test('limpa nota ao sair da conta profissional e não consulta sem ID', async () => {
  let chamadas = 0;
  const perfil = criarPerfil(async () => { chamadas++; return { data: { notaMedia: 5, totalAvaliacoes: 1 } }; });
  perfil.focar();
  await aguardar();
  perfil.trocarMedico(undefined);
  await aguardar();
  assert.equal(perfil.atual().notaMedia, null);
  assert.equal(perfil.atual().totalAvaliacoes, null);
  assert.equal(perfil.atual().loading, false);
  assert.equal(chamadas, 1);
});

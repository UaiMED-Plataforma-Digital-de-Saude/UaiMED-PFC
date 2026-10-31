const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Testa o mesmo módulo puro utilizado pelo formulário, sem carregar o runtime nativo.
const source = fs.readFileSync(path.join(__dirname, '../utils/cadastroValidation.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
const context = { exports: {} };
vm.runInNewContext(compiled.outputText, context);
const { validarCadastro, limitarDigitos, formatarTelefone, validarCrm } = context.exports;

test('a edição do CRM usa a mesma validação do cadastro', () => {
  for (const crm of ['123456-MG', ' crm-sp-12345 ', '14566666666666666666']) assert.equal(validarCrm(crm), undefined);
  for (const crm of ['', 'ABC', 'CRM@123', '145666666666666666666']) assert.ok(validarCrm(crm));
});

const base = {
  tipo: 'paciente', nome: 'Igor Exemplo', documento: '12345678901',
  email: 'igor@example.com', telefone: '31999999999', senha: 'senha123', confirmaSenha: 'senha123',
  especialidade: '', crm: '', endereco: '', cidade: '', estado: '', cep: '', aceitaLgpd: true,
};

for (const tipo of ['paciente', 'medico', 'clinica']) {
  const dados = {
    ...base, tipo, documento: tipo === 'clinica' ? '12345678000199' : base.documento,
    ...(tipo === 'medico' ? { especialidade: 'Cardiologia', crm: '123456-MG' } : {}),
  };
  test(`aceita cadastro válido de ${tipo}`, () => {
    assert.equal(Object.keys(validarCadastro(dados)).length, 0);
  });
  for (const nome of ['João Gonçalves', 'José Luís da Conceição', 'Érica D’Ávila', 'Ana-Mária São José', 'Clínica São João & Filhos Ltda.', 'Joa\u0303o Gonc\u0327alves']) {
    test(`preserva acentos no nome de ${tipo}: ${nome}`, () => {
      const entrada = { ...dados, nome };
      assert.equal(Object.keys(validarCadastro(entrada)).length, 0);
      assert.equal(entrada.nome, nome);
    });
  }
  test(`impede telefone gigantesco no cadastro de ${tipo}`, () => {
    assert.ok(validarCadastro({ ...dados, telefone: '9'.repeat(1000) }).telefone);
  });
  test(`exige telefone no cadastro de ${tipo}`, () => {
    assert.ok(validarCadastro({ ...dados, telefone: '' }).telefone);
  });
}

test('limita digitação e colagem do telefone a 11 dígitos', () => {
  assert.equal(limitarDigitos('(31) 99999-9999abc123456789', 11), '31999999999');
  assert.equal(formatarTelefone('31999999999'.repeat(100)), '(31) 99999-9999');
});

test('formata telefone fixo, celular e número parcial', () => {
  assert.equal(formatarTelefone('3133334444'), '(31) 3333-4444');
  assert.equal(formatarTelefone('31999999999'), '(31) 99999-9999');
  assert.equal(formatarTelefone('319'), '(31) 9');
});

test('limita CPF, CNPJ e CEP e filtra caracteres não numéricos', () => {
  assert.equal(limitarDigitos('123.456.789-012345', 11), '12345678901');
  assert.equal(limitarDigitos('12.345.678/0001-991234', 14), '12345678000199');
  assert.equal(limitarDigitos('30100-000abc123', 8), '30100000');
});

for (const [campo, valor] of [
  ['nome', '   '], ['nome', 'A'], ['nome', 'A'.repeat(121)],
  ['email', 'incorreto'], ['email', `${'a'.repeat(250)}@example.com`],
  ['documento', '123456789012'], ['documento', 'abc12345678901'],
  ['telefone', '999999999'], ['telefone', '00999999999'], ['telefone', 'abc31999999999'],
  ['senha', '12345'], ['senha', ' '.repeat(6)], ['senha', 'a'.repeat(73)], ['senha', 'á'.repeat(37)],
  ['senha', '😀'.repeat(19)], ['confirmaSenha', 'diferente'], ['aceitaLgpd', false],
]) {
  test(`mostra erro em ${campo} inválido (${String(valor).slice(0, 12)})`, () => {
    assert.ok(validarCadastro({ ...base, [campo]: valor })[campo]);
  });
}

for (const [campo, valor] of [
  ['crm', 'ABC'], ['crm', 'CRM@123'], ['crm', '1'.repeat(21)], ['especialidade', ''],
  ['endereco', 'Rua'], ['endereco', 'A'.repeat(201)], ['cidade', 'A'], ['cidade', 'A'.repeat(101)],
  ['estado', 'ZZ'], ['cep', '1234567'], ['cep', '123456789'],
]) {
  test(`valida ${campo} profissional`, () => {
    assert.ok(validarCadastro({ ...base, tipo: 'medico', especialidade: 'Cardiologia', crm: '123456-MG', [campo]: valor })[campo]);
  });
}

for (const senha of ['a'.repeat(72), 'á'.repeat(36), '😀'.repeat(18)]) {
  test('aceita senha no limite UTF-8 sem cortar silenciosamente o valor', () => {
    assert.equal(Object.keys(validarCadastro({ ...base, senha, confirmaSenha: senha })).length, 0);
  });
}

test('mantém campos de endereço opcionais para médico e clínica', () => {
  for (const tipo of ['medico', 'clinica']) {
    const erros = validarCadastro({ ...base, tipo, documento: tipo === 'clinica' ? '12345678000199' : base.documento, especialidade: 'Cardiologia', crm: '123456-MG' });
    assert.equal(Object.keys(erros).length, 0);
  }
});

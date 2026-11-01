export const CADASTRO_LIMITES = {
  nome: 120,
  email: 254,
  telefone: 11,
  senha: 72,
  crm: 20,
  endereco: 200,
  cidade: 100,
} as const;

export const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

export interface DadosCadastro {
  tipo: 'paciente' | 'medico' | 'clinica';
  nome: string;
  documento: string;
  email: string;
  telefone: string;
  senha: string;
  confirmaSenha: string;
  especialidade: string;
  crm: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  aceitaLgpd: boolean;
}

export type ErrosCadastro = Partial<Record<keyof DadosCadastro, string>>;

export const limitarDigitos = (valor: string, limite: number) => valor.replace(/\D/g, '').slice(0, limite);

export function validarCrm(valor: string): string | undefined {
  return /^(?=.*\d)[A-Z0-9/-]{3,20}$/.test(valor.trim().toUpperCase())
    ? undefined : 'Informe um CRM válido com até 20 caracteres, como 123456-MG.';
}

export function formatarTelefone(valor: string): string {
  const digitos = limitarDigitos(valor, CADASTRO_LIMITES.telefone);
  if (digitos.length <= 2) return digitos;
  const numero = digitos.slice(2);
  const corte = numero.length > 8 ? 5 : 4;
  return `(${digitos.slice(0, 2)}) ${numero.slice(0, corte)}${numero.length > corte ? `-${numero.slice(corte)}` : ''}`;
}

function tamanhoUtf8(valor: string): number {
  let bytes = 0;
  for (const caractere of valor) {
    const codigo = caractere.codePointAt(0)!;
    bytes += codigo <= 0x7f ? 1 : codigo <= 0x7ff ? 2 : codigo <= 0xffff ? 3 : 4;
  }
  return bytes;
}

export function validarCadastro(dados: DadosCadastro): ErrosCadastro {
  const erros: ErrosCadastro = {};
  const nome = dados.nome.trim();
  if (nome.length < 2 || nome.length > CADASTRO_LIMITES.nome) {
    erros.nome = 'Informe nome ou razão social com 2 a 120 caracteres.';
  }

  const email = dados.email.trim();
  if (email.length > CADASTRO_LIMITES.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    erros.email = 'Informe um e-mail válido com até 254 caracteres.';
  }

  const tamanhoDocumento = dados.tipo === 'clinica' ? 14 : 11;
  if (!new RegExp(`^\\d{${tamanhoDocumento}}$`).test(dados.documento)) {
    erros.documento = `${dados.tipo === 'clinica' ? 'CNPJ' : 'CPF'} deve conter exatamente ${tamanhoDocumento} dígitos.`;
  }

  if (!/^\d{10,11}$/.test(dados.telefone)) {
    erros.telefone = 'Informe telefone com DDD e 10 ou 11 dígitos.';
  } else if (!/^[1-9]{2}/.test(dados.telefone)) {
    erros.telefone = 'Informe um DDD válido.';
  }

  if (!dados.senha.trim() || dados.senha.length < 6) {
    erros.senha = 'A senha deve ter pelo menos 6 caracteres e não pode conter apenas espaços.';
  } else if (dados.senha.length > CADASTRO_LIMITES.senha || tamanhoUtf8(dados.senha) > 72) {
    erros.senha = 'A senha é muito longa; reduza o número de caracteres.';
  }
  if (!dados.confirmaSenha || dados.senha !== dados.confirmaSenha) {
    erros.confirmaSenha = 'A confirmação deve ser igual à senha.';
  }

  if (dados.tipo === 'medico') {
    if (!dados.especialidade.trim() || dados.especialidade.trim().length > 80) {
      erros.especialidade = 'Selecione uma especialidade.';
    }
    const erroCrm = validarCrm(dados.crm);
    if (erroCrm) erros.crm = erroCrm;
  }

  if (dados.tipo === 'medico' || dados.tipo === 'clinica') {
    const endereco = dados.endereco.trim();
    const cidade = dados.cidade.trim();
    if (endereco && (endereco.length < 5 || endereco.length > CADASTRO_LIMITES.endereco)) {
      erros.endereco = 'O endereço deve ter de 5 a 200 caracteres.';
    }
    if (cidade && (cidade.length < 2 || cidade.length > CADASTRO_LIMITES.cidade)) {
      erros.cidade = 'A cidade deve ter de 2 a 100 caracteres.';
    }
    if (dados.estado.trim() && !UFS.includes(dados.estado.trim().toUpperCase())) {
      erros.estado = 'Informe uma UF válida, como MG.';
    }
    if (dados.cep && !/^\d{8}$/.test(dados.cep)) {
      erros.cep = 'O CEP deve conter exatamente 8 dígitos.';
    }
  }

  if (!dados.aceitaLgpd) {
    erros.aceitaLgpd = 'Aceite a Política de Privacidade para continuar.';
  }
  return erros;
}

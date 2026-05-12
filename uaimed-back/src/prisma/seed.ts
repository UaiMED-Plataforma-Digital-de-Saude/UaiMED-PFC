import { faker } from "@faker-js/faker/locale/pt_BR";
import { prisma } from "../config/database";
import { hashPassword } from "../utils/hash";
import logger from "../utils/logger";

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Data relativa a hoje: dias positivos = futuro, negativos = passado */
function daysFromNow(days: number, hour = 9, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/** CPF fictício único baseado em contador: XXX.XXX.XXX-XX */
function fakeCpf(index: number): string {
  const n = String(index).padStart(9, "0");
  return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6, 9)}-${String(index % 99).padStart(2, "0")}`;
}

/** Telefone no formato (DD) 9XXXX-XXXX */
function fakeTelefone(): string {
  const ddd = faker.helpers.arrayElement(["11", "21", "31", "41", "51", "61", "71", "81", "85"]);
  return `(${ddd}) 9${faker.string.numeric(4)}-${faker.string.numeric(4)}`;
}

/** Pega elemento aleatório de um array */
function pick<T>(arr: ReadonlyArray<T>): T {
  return faker.helpers.arrayElement(arr as T[]);
}

// ── Constantes ────────────────────────────────────────────────────────────────

const ESPECIALIDADES = [
  "Cardiologia", "Dermatologia", "Pediatria", "Ortopedia",
  "Neurologia", "Ginecologia", "Psiquiatria", "Clínica Geral",
  "Oftalmologia", "Urologia",
];

const STATUS_AGENDAMENTO = ["agendado", "confirmado", "concluido", "cancelado"];

const HORAS_CONSULTA = [8, 9, 10, 11, 13, 14, 15, 16, 17];
const DURACOES = [30, 45, 60];

const METODOS_PAG = ["cartao_credito", "cartao_debito", "pix"];

const COMENTARIOS_POSITIVOS = [
  "Excelente profissional, muito atencioso e explicou tudo com clareza!",
  "Consultório limpo, atendimento rápido e diagnóstico certeiro.",
  "Super recomendo! Médico muito humano e competente.",
  "Atendimento impecável, tirou todas as minhas dúvidas.",
  "Muito satisfeito com a consulta. Voltarei com certeza!",
  "Profissional de altíssimo nível. Me senti muito bem atendido.",
  "Dr. explicou cada detalhe do tratamento. Confiança total.",
];

const COMENTARIOS_MEDIANOS = [
  "Boa consulta, mas a espera foi um pouco longa.",
  "Atendimento ok, receita foi assertiva.",
  "Bom médico, aguardando retorno dos exames solicitados.",
  "Atendeu bem, mas poderia ter explicado melhor o diagnóstico.",
];

const ASSUNTOS_CONTATO = [
  "Dúvida sobre exame", "Receita médica", "Efeitos colaterais",
  "Agendamento de retorno", "Resultado de exame", "Fisioterapia pós-consulta",
  "Vacinas em atraso", "Dúvida sobre medicamento", "Horários disponíveis",
];

const ESTADOS_CIDADES: Record<string, string> = {
  SP: "São Paulo", RJ: "Rio de Janeiro", MG: "Belo Horizonte",
  RS: "Porto Alegre", BA: "Salvador",    PR: "Curitiba",
  SC: "Florianópolis", CE: "Fortaleza",
};

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  logger.info("🌱 Iniciando seed com Faker (pt_BR)...");

  // Limpa tudo respeitando ordem de FK
  await prisma.mensagem.deleteMany();
  await prisma.conversa.deleteMany();
  await prisma.pagamento.deleteMany();
  await prisma.avaliacao.deleteMany();
  await prisma.contato.deleteMany();
  await prisma.agendamento.deleteMany();
  await prisma.profissional.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.cupom.deleteMany();

  const senha = await hashPassword("senha123");
  let cpfIdx = 1; // contador global para CPFs únicos

  // ── Cupons ─────────────────────────────────────────────────────────────────
  logger.info("Criando cupons...");
  await prisma.cupom.createMany({
    data: [
      { codigo: "UAIMED10",       desconto: 10, dataExpiracao: new Date("2027-12-31"), ativo: true, usosLimite: 200 },
      { codigo: "PRIMEIRACOMPRA", desconto: 20, dataExpiracao: new Date("2027-12-31"), ativo: true },
      { codigo: "NATAL25",        desconto: 25, dataExpiracao: new Date("2027-01-10"), ativo: true, usosLimite: 50  },
      { codigo: "VERAO15",        desconto: 15, dataExpiracao: new Date("2027-03-31"), ativo: true, usosLimite: 100 },
      { codigo: "UAIMED50",       desconto: 50, dataExpiracao: new Date("2027-06-30"), ativo: true, usosLimite: 5, usosAtuais: 3 },
    ],
  });

  // ── Admin ──────────────────────────────────────────────────────────────────
  logger.info("Criando usuário admin...");
  await prisma.usuario.create({
    data: {
      nome: "Admin Clínica UaiMED",
      email: "admin@uaimed.com",
      cpf: fakeCpf(cpfIdx++),
      telefone: "(31) 3000-0000",
      senha,
      tipo: "clinica",
      cidade: "Belo Horizonte",
      estado: "MG",
      pixKey: "00.000.000/0001-00",
      banco: "Bradesco",
      agencia: "1234",
      conta: "98765-4",
      tipoConta: "corrente",
    },
  });

  // ── Clínicas fixas para o carrossel ────────────────────────────────────────
  logger.info("Criando clínicas fixas...");
  const clinicasFixasData = [
    {
      nome: "Clínica Saúde Plena",
      email: "contato@saudeplena.com.br",
      telefone: "(11) 3200-1100",
      cidade: "São Paulo",
      estado: "SP",
      pixKey: "contato@saudeplena.com.br",
      banco: "Itaú",
      agencia: "0001",
      conta: "11111-1",
      tipoConta: "corrente",
    },
    {
      nome: "Centro Médico Vida Nova",
      email: "atendimento@vidanova.med.br",
      telefone: "(21) 2500-8800",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      pixKey: "atendimento@vidanova.med.br",
      banco: "Bradesco",
      agencia: "0022",
      conta: "22222-2",
      tipoConta: "corrente",
    },
    {
      nome: "Clínica BemEstar",
      email: "fale@clinicabemestar.com",
      telefone: "(31) 3301-4455",
      cidade: "Belo Horizonte",
      estado: "MG",
      pixKey: "fale@clinicabemestar.com",
      banco: "Nubank",
      agencia: "0001",
      conta: "33333-3",
      tipoConta: "corrente",
    },
    {
      nome: "Diagnóstico Curitiba",
      email: "info@diagcuritiba.com.br",
      telefone: "(41) 3100-7700",
      cidade: "Curitiba",
      estado: "PR",
      pixKey: "info@diagcuritiba.com.br",
      banco: "Santander",
      agencia: "0044",
      conta: "44444-4",
      tipoConta: "corrente",
    },
    {
      nome: "Clínica Família Saudável",
      email: "familia@clinicasaudavel.com.br",
      telefone: "(51) 3222-9090",
      cidade: "Porto Alegre",
      estado: "RS",
      pixKey: "familia@clinicasaudavel.com.br",
      banco: "BB",
      agencia: "0055",
      conta: "55555-5",
      tipoConta: "poupanca",
    },
    {
      nome: "Instituto Saúde Nordeste",
      email: "contato@isne.com.br",
      telefone: "(85) 3300-6600",
      cidade: "Fortaleza",
      estado: "CE",
      pixKey: "contato@isne.com.br",
      banco: "Caixa",
      agencia: "0066",
      conta: "66666-6",
      tipoConta: "corrente",
    },
    {
      nome: "Clínica Integrada Salvador",
      email: "cis@clinicasalvador.med.br",
      telefone: "(71) 3400-5500",
      cidade: "Salvador",
      estado: "BA",
      pixKey: "cis@clinicasalvador.med.br",
      banco: "Itaú",
      agencia: "0077",
      conta: "77777-7",
      tipoConta: "corrente",
    },
    {
      nome: "Centro de Especialidades SC",
      email: "cesc@especialidadessc.com.br",
      telefone: "(48) 3200-4400",
      cidade: "Florianópolis",
      estado: "SC",
      pixKey: "cesc@especialidadessc.com.br",
      banco: "Bradesco",
      agencia: "0088",
      conta: "88888-8",
      tipoConta: "corrente",
    },
    {
      nome: "Clínica São Lucas",
      email: "saolucas@clinicasl.com.br",
      telefone: "(11) 4000-2200",
      cidade: "São Paulo",
      estado: "SP",
      pixKey: "saolucas@clinicasl.com.br",
      banco: "Nubank",
      agencia: "0099",
      conta: "99999-9",
      tipoConta: "corrente",
    },
  ];

  await Promise.all(
    clinicasFixasData.map((c) =>
      prisma.usuario.create({
        data: {
          nome:      c.nome,
          email:     c.email,
          cpf:       fakeCpf(cpfIdx++),
          telefone:  c.telefone,
          senha,
          tipo:      "clinica",
          cidade:    c.cidade,
          estado:    c.estado,
          pixKey:    c.pixKey,
          banco:     c.banco,
          agencia:   c.agencia,
          conta:     c.conta,
          tipoConta: c.tipoConta,
          ativo:     true,
        },
      })
    )
  );
  logger.info(`✓ ${clinicasFixasData.length} clínicas criadas.`);

  // ── Pacientes fixos (credenciais conhecidas para demo/testes) ──────────────
  logger.info("Criando pacientes fixos...");
  const fixedPatientData = [
    { nome: "João da Silva",  email: "joao@example.com"     },
    { nome: "Maria Oliveira", email: "maria@example.com"    },
    { nome: "Carlos Santos",  email: "carlos@example.com"   },
    { nome: "Ana Lima",       email: "ana@example.com"      },
    { nome: "Pedro Costa",    email: "pedro@example.com"    },
    { nome: "Fernanda Souza", email: "fernanda@example.com" },
  ];

  const pacientesFixos = await Promise.all(
    fixedPatientData.map((u) =>
      prisma.usuario.create({
        data: { ...u, cpf: fakeCpf(cpfIdx++), telefone: fakeTelefone(), senha, tipo: "paciente" },
      })
    )
  );

  // ── Pacientes extras (Faker) ───────────────────────────────────────────────
  logger.info("Criando 14 pacientes extras com Faker...");
  const pacientesExtras = await Promise.all(
    Array.from({ length: 14 }, () =>
      prisma.usuario.create({
        data: {
          nome:     faker.person.fullName(),
          email:    faker.internet.email({ firstName: faker.person.firstName(), lastName: faker.person.lastName() }).toLowerCase(),
          cpf:      fakeCpf(cpfIdx++),
          telefone: fakeTelefone(),
          senha,
          tipo:     "paciente",
        },
      })
    )
  );

  const todosPacientes = [...pacientesFixos, ...pacientesExtras];

  // ── Médicos fixos (credenciais conhecidas) ─────────────────────────────────
  logger.info("Criando médicos fixos...");
  const medicosFixosData = [
    { nome: "Dr. Carlos Mendes",       email: "carlos.mendes@uaimed.com",   especialidade: "Cardiologia",  crm: "123456/SP", cidade: "São Paulo",       estado: "SP", cep: "01310-200", endereco: "Av. Paulista, 1500",       dataFormacao: new Date("2010-12-01"), pixKey: "carlos.mendes@uaimed.com",   banco: "Itaú",      agencia: "0001", conta: "12345-6", tipoConta: "corrente" },
    { nome: "Dra. Ana Paula Ferreira", email: "ana.ferreira@uaimed.com",    especialidade: "Dermatologia", crm: "234567/SP", cidade: "São Paulo",       estado: "SP", cep: "01426-001", endereco: "Rua Oscar Freire, 450",    dataFormacao: new Date("2013-06-15"), pixKey: "ana.ferreira@uaimed.com",    banco: "Nubank",    agencia: "0001", conta: "23456-7", tipoConta: "corrente" },
    { nome: "Dr. Ricardo Almeida",     email: "ricardo.almeida@uaimed.com", especialidade: "Pediatria",    crm: "345678/RJ", cidade: "Rio de Janeiro",  estado: "RJ", cep: "22240-003", endereco: "Rua das Laranjeiras, 90",  dataFormacao: new Date("2012-03-20"), pixKey: "ricardo.almeida@uaimed.com", banco: "Bradesco",  agencia: "5678", conta: "34567-8", tipoConta: "corrente" },
    { nome: "Dra. Beatriz Nunes",      email: "beatriz.nunes@uaimed.com",   especialidade: "Ortopedia",    crm: "456789/RJ", cidade: "Rio de Janeiro",  estado: "RJ", cep: "22021-001", endereco: "Av. Atlântica, 1200",      dataFormacao: new Date("2015-11-10"), pixKey: "beatriz.nunes@uaimed.com",   banco: "Santander", agencia: "1234", conta: "45678-9", tipoConta: "poupanca" },
    { nome: "Dr. Marcos Pereira",      email: "marcos.pereira@uaimed.com",  especialidade: "Neurologia",   crm: "567890/MG", cidade: "Belo Horizonte",  estado: "MG", cep: "30130-009", endereco: "Av. Afonso Pena, 3000",   dataFormacao: new Date("2011-07-05"), pixKey: "marcos.pereira@uaimed.com",  banco: "BB",        agencia: "9012", conta: "56789-0", tipoConta: "corrente" },
    { nome: "Dra. Juliana Castro",     email: "juliana.castro@uaimed.com",  especialidade: "Ginecologia",  crm: "678901/MG", cidade: "Belo Horizonte",  estado: "MG", cep: "30160-012", endereco: "Rua da Bahia, 1800",       dataFormacao: new Date("2014-09-30"), pixKey: "juliana.castro@uaimed.com",  banco: "Caixa",     agencia: "3456", conta: "67890-1", tipoConta: "corrente" },
  ];

  const profissionaisFixos = await Promise.all(
    medicosFixosData.map(async ({ especialidade, crm, cidade, estado, cep, endereco, dataFormacao, pixKey, banco, agencia, conta, tipoConta, ...user }) => {
      const u = await prisma.usuario.create({
        data: { ...user, cpf: fakeCpf(cpfIdx++), telefone: fakeTelefone(), senha, tipo: "medico" },
      });
      const p = await prisma.profissional.create({
        data: { usuarioId: u.id, especialidade, crm, dataFormacao, endereco, cidade, estado, cep, pixKey, banco, agencia, conta, tipoConta },
      });
      return { usuario: u, profissional: p };
    })
  );

  // ── Médicos extras (Faker) ─────────────────────────────────────────────────
  logger.info("Criando 4 médicos extras com Faker...");
  const estadosList = Object.keys(ESTADOS_CIDADES);

  const profissionaisExtras = await Promise.all(
    Array.from({ length: 4 }, (_, i) => {
      const estado = pick(estadosList);
      const especialidade = pick(ESPECIALIDADES);
      const prefixo = i % 2 === 0 ? "Dr." : "Dra.";
      const localCpfIdx = cpfIdx++;
      return (async () => {
        const u = await prisma.usuario.create({
          data: {
            nome:     `${prefixo} ${faker.person.fullName()}`,
            email:    `medico.extra${localCpfIdx}@uaimed.com`,
            cpf:      fakeCpf(localCpfIdx),
            telefone: fakeTelefone(),
            senha,
            tipo:     "medico",
          },
        });
        const p = await prisma.profissional.create({
          data: {
            usuarioId:    u.id,
            especialidade,
            crm:          `${String(localCpfIdx).padStart(6, "0")}/${estado}`,
            dataFormacao: faker.date.between({ from: "2000-01-01", to: "2018-12-31" }),
            endereco:     faker.location.streetAddress(),
            cidade:       ESTADOS_CIDADES[estado],
            estado,
            cep:          `${faker.string.numeric(5)}-${faker.string.numeric(3)}`,
            pixKey:       `medico.extra${localCpfIdx}@uaimed.com`,
            banco:        faker.helpers.arrayElement(["Itaú", "Bradesco", "Nubank", "BB", "Santander", "Caixa"]),
            agencia:      faker.string.numeric(4),
            conta:        `${faker.string.numeric(5)}-${faker.string.numeric(1)}`,
            tipoConta:    faker.helpers.arrayElement(["corrente", "poupanca"]),
          },
        });
        return { usuario: u, profissional: p };
      })();
    })
  );

  const todosProfissionais = [...profissionaisFixos, ...profissionaisExtras];
  const profIds = todosProfissionais.map((p) => p.profissional);

  // ── Agendamentos ───────────────────────────────────────────────────────────
  logger.info("Criando agendamentos fixos...");

  // 8 agendamentos fixos (usados em pagamentos/avaliações logo abaixo)
  const agendamentosFixos = await Promise.all([
    prisma.agendamento.create({ data: { usuarioId: todosPacientes[0].id, profissionalId: profIds[0].id, dataHora: daysFromNow(-20, 9,  0), duracao: 30, status: "concluido",  observacoes: "Consulta de rotina - ECG normal"      } }),
    prisma.agendamento.create({ data: { usuarioId: todosPacientes[1].id, profissionalId: profIds[1].id, dataHora: daysFromNow(-15, 10, 0), duracao: 45, status: "concluido",  observacoes: "Avaliação dermatológica"              } }),
    prisma.agendamento.create({ data: { usuarioId: todosPacientes[2].id, profissionalId: profIds[2].id, dataHora: daysFromNow(-10, 14, 0), duracao: 30, status: "concluido",  observacoes: "Consulta pediátrica"                  } }),
    prisma.agendamento.create({ data: { usuarioId: todosPacientes[3].id, profissionalId: profIds[4].id, dataHora: daysFromNow(-8,  9, 30), duracao: 60, status: "concluido",  observacoes: "Avaliação neurológica - cefaleia"     } }),
    prisma.agendamento.create({ data: { usuarioId: todosPacientes[4].id, profissionalId: profIds[3].id, dataHora: daysFromNow(-5,  11, 0), duracao: 30, status: "concluido",  observacoes: "Dor no joelho - pós treino"           } }),
    prisma.agendamento.create({ data: { usuarioId: todosPacientes[5].id, profissionalId: profIds[5].id, dataHora: daysFromNow(-3,  16, 0), duracao: 45, status: "concluido",  observacoes: "Consulta preventiva anual"            } }),
    prisma.agendamento.create({ data: { usuarioId: todosPacientes[0].id, profissionalId: profIds[0].id, dataHora: daysFromNow(2,   9,  0), duracao: 30, status: "confirmado", observacoes: "Retorno cardio - exames"              } }),
    prisma.agendamento.create({ data: { usuarioId: todosPacientes[1].id, profissionalId: profIds[5].id, dataHora: daysFromNow(3,  14,  0), duracao: 45, status: "confirmado", observacoes: "Consulta preventiva"                  } }),
  ]);

  // 30 agendamentos extras com Faker
  logger.info("Criando 30 agendamentos extras com Faker...");
  await Promise.all(
    Array.from({ length: 30 }, () => {
      const diasOffset = faker.number.int({ min: -60, max: 60 });
      const status =
        diasOffset < -2 ? pick(["concluido", "concluido", "cancelado"]) :
        diasOffset > 2  ? pick(["agendado", "confirmado"]) :
                          pick(STATUS_AGENDAMENTO);
      return prisma.agendamento.create({
        data: {
          usuarioId:      pick(todosPacientes).id,
          profissionalId: pick(profIds).id,
          dataHora:       daysFromNow(diasOffset, pick(HORAS_CONSULTA), 0),
          duracao:        pick(DURACOES),
          status,
          observacoes:    faker.datatype.boolean({ probability: 0.6 }) ? faker.lorem.sentence() : undefined,
        },
      });
    })
  );

  // ── Pagamentos ─────────────────────────────────────────────────────────────
  logger.info("Criando pagamentos...");
  await Promise.all([
    prisma.pagamento.create({ data: { usuarioId: todosPacientes[0].id, agendamentoId: agendamentosFixos[0].id, valor: 250, desconto: 25, valorFinal: 225, metodo: "cartao_credito", status: "aprovado", cartaoFinal: "1234", cupom: "UAIMED10"       } }),
    prisma.pagamento.create({ data: { usuarioId: todosPacientes[1].id, agendamentoId: agendamentosFixos[1].id, valor: 300, desconto:  0, valorFinal: 300, metodo: "pix",            status: "aprovado", pixChave: todosPacientes[1].email               } }),
    prisma.pagamento.create({ data: { usuarioId: todosPacientes[2].id, agendamentoId: agendamentosFixos[2].id, valor: 200, desconto: 40, valorFinal: 160, metodo: "cartao_credito", status: "aprovado", cartaoFinal: "5678", cupom: "PRIMEIRACOMPRA"  } }),
    prisma.pagamento.create({ data: { usuarioId: todosPacientes[3].id, agendamentoId: agendamentosFixos[3].id, valor: 400, desconto:  0, valorFinal: 400, metodo: "pix",            status: "aprovado", pixChave: todosPacientes[3].email               } }),
    prisma.pagamento.create({ data: { usuarioId: todosPacientes[4].id, agendamentoId: agendamentosFixos[4].id, valor: 280, desconto: 70, valorFinal: 210, metodo: "cartao_debito",  status: "aprovado", cartaoFinal: "9012", cupom: "NATAL25"         } }),
    prisma.pagamento.create({ data: { usuarioId: todosPacientes[5].id, agendamentoId: agendamentosFixos[5].id, valor: 350, desconto:  0, valorFinal: 350, metodo: "pix",            status: "aprovado", pixChave: todosPacientes[5].email               } }),
    prisma.pagamento.create({ data: { usuarioId: todosPacientes[0].id, agendamentoId: agendamentosFixos[6].id, valor: 250, desconto:  0, valorFinal: 250, metodo: "pix",            status: "pendente", pixChave: todosPacientes[0].email               } }),
    prisma.pagamento.create({ data: { usuarioId: todosPacientes[1].id, agendamentoId: agendamentosFixos[7].id, valor: 320, desconto:  0, valorFinal: 320, metodo: pick(METODOS_PAG), status: "pendente"                                                } }),
  ]);

  // ── Avaliações ─────────────────────────────────────────────────────────────
  logger.info("Criando avaliações...");

  // Fixas (para os agendamentos concluídos)
  await Promise.all([
    prisma.avaliacao.create({ data: { usuarioId: todosPacientes[0].id, profissionalId: profIds[0].id, nota: 5, comentario: pick(COMENTARIOS_POSITIVOS) } }),
    prisma.avaliacao.create({ data: { usuarioId: todosPacientes[1].id, profissionalId: profIds[1].id, nota: 5, comentario: pick(COMENTARIOS_POSITIVOS) } }),
    prisma.avaliacao.create({ data: { usuarioId: todosPacientes[2].id, profissionalId: profIds[2].id, nota: 4, comentario: pick(COMENTARIOS_MEDIANOS)   } }),
    prisma.avaliacao.create({ data: { usuarioId: todosPacientes[3].id, profissionalId: profIds[4].id, nota: 5, comentario: pick(COMENTARIOS_POSITIVOS) } }),
    prisma.avaliacao.create({ data: { usuarioId: todosPacientes[4].id, profissionalId: profIds[3].id, nota: 4, comentario: pick(COMENTARIOS_MEDIANOS)   } }),
    prisma.avaliacao.create({ data: { usuarioId: todosPacientes[5].id, profissionalId: profIds[5].id, nota: 5, comentario: pick(COMENTARIOS_POSITIVOS) } }),
  ]);

  // Extras com Faker (evitando par duplicado paciente+profissional)
  const paresAvaliados = new Set<string>();
  for (const pac of pacientesExtras) {
    const prof = pick(profIds);
    const chave = `${pac.id}:${prof.id}`;
    if (paresAvaliados.has(chave)) continue;
    paresAvaliados.add(chave);
    const nota = faker.number.int({ min: 3, max: 5 });
    await prisma.avaliacao.create({
      data: {
        usuarioId:      pac.id,
        profissionalId: prof.id,
        nota,
        comentario:     nota >= 4 ? pick(COMENTARIOS_POSITIVOS) : pick(COMENTARIOS_MEDIANOS),
      },
    });
  }

  // ── Contatos ───────────────────────────────────────────────────────────────
  logger.info("Criando contatos...");

  // Fixos
  await Promise.all([
    prisma.contato.create({ data: { usuarioId: todosPacientes[0].id, profissionalId: profIds[0].id, assunto: "Dúvida sobre exame",   mensagem: "Doutor, gostaria de entender melhor o resultado do meu ECG.",                         status: "lido"     } }),
    prisma.contato.create({ data: { usuarioId: todosPacientes[1].id, profissionalId: profIds[1].id, assunto: "Receita médica",       mensagem: "Preciso renovar a receita do creme que passou na última consulta.",                   status: "nao_lido" } }),
    prisma.contato.create({ data: { usuarioId: todosPacientes[2].id, profissionalId: profIds[2].id, assunto: "Vacinas do meu filho", mensagem: "Quais vacinas estão em atraso para uma criança de 3 anos?",                          status: "lido"     } }),
    prisma.contato.create({ data: { usuarioId: todosPacientes[3].id, profissionalId: profIds[4].id, assunto: "Efeitos colaterais",   mensagem: "Estou sentindo tontura com o medicamento prescrito. É normal?",                      status: "nao_lido" } }),
    prisma.contato.create({ data: { usuarioId: todosPacientes[4].id, profissionalId: profIds[3].id, assunto: "Fisioterapia",         mensagem: "Quais exercícios posso fazer em casa enquanto aguardo a consulta de retorno?",        status: "nao_lido" } }),
    prisma.contato.create({ data: { usuarioId: todosPacientes[5].id, profissionalId: profIds[5].id, assunto: "Resultado de exame",   mensagem: "Recebi os resultados dos exames solicitados. Posso enviar para análise?",             status: "lido"     } }),
  ]);

  // Extras com Faker
  await Promise.all(
    Array.from({ length: 10 }, () =>
      prisma.contato.create({
        data: {
          usuarioId:      pick(pacientesExtras).id,
          profissionalId: pick(profIds).id,
          assunto:        pick(ASSUNTOS_CONTATO),
          mensagem:       faker.lorem.sentences({ min: 1, max: 3 }),
          status:         pick(["lido", "nao_lido", "nao_lido"]),
        },
      })
    )
  );

  // ── Resumo ─────────────────────────────────────────────────────────────────
  const [tu, tp, ta, tpag, tav, tc, tcup] = await Promise.all([
    prisma.usuario.count(),
    prisma.profissional.count(),
    prisma.agendamento.count(),
    prisma.pagamento.count(),
    prisma.avaliacao.count(),
    prisma.contato.count(),
    prisma.cupom.count(),
  ]);

  logger.success("✅ Seed concluído com sucesso!");
  logger.info(`📋 Banco populado:`);
  logger.info(`   → ${tu} usuários  (1 admin + ${todosPacientes.length} pacientes + ${todosProfissionais.length} médicos)`);
  logger.info(`   → ${tp} profissionais cadastrados`);
  logger.info(`   → ${ta} agendamentos`);
  logger.info(`   → ${tpag} pagamentos`);
  logger.info(`   → ${tav} avaliações`);
  logger.info(`   → ${tc} contatos`);
  logger.info(`   → ${tcup} cupons`);
  logger.info(`\n🔑 Credenciais (senha: senha123):`);
  logger.info(`   Admin    → admin@uaimed.com`);
  logger.info(`   Paciente → joao@example.com`);
  logger.info(`   Médico   → carlos.mendes@uaimed.com`);
  process.exit(0);
}

main().catch((err) => {
  logger.error("Erro no seed", err);
  process.exit(1);
});

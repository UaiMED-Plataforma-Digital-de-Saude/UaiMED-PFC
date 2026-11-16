# Índice de Documentação — UaiMED Frontend

## Documentos Disponíveis

### 1. README.md

**Visão geral do frontend**

- Stack, estrutura de pastas, telas (43, em 5 stacks), como rodar localmente, URL da API por ambiente

📍 **Localização**: `../README.md`
🎯 **Para quem**: Todos (ponto de entrada)

---

### 2. BACKEND_SETUP_COMPLETO.md

**Setup do backend para desenvolvimento do frontend**

- Como rodar o `uaimed-back` localmente
- Exemplos de cURL para testar a API manualmente (cadastro, login, contatos, cupons, avaliações)

📍 **Localização**: `../BACKEND_SETUP_COMPLETO.md`
🎯 **Para quem**: Desenvolvedores frontend

---

### 3. IMAGES_GUIDE.md

**Guia de imagens de profissionais**

- Onde colocar as imagens
- Como referenciá-las no `FeaturedProfessionalsCarousel` e em outros componentes

📍 **Localização**: `../IMAGES_GUIDE.md`
🎯 **Para quem**: Desenvolvedores frontend

---

### 4. CONTACT_GUIDE.md

**Sistema de contatos (paciente ↔ profissional/clínica)**

- Tela `ContatoProfissionalScreen` e hook `useContatos`
- Validações e tratamento de erros
- Endpoint `POST /contatos`

📍 **Localização**: `./CONTACT_GUIDE.md`
🎯 **Para quem**: Desenvolvedores, backend engineers

---

### 5. PAYMENTS_GUIDE.md

**Sistema de pagamentos**

- Tela `PagamentoScreen` e hook `usePayments`
- Métodos de pagamento, cupons e cobertura de plano de saúde
- Endpoints `POST /pagamentos`, `POST /cupons/validar`

📍 **Localização**: `./PAYMENTS_GUIDE.md`
🎯 **Para quem**: Desenvolvedores, backend engineers

---

### 6. SISTEMA_AVALIACAO.md

**Sistema de avaliação de consultas**

- Telas `AvaliacaoScreen`, `HistoricoAvaliacoesScreen`
- Hook `useAvaliacoes` e componente `CardAvaliacao`
- Fluxo de avaliação e endpoints esperados

📍 **Localização**: `./SISTEMA_AVALIACAO.md`
🎯 **Para quem**: Desenvolvedores, QA

---

## Mapa de Leitura Recomendado

### Para entender o projeto

```
1. README.md            ← como rodar, visão geral
   ↓
2. DOCUMENTACAO_PROJETO_UAIMED.md (raiz do monorepo) ← arquitetura completa, requisitos, telas
```

### Para contribuir com uma feature específica

```
1. README.md / DOCUMENTACAO_PROJETO_UAIMED.md
   ↓
2. Guia da feature (CONTACT_GUIDE.md / PAYMENTS_GUIDE.md / SISTEMA_AVALIACAO.md)
```

---

## Buscar Informação Específica

| Pergunta | Onde buscar |
|---|---|
| Como rodar o projeto? | `../README.md` — "Como rodar localmente" |
| Qual é a estrutura de pastas e arquitetura? | `DOCUMENTACAO_PROJETO_UAIMED.md` (raiz do monorepo) |
| Como funciona o fluxo de pagamento? | `PAYMENTS_GUIDE.md` |
| Como funciona o fluxo de avaliação? | `SISTEMA_AVALIACAO.md` |
| Como funciona o contato paciente↔profissional? | `CONTACT_GUIDE.md` |
| Onde coloco imagens de profissionais? | `IMAGES_GUIDE.md` |
| Como rodar o backend para desenvolver o front? | `BACKEND_SETUP_COMPLETO.md` |

---

## Nota sobre esta revisão

Esta versão do índice remove as referências a `ESTRUTURA_PROJETO.md` e `GUIA_RAPIDO.md` — ambos apagados por estarem desatualizados (descreviam uma versão esqueleto do projeto, com telas, endpoints e pendências que não refletem mais o estado atual). A arquitetura e as telas que eles cobriam já estão documentadas, corretamente, em `../README.md` e em `DOCUMENTACAO_PROJETO_UAIMED.md` (raiz do monorepo). Revisões anteriores já haviam removido `SUMARIO_EXECUTIVO.md`, `CHECKLIST_VERIFICACAO.md` e `MELHORIAS_REALIZADAS.md` pelo mesmo motivo.

---

**Versão**: 3.0.0
**Última atualização**: 16 de Novembro de 2026

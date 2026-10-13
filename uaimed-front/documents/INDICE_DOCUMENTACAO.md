# Índice de Documentação — UaiMED Frontend

## Documentos Disponíveis

### 1. README.md

**Visão geral do frontend**

- Stack, estrutura de pastas, telas (40, em 5 stacks), como rodar localmente, URL da API por ambiente

📍 **Localização**: `../README.md`
🎯 **Para quem**: Todos (ponto de entrada)

---

### 2. ESTRUTURA_PROJETO.md

**Documentação de arquitetura**

- Estrutura de pastas
- Fluxo de autenticação
- Estrutura de dados e sistema de design
- Convenções de código

📍 **Localização**: `../ESTRUTURA_PROJETO.md`
🎯 **Para quem**: Novos desenvolvedores, arquitetos

---

### 3. GUIA_RAPIDO.md

**Guia prático de uso**

- Início rápido (instalação e execução)
- Fluxos principais e dados de teste
- Como adicionar uma nova tela
- Debugging e dúvidas comuns

📍 **Localização**: `../GUIA_RAPIDO.md`
🎯 **Para quem**: Desenvolvedores, contribuidores

---

### 4. BACKEND_SETUP_COMPLETO.md

**Setup do backend para desenvolvimento do frontend**

- Como rodar o `uaimed-back` localmente
- Exemplos de cURL para testar a API manualmente (cadastro, login, contatos, cupons, avaliações)

📍 **Localização**: `../BACKEND_SETUP_COMPLETO.md`
🎯 **Para quem**: Desenvolvedores frontend

---

### 5. IMAGES_GUIDE.md

**Guia de imagens de profissionais**

- Onde colocar as imagens
- Como referenciá-las no `FeaturedProfessionalsCarousel` e em outros componentes

📍 **Localização**: `../IMAGES_GUIDE.md`
🎯 **Para quem**: Desenvolvedores frontend

---

### 6. CONTACT_GUIDE.md

**Sistema de contatos (paciente ↔ profissional/clínica)**

- Tela `ContatoProfissionalScreen` e hook `useContatos`
- Validações e tratamento de erros
- Endpoint `POST /contatos`

📍 **Localização**: `./CONTACT_GUIDE.md`
🎯 **Para quem**: Desenvolvedores, backend engineers

---

### 7. PAYMENTS_GUIDE.md

**Sistema de pagamentos**

- Tela `PagamentoScreen` e hook `usePayments`
- Métodos de pagamento, cupons e cobertura de plano de saúde
- Endpoints `POST /pagamentos`, `POST /cupons/validar`

📍 **Localização**: `./PAYMENTS_GUIDE.md`
🎯 **Para quem**: Desenvolvedores, backend engineers

---

### 8. SISTEMA_AVALIACAO.md

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
1. GUIA_RAPIDO.md       ← como rodar
   ↓
2. ESTRUTURA_PROJETO.md ← como funciona
```

### Para contribuir com uma feature específica

```
1. ESTRUTURA_PROJETO.md
   ↓
2. Guia da feature (CONTACT_GUIDE.md / PAYMENTS_GUIDE.md / SISTEMA_AVALIACAO.md)
```

---

## Buscar Informação Específica

| Pergunta | Onde buscar |
|---|---|
| Como rodar o projeto? | `GUIA_RAPIDO.md` — "Início Rápido" |
| Qual é a estrutura de pastas? | `ESTRUTURA_PROJETO.md` |
| Como adicionar uma nova tela? | `GUIA_RAPIDO.md` — "Como Adicionar uma Nova Tela" |
| Como funciona o fluxo de pagamento? | `PAYMENTS_GUIDE.md` |
| Como funciona o fluxo de avaliação? | `SISTEMA_AVALIACAO.md` |
| Como funciona o contato paciente↔profissional? | `CONTACT_GUIDE.md` |
| Onde coloco imagens de profissionais? | `IMAGES_GUIDE.md` |
| Como rodar o backend para desenvolver o front? | `BACKEND_SETUP_COMPLETO.md` |

---

## Nota sobre esta revisão

Esta versão do índice remove as referências a `SUMARIO_EXECUTIVO.md`, `CHECKLIST_VERIFICACAO.md` e `MELHORIAS_REALIZADAS.md` — documentos de log de uma sessão de organização passada, não documentação de produto, e que estão fora do escopo final do projeto. Também corrige os caminhos (`📍 Localização`), que apontavam para `/` quando a maioria dos arquivos está em `documents/` ou na raiz do `uaimed-front`.

---

**Versão**: 2.0.0
**Última atualização**: 13 de Outubro de 2026

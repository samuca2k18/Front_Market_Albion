# 🛒 Front Market Albion — Frontend

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-purple.svg)](https://vite.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Interface web profissional para monitoramento inteligente de preços e inteligência de mercado para **Albion Online**.

> Consulte preços em tempo real, monitore itens favoritos e descubra em qual cidade está a melhor oportunidade antes de se mover pelo mapa.

---

## 📋 Índice

- [Principais Recursos](#-principais-recursos)
- [Stack Tecnológico](#️-stack-tecnológico)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Começar](#-como-começar)
- [Funcionalidades Detalhadas](#-funcionalidades-detalhadas)
- [Fluxo de Dados](#-fluxo-de-dados)
- [Design & UX](#-design--ux)
- [Exemplos de Uso](#-exemplos-de-uso)
- [Integração com Backend](#-integração-com-backend)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Boas Práticas](#-boas-práticas)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## ✨ Principais Recursos

- **🔐 Autenticação Segura**: Fluxo completo de signup, login e logout com tokens JWT
- **📊 Dashboard Inteligente**: Resumo rápido de itens monitorados, preços ativos e melhor oportunidade
- **💰 Monitoramento de Preços**: Preços em tempo real com **indicador de frescor** (🟢🟡🔴)
- **💱 Monitor de Ouro**: Preço atual, variação 24h e gráfico sparkline
- **⚖️ Calculadora de Arbitragem**: Oportunidades de trade entre cidades com cálculo de lucro e ROI
- **🚩 Monitor Bandit Event**: Countdown na Top Bar com animação pulsante quando ativo
- **🗡️ Killboard**: Feed de kills em tempo real com armas, guilds e fame
- **🔍 Busca Avançada**: Autocomplete com sugestões de itens e filtros
- **📈 Histórico de Preços**: Gráficos interativos com 7 dias de histórico
- **🌍 Suporte Multilíngue**: Português (PT-BR) e Inglês (EN-US)
- **📱 Design Responsivo**: Otimizado para desktop e mobile
- **⚡ Performance**: Construído com React 19, Vite 7 e TanStack Query

---

## 🛠️ Stack Tecnológico

| Ferramenta | Versão | Descrição |
|------------|--------|-----------|
| **React** | 19.2 | Framework UI moderno |
| **Vite** | 7.2 | Bundler e dev server rápido |
| **TypeScript** | 5.9 | Type safety em todo o código |
| **TanStack Query** | v5 | Gerenciamento de estado e cache de requisições |
| **React Router** | v7 | Roteamento client-side |
| **React Hook Form** | 7.66 | Gerenciamento eficiente de formulários |
| **Zod** | 4.1 | Validação de schemas |
| **Axios** | 1.13 | Cliente HTTP |
| **Tailwind CSS** | 3.4 | Utility-first CSS framework |
| **Recharts** | 3.5 | Visualização de dados e gráficos |
| **Lucide React** | 0.556 | Ícones SVG modernos |
| **i18next** | 25.7 | Internacionalização (i18n) |
| **Radix UI** | — | Componentes acessíveis (shadcn/ui) |

---

## 📁 Estrutura do Projeto

```
src/
├─ api/                    # Chamadas HTTP tipadas
│  ├─ albion.ts           # Endpoints de preços e histórico
│  ├─ auth.ts             # Autenticação (login, signup, me)
│  ├─ items.ts            # Gerenciamento de itens do usuário
│  ├─ client.ts           # Instância Axios configurada
│  └─ types.ts            # Tipos compartilhados
│
├─ components/            # Componentes reutilizáveis
│  ├─ common/             # Card, Loading, LanguageSwitcher
│  ├─ layout/             # Header, Footer, AppLayout
│  ├─ routing/            # ProtectedRoute, GuestRoute
│  ├─ search/             # SearchAutocomplete
│  ├─ prices/             # Tabela e filtros de preços
│  ├─ ui/                 # Button, Input, Label (shadcn/ui)
│  └─ albion/             # HistoryChart
│
├─ context/               # Context API
│  └─ AuthContext.tsx     # Estado de autenticação global
│
├─ pages/                 # Páginas (rotas)
│  ├─ LandingPage.tsx     # Página inicial
│  ├─ LoginPage.tsx       # Login
│  ├─ SignupPage.tsx      # Cadastro
│  ├─ OpportunitiesPage.tsx # Calculadora de arbitragem
│  ├─ KillboardPage.tsx   # Feed de kills em tempo real
│  ├─ dashboard/          # Dashboard com componentes
│  │  ├─ DashboardPage.tsx
│  │  ├─ components/      # QuickSummary, AddItemForm, GoldPriceCard, etc
│  │  └─ hooks/           # useDashboardItems, useDashboardPrices
│  ├─ PricesPage.tsx      # Página de preços consolidados
│  └─ NotFoundPage.tsx    # 404
│
├─ hooks/                 # Hooks customizados
│  ├─ useAuth.ts          # Autenticação
│  ├─ useLanguage.ts      # Idioma
│  ├─ useDebounce.ts      # Debounce
│  ├─ usePricesFilter.ts  # Filtros avançados
│  └─ useToggleSet.ts     # Gerenciar Sets
│
├─ i18n/                  # Internacionalização
│  └─ locales/
│     ├─ pt-BR.json       # Textos em português
│     └─ en-US.json       # Textos em inglês
│
├─ constants/             # Constantes do app
│  ├─ albion.ts          # Cidades, qualidades, tiers
│  └─ qualities.ts       # Cores e rótulos de qualidade
│
├─ styles/               # CSS global
│  ├─ global.css
│  ├─ components.css
│  ├─ layout.css
│  ├─ animations.css
│  └─ utilities.css
│
├─ utils/                # Funções utilitárias
│  ├─ items.ts           # Nome e imagem de itens
│  ├─ filters.ts         # Filtros e ordenação
│  └─ prices.ts          # Cálculos de preço
│
├─ lib/                  # Utilitários de terceiros (shadcn/ui)
└─ App.tsx               # Componente raiz com rotas
```

---

## 🚀 Como Começar

### Pré-requisitos

- **Node.js** 18+
- **npm** ou **yarn**
- Backend [Market_Albion_Online](https://github.com/samuca2k18/Market_Albion_Online) rodando

### Instalação

1. **Clone o repositório**:
```bash
git clone https://github.com/samuca2k18/Front_Market_Albion.git
cd Front_Market_Albion
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Configure as variáveis de ambiente**:
```bash
cp env.example .env.local
```

Edite `.env.local`:
```env
VITE_API_URL=https://seu-backend.com
```

> Se não configurar, usa automaticamente: `https://market-albion-online.onrender.com`

4. **Inicie o servidor de desenvolvimento**:
```bash
npm run dev
```

O app estará disponível em `http://localhost:5173`

### Build para Produção

```bash
npm run build
npm run preview
```

---

## 📖 Funcionalidades Detalhadas

### 🔐 Autenticação

- **Signup**: Criar conta com username, email e senha
- **Login**: Autenticação com JWT
- **Logout**: Limpar token e sessão
- **Persistência**: Token armazenado em localStorage
- **Sincronização**: Múltiplas abas do navegador sincronizadas
- **Rotas protegidas**: `ProtectedRoute` e `GuestRoute` para controle de acesso

### 📊 Dashboard

Seu hub central com:

- **Resumo Rápido**: Total de itens monitorados, preços ativos, melhor oportunidade
- **Adicionar Itens**: Busca inteligente com autocomplete integrado ao backend
- **Lista de Itens**: Gerenciar e remover itens monitorados
- **Tabela de Preços**: Preços em tempo real com atualização a cada 5 minutos
- **Histórico**: Gráfico interativo com últimos 7 dias de preços (Recharts)
- **Filtros por Tier**: Visualizar apenas itens específicos (T1-T8)

### 💰 Página de Preços

Consulte e analise todos os preços com filtros avançados:

- **Filtro por Item**: Buscar item específico
- **Filtro por Cidade**: Caerleon, Bridgewatch, Martlock, Lymhurst, Fort Sterling, Thetford, Brecilien
- **Filtro por Qualidade**: Normal, Bom, Excepcional, Excelente, Obra-Prima
- **Filtro por Encantamento**: @0 até @4
- **Filtro por Tier**: T1 até T8 ou sem tier
- **Busca por Texto**: Procure por nome do item
- **Ordenação**: Por preço, cidade, qualidade, encantamento ou nome

### ⚖️ Oportunidades de Arbitragem

Página dedicada (`/opportunities`) para identificar trades lucrativos:

- **Cálculo real de lucro**: Desconta taxas de mercado (8% ou 4% premium) e setup de ordem (1%)
- **Badges de qualidade**: Normal → Obra-prima com cores distintas
- **Filtro por lucro mínimo**: Defina o mínimo aceitável em silver
- **ROI**: Retorno sobre investimento em cada oportunidade

### 🗡️ Killboard

Feed de kills em tempo real (`/killboard`):

- **Killer vs Victim**: Nome, guild, aliança e Item Power
- **Ícones de armas**: Via Albion Render Service
- **Fame perdida**: Valor total do kill
- **Atualização**: A cada 30 segundos

### 🚩 Bandit Event

Indicador na Top Bar com countdown:

- **🔴 Ativo**: Animação pulsante durante o evento
- **⚡ Em breve**: Countdown amarelo quando falta < 30min
- **⚪ Esperando**: Discreto quando falta bastante

### 🌡️ Frescor de Dados

Dot colorido na tabela de preços:

- 🟢 Verde: dado fresquinho (< 1h)
- 🟡 Amarelo: morno (1-6h)
- 🔴 Vermelho: dado obsoleto (> 6h)

### 🌍 Internacionalização

- Alterne entre **Português (BR)** e **Inglês (US)** com um clique
- Preferência salva no localStorage
- Todos os textos, datas e preços adaptados ao idioma selecionado

---

## 🔄 Fluxo de Dados

```
┌─────────────────────────────────────────┐
│             Usuário                     │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────▼──────────┐
        │   Frontend (React)  │
        │   - Pages           │
        │   - Components      │
        │   - Context Auth    │
        │   - TanStack Query  │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │    API Client       │
        │    (Axios)          │
        │    - /login         │
        │    - /items         │
        │    - /albion/prices │
        │    - /albion/history│
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │   Backend FastAPI   │
        │   (Render / Local)  │
        └─────────────────────┘
```

---

## 🎨 Design & UX

- **Tema Dark**: Otimizado para longas sessões de trading
- **Glassmorphism**: Cards com efeito vidro moderno
- **Animações**: Transições suaves e feedback visual
- **Acessibilidade**: Suporte a preferência de movimento reduzido, ARIA attributes
- **Cores Significativas**:
  - 🟢 `#41f0b5` — Primário / CTAs
  - 🔵 `#22c55e` — Sucesso / Accent
  - 🔴 `#ff6b6b` — Alertas / Danger

---

## 📝 Exemplos de Uso

### Adicionar Item ao Dashboard

1. Vá para o **Dashboard**
2. Na seção "Adicionar item", busque o item desejado pelo nome
3. Selecione na autocomplete
4. O item aparece na tabela de preços em tempo real

### Encontrar o Melhor Preço

1. Vá para a página **Preços**
2. Use os filtros (cidade, qualidade, encantamento)
3. Ordene por "Preço (menor primeiro)"
4. Identifique a melhor oportunidade de compra

### Ver Histórico de Preço

1. No **Dashboard**, clique em um item na tabela de preços
2. O gráfico com 7 dias de histórico é exibido abaixo
3. Analise tendências e variações de preço

---

## 🔌 Integração com Backend

O frontend consome a API [Market_Albion_Online](https://github.com/samuca2k18/Market_Albion_Online):

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/signup` | Criar conta |
| POST | `/login` | Fazer login (form-data) |
| GET | `/me` | Dados do usuário autenticado |
| GET | `/items` | Listar itens do usuário |
| POST | `/items` | Criar item |
| DELETE | `/items/{id}` | Deletar item |
| GET | `/albion/search` | Buscar item por nome |
| GET | `/albion/prices` | Preços em batch de múltiplos itens |
| GET | `/albion/price-by-name` | Preço por nome amigável |
| GET | `/albion/my-items-prices` | Preços dos itens do usuário (com `updated_at`) |
| GET | `/albion/history/{item_id}` | Histórico de 7 dias |
| GET | `/albion/gold` | Preço do ouro e variação |
| GET | `/albion/arbitrage` | Oportunidades de arbitragem |
| GET | `/albion/bandit-event` | Status do Bandit Event |
| GET | `/albion/killboard` | Feed de kills em tempo real |

---

## 📦 Scripts Disponíveis

```bash
npm run dev       # Inicia servidor de desenvolvimento (http://localhost:5173)
npm run build     # Compila para produção (pasta dist/)
npm run preview   # Visualiza build de produção localmente
npm run lint      # Verifica código com ESLint
```

---

## 🧪 Boas Práticas

### Tipagem
- Todo o código TypeScript com `strict: true`
- Types compartilhados em `src/api/types.ts`
- Interfaces bem documentadas

### Estado
- **Autenticação**: `AuthContext` (global)
- **Requisições**: TanStack Query (cache + sincronização + retry)
- **Formulários**: React Hook Form + Zod (validação client-side)
- **UI Local**: `useState` (mínimo necessário)

### Performance
- Code splitting automático via Vite
- Lazy loading de rotas
- Debounce em buscas (`useDebounce`)
- Cache e deduplicação com TanStack Query
- Imagens otimizadas

### Acessibilidade
- Semântica HTML correta
- Contraste de cores suficiente
- Labels em todos os formulários
- ARIA attributes onde necessário

---

## 🐛 Troubleshooting

### "API_BASE_URL não configurada"
Verifique `.env.local` ou deixe em branco para usar a API pública em produção.

### "Erro ao fazer login"
1. Verifique se o backend está rodando
2. Confirme as credenciais
3. Verifique a configuração de CORS no backend

### "Preços não aparecem"
1. Confirme que o usuário tem itens cadastrados no dashboard
2. Verifique o limite de requisições da Albion Data API
3. Tente fazer logout e login novamente

### "Build falha com erro de TypeScript"
1. Verifique se as versões do Node e TypeScript são compatíveis
2. Execute `npm install` novamente
3. Limpe o cache: `rm -rf node_modules dist && npm install`

---

## 📚 Recursos Adicionais

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vite.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/)
- [i18next](https://www.i18next.com/)
- [Recharts](https://recharts.org/)
- [Zod](https://zod.dev/)

---

## 🎯 Roadmap

- [x] Dashboard com preços em tempo real
- [x] Monitor de preço do ouro com gráfico
- [x] Calculadora de arbitragem com qualidade
- [x] Killboard com feed de kills em tempo real
- [x] Monitor de Bandit Event na Top Bar
- [x] Indicador de frescor de dados
- [ ] Gráficos de tendência (últimos 30 dias)
- [ ] Exportar dados em CSV/Excel
- [ ] Heatmap de preços multi-cidade
- [ ] Modo dark/light automático (preferência do sistema)
- [ ] PWA (instalável como app no celular)
- [ ] Previsões de preço com IA

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie sua branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## ⚠️ Disclaimer

Este projeto **não é afiliado oficialmente** à Sandbox Interactive. Albion Online é marca registrada de seus respectivos proprietários. Use este projeto respeitando os termos de serviço do jogo.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para detalhes.

---

**Feito com ❤️ por [@samuca2k18](https://github.com/samuca2k18) e [@guigasdev](https://github.com/guigasdev)  para a comunidade brasileira de Albion Online.**

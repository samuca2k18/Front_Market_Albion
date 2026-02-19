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
- **💰 Monitoramento de Preços**: Preços em tempo real consolidados das principais cidades
- **🔍 Busca Avançada**: Autocomplete com sugestões de itens e filtros por cidade, qualidade e encantamento
- **📈 Histórico de Preços**: Gráficos interativos com 7 dias de histórico e variação de preço
- **🌍 Suporte Multilíngue**: Português (PT-BR) e Inglês (EN-US)
- **📱 Design Responsivo**: Otimizado para desktop e mobile
- **⚡ Performance**: Construído com React 19, Vite 7 e TanStack Query para máxima eficiência

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
│  ├─ dashboard/          # Dashboard com componentes
│  │  ├─ DashboardPage.tsx
│  │  ├─ components/      # QuickSummary, AddItemForm, etc
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
| GET | `/albion/my-items-prices` | Preços dos itens do usuário |
| GET | `/albion/history/{item_id}` | Histórico de 7 dias |
| GET | `/albion/unique-items` | Lista de itens únicos |
| GET | `/albion/cities` | Lista de cidades |

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

- [ ] Gráficos de tendência (últimos 30 dias)
- [ ] Notificações de alerta quando preço cair abaixo de X
- [ ] Exportar dados em CSV/Excel
- [ ] Comparador de preços entre cidades
- [ ] Modo dark/light automático (preferência do sistema)
- [ ] PWA (instalável como app no celular)
- [ ] Histórico de vendas do usuário
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

**Feito com ❤️ por [@samuca2k18](https://github.com/samuca2k18) e [@guigasdev]https://github.com/guigasdev  para a comunidade brasileira de Albion Online.**

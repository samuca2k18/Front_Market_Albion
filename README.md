# Front Market Albion

Interface web profissional para consumir a API do projeto [Market_Albion_Online](https://github.com/samuca2k18/Market_Albion_Online) com autenticação, dashboard completo e consultas avançadas de preços.

## ✨ Principais recursos

- Fluxo de autenticação (signup, login, logout) com armazenamento seguro do token JWT.
- Dashboard com métricas, cadastro de itens e tabela de preços consolidados das cidades monitoradas.
- Página de busca com filtros por cidade, qualidade e nível de encantamento, além de pós-filtragem por preço mínimo.
- Layout moderno, responsivo e otimizado para desktop e mobile.
- Integração automática com os endpoints `/signup`, `/login`, `/me`, `/items`, `/albion/price` e `/albion/my-items-prices`.

## 🛠️ Stack

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- TypeScript
- React Router
- React Query para cache/estado de requisições
- React Hook Form + Zod para formulários e validação
- Axios

## ⚙️ Configuração

1. Crie o arquivo `env.local` (ou configure variáveis no ambiente) baseado em `env.example`:

   ```bash
   cp env.example .env.local
   ```

   Ajuste `VITE_API_BASE_URL` para apontar para sua instância FastAPI.

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Execute em desenvolvimento:

   ```bash
   npm run dev
   ```

4. Compile para produção:

   ```bash
   npm run build
   npm run preview
   ```

## 📁 Estrutura resumida

```
src/
 ├─ api/........ chamadas HTTP tipadas
 ├─ components/. componentes de layout e UI reutilizáveis
 ├─ context/.... contexto de autenticação
 ├─ pages/...... telas (Landing, Login, Dashboard, Prices etc.)
 ├─ constants/.. filtros e listas do Albion
 └─ hooks/...... hooks customizados
```

## 🔗 Backend esperado

O frontend foi construído para trabalhar diretamente com o backend em FastAPI publicado em [`samuca2k18/Market_Albion_Online`](https://github.com/samuca2k18/Market_Albion_Online). Certifique-se de iniciar a API (`uvicorn main:app --reload`) e manter o mesmo contrato descrito no README do backend para que todas as chamadas funcionem corretamente.

---

Feito com foco na comunidade brasileira de Albion Online. Aplique seu tema preferido e contribua! 🎯

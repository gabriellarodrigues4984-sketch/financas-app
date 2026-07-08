# Modern Ledger

App financeiro pessoal (web + mobile via navegador) baseado na sua planilha: despesas, custos fixos, cartões (só para separar gastos, sem número/dados sensíveis), metas e visão mensal por categoria.

Login sem tela de senha: você entra com sua conta Google e o app já reconhece seus dados nas próximas vezes (Supabase Auth + Google OAuth).

Stack: React + TypeScript + Vite + Tailwind CSS v4 + Supabase (banco de dados + autenticação) + Netlify (hospedagem) + GitHub (código-fonte).

---

## Passo a passo para colocar no ar

Você vai precisar de 3 contas gratuitas: **GitHub**, **Supabase** e **Netlify**. Leva uns 20–30 minutos na primeira vez.

### 1. Criar o projeto no Supabase (banco de dados + login)

1. Acesse [supabase.com](https://supabase.com) → **Start your project** → crie uma conta (pode usar Google).
2. Clique em **New project**. Escolha um nome (ex: `modern-ledger`), crie uma senha de banco (guarde num lugar seguro, mas você não vai precisar usá-la no dia a dia) e escolha a região mais próxima (ex: São Paulo/`sa-east-1`).
3. Espere o projeto terminar de provisionar (1–2 min).
4. Vá em **SQL Editor** (menu lateral) → **New query**.
5. Abra o arquivo `supabase/schema.sql` deste projeto, copie **todo o conteúdo** e cole no editor.
6. Clique em **Run**. Isso cria todas as tabelas, as regras de segurança (cada usuário só vê os próprios dados) e o cadastro automático das categorias padrão para cada novo usuário.
7. Vá em **Project Settings** (ícone de engrenagem) → **API**. Anote dois valores, você vai precisar deles daqui a pouco:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public key** (uma chave longa)

### 2. Ativar login com Google

1. No Supabase, vá em **Authentication** → **Providers** → **Google** → ative o toggle.
2. Você precisa de um **Client ID** e **Client Secret** do Google. Para gerar:
   - Acesse o [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
   - Crie um projeto (ou use um existente) → **Create Credentials** → **OAuth client ID**.
   - Tipo de aplicativo: **Web application**.
   - Em **Authorized redirect URIs**, cole a URL de callback que o Supabase mostra na própria tela do provider Google (algo como `https://xxxxx.supabase.co/auth/v1/callback`).
   - Copie o **Client ID** e **Client Secret** gerados e cole nos campos correspondentes na tela do Supabase.
3. Ainda no Supabase, vá em **Authentication** → **URL Configuration** e em **Redirect URLs** adicione:
   - `http://localhost:5173` (para testar no seu computador)
   - a URL do seu site depois de publicado no Netlify (você adiciona essa no passo 5, depois de saber a URL final)
4. Clique em **Save**.

### 3. Subir o código para o GitHub

1. Crie uma conta em [github.com](https://github.com) se ainda não tiver.
2. Crie um repositório novo (botão **New**), pode ser privado. Não marque "adicionar README" (já temos um).
3. No seu computador, dentro da pasta do projeto (a que você baixou aqui), rode:
   ```bash
   git init
   git add .
   git commit -m "Modern Ledger - versão inicial"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
   git push -u origin main
   ```
   > O arquivo `.env` **não** vai subir (está no `.gitignore` de propósito) — suas chaves não ficam expostas no GitHub.

### 4. Testar localmente (opcional, mas recomendado)

1. Instale o [Node.js](https://nodejs.org) (versão 20 ou mais recente) se ainda não tiver.
2. Na pasta do projeto:
   ```bash
   npm install
   cp .env.example .env
   ```
3. Abra o `.env` criado e cole a **Project URL** e a **anon public key** que você anotou no passo 1.
4. Rode:
   ```bash
   npm run dev
   ```
5. Abra `http://localhost:5173`, clique em "Continuar com Google" e confira se seu login funciona e o dashboard aparece.

### 5. Publicar no Netlify

1. Acesse [netlify.com](https://netlify.com) → crie uma conta (dá para usar login com GitHub).
2. **Add new site** → **Import an existing project** → **Deploy with GitHub** → autorize e escolha o repositório que você criou.
3. O Netlify já detecta as configurações do `netlify.toml` (comando de build `npm run build`, pasta `dist`). Antes de clicar em deploy, adicione as variáveis de ambiente:
   - Vá em **Site settings** → **Environment variables** (ou na própria tela de configuração antes do primeiro deploy) → **Add a variable**:
     - `VITE_SUPABASE_URL` = a Project URL do Supabase
     - `VITE_SUPABASE_ANON_KEY` = a anon public key do Supabase
4. Clique em **Deploy site**. Em 1–2 minutos seu site estará no ar em uma URL tipo `https://nome-aleatorio.netlify.app`.
5. (Opcional) Em **Site settings** → **Domain management**, você pode trocar por um nome mais simples (`seunome-financas.netlify.app`) ou conectar um domínio próprio.
6. **Importante:** volte ao Supabase (**Authentication** → **URL Configuration** → **Redirect URLs**) e adicione a URL final do Netlify (ex: `https://seunome-financas.netlify.app`). Sem isso, o login com Google no site publicado vai dar erro de redirecionamento.

Pronto — o app está no ar. Qualquer atualização que você fizer no código e enviar para o GitHub (`git push`) republica o site automaticamente.

---

## Estrutura do projeto

```
src/
  components/        componentes de UI reutilizáveis (modais, cards, listas)
  context/           estado global: autenticação (AuthContext) e dados (DataContext)
  hooks/             useMonthData: busca e calcula tudo que é "por mês" (gastos, saldo, custos fixos...)
  lib/                cliente Supabase, formatação de moeda/datas, tipos, categorias padrão
  pages/              as 4 telas: Dashboard, Monthly (mensal), Cards (cartões), Goals (metas)
supabase/
  schema.sql          script único que cria todo o banco de dados e as regras de segurança
```

## Funcionalidades

- **Sem tela de login tradicional**: entra com Google, sem senha; sessão fica salva no navegador.
- **Dashboard**: saldo atual, gastos do mês, custos fixos do mês (com checkbox de pago e valor editável para contas variáveis), últimas transações, botão de nova despesa.
- **Mensal**: navegação entre meses, gráfico de gastos por categoria, débito x crédito, entradas (salário/extra), lista completa de transações com opção de excluir.
- **Cartões**: cadastro só com nome, cor e datas de fechamento/vencimento (sem número de cartão) — serve só para separar os gastos no crédito por cartão. Mostra o total gasto em cada cartão no mês.
- **Metas**: progresso por meta com barra visual, aportes rápidos, resumo do progresso total.
- **Despesas parceladas**: ao lançar no crédito com N parcelas, o app já cria os lançamentos futuros automaticamente, um por mês.

## Segurança dos dados

Cada tabela no Supabase tem Row Level Security (RLS) ativado: um usuário só consegue ler, criar, editar ou apagar os próprios registros — mesmo que alguém tente acessar a API diretamente, nunca verá dados de outra pessoa.

## Próximos passos sugeridos (não incluídos ainda)

- Editar/excluir custos fixos e cartões já cadastrados (hoje dá para arquivar cartão, mas editar nome/cor ainda não tem tela).
- Tela de "Ajustes" (perfil, exportar dados).
- Gráfico anual tipo o "Panorama Anual" da sua planilha.
- Notificações de vencimento de fatura/custo fixo.

Se quiser, posso implementar qualquer um desses depois — é só pedir.

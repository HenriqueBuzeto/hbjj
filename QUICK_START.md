# 🚀 Guia Rápido - VivaBem Next.js

## Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Executar em desenvolvimento
npm run dev

# 3. Acessar no navegador
# http://localhost:3000
```

## Estrutura de Rotas

- `/` → Redireciona para `/home`
- `/home` → Dashboard principal
- `/diary` → Diário alimentar
- `/train` → Catálogo de treinos
- `/reports` → Relatórios e gráficos
- `/signup` → Cadastro de usuário
- `/camera` → Escanear alimentos (placeholder)

## Funcionalidades Principais

### 🏠 Dashboard (Home)
- Score diário de performance
- Missões diárias
- Notícias de saúde
- Widget de clima
- Desafios da comunidade

### 📝 Diário Alimentar
- Adicionar alimentos por refeição
- Busca de alimentos
- Controle de macronutrientes
- Controle de água
- Cálculo automático de calorias

### 💪 Treinos
- Catálogo de treinos
- Filtros por categoria
- Detalhes de cada treino
- Sistema de XP por treino

### 📊 Relatórios
- Gráficos semanais (calorias, água)
- Distribuição de macronutrientes
- Estatísticas e tendências
- Acompanhamento de sono

## Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **Recharts** - Gráficos
- **Lucide React** - Ícones

## Deploy

O projeto está configurado para deploy no Vercel:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel
```

Ou conecte seu repositório GitHub diretamente no Vercel.

## Personalização

### Cores
Edite `tailwind.config.ts` para personalizar as cores do tema.

### Dados Mock
Os dados estão em `data/mockData.tsx`. Em produção, substitua por chamadas de API.

### Context
O estado global está em `context/AppContext.tsx`. Adicione mais funcionalidades conforme necessário.

## Próximos Passos

1. Conectar com backend/API
2. Implementar autenticação
3. Adicionar persistência de dados
4. Implementar funcionalidade de câmera real
5. Adicionar testes automatizados

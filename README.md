# 📝 TaskFlow

**Gerenciador de tarefas minimalista e moderno**, desenvolvido com JavaScript puro (ES6+) e CSS moderno.

![TaskFlow Preview](https://img.shields.io/badge/version-1.0.0-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![CSS3](https://img.shields.io/badge/CSS3-Modern-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Screenshot:

![Taskflow App](https://raw.githubusercontent.com/jnereu/taskflow/refs/heads/claude/taskflow-app-01Xmapat4hUdLSfpn154yvZd/taskflow.png)

## ✨ Funcionalidades

### Core Features
- ✅ **Adicionar tarefas** com título, descrição e prioridade (baixa, média, alta)
- ✅ **Marcar como concluída** com efeito visual de riscado e opacidade
- ✅ **Filtrar tarefas** por status (todas/pendentes/concluídas) e prioridade
- ✅ **Persistência local** via localStorage - as tarefas permanecem ao recarregar
- ✅ **Tema claro/escuro** alternável com toggle visível

### Diferenciais
- 🎨 **Animações suaves** ao adicionar e remover tarefas
- 🌓 **Modo escuro** com transições elegantes
- 📊 **Estatísticas em tempo real** (total, pendentes, concluídas)
- 🔔 **Contador no título** da página mostrando tarefas pendentes
- 💾 **Exportação JSON** para backup das tarefas
- 📱 **Design responsivo** para mobile, tablet e desktop
- 🎯 **Indicadores visuais** de prioridade com cores distintas
- ⌨️ **Atalhos de teclado** (ESC para fechar modal)
- 🔒 **Proteção XSS** com escape de HTML

## 🚀 Como rodar localmente

### Opção 1: Servidor HTTP simples (recomendado)

```bash
# Com Python 3
python3 -m http.server 8000

# Com Node.js (npx)
npx http-server -p 8000

# Com PHP
php -S localhost:8000
```

Depois acede a `http://localhost:8000` no navegador.

### Opção 2: Abrir diretamente

Simplesmente abre o ficheiro `index.html` no navegador (duplo clique).

## 📁 Estrutura do projeto

```
taskflow/
├── index.html          # estrutura html da aplicação
├── css/
│   └── styles.css      # estilos com variáveis css, tema claro/escuro
├── js/
│   └── app.js          # lógica da aplicação (es6+)
└── README.md           # este ficheiro
```

## 🛠️ Tecnologias utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Variáveis CSS, Flexbox, Grid, Animations
- **JavaScript ES6+** - Classes, Arrow Functions, Destructuring, Modules
- **LocalStorage API** - Persistência de dados

## 💡 Destaques técnicos

### Arquitetura
- **Separação de responsabilidades** clara (DOM, Estado, Storage)
- **Funções puras** para lógica de negócio
- **Programação funcional** onde possível
- **Event delegation** para performance otimizada

### Performance
- **Delegação de eventos** no DOM para reduzir listeners
- **Renderização eficiente** com Virtual DOM simplificado
- **Transições CSS** em vez de animações JavaScript
- **Debounce** implícito em operações críticas

### Segurança
- **Escape de HTML** para prevenir XSS
- **Validação de inputs** no formulário
- **Sanitização de dados** antes de armazenar

### UX/UI
- **Feedback visual imediato** em todas as ações
- **Estados vazios** informativos
- **Confirmação** antes de ações destrutivas
- **Acessibilidade** com ARIA labels e focus management

## 🎯 Como usar

1. **Adicionar tarefa**: Preenche o título (obrigatório), descrição (opcional) e escolhe a prioridade
2. **Concluir tarefa**: Clica no botão ✓ para marcar como concluída
3. **Eliminar tarefa**: Clica no botão 🗑 e confirma a eliminação
4. **Filtrar**: Usa os botões de filtro para ver apenas tarefas específicas
5. **Alternar tema**: Clica no botão 🌙/☀️ no canto superior direito
6. **Exportar**: Clica em "Exportar JSON" para fazer backup das tarefas

## 🚀 Ideias para expandir

### Backend
- [ ] API REST com Node.js/Express para sincronização multi-dispositivo
- [ ] Base de dados (MongoDB/PostgreSQL) para persistência robusta
- [ ] Autenticação de utilizadores (JWT)
- [ ] Sincronização em tempo real (WebSockets/Socket.io)

### Funcionalidades
- [ ] **Drag & drop** para reordenar tarefas
- [ ] **Subtarefas** aninhadas
- [ ] **Etiquetas/tags** personalizadas
- [ ] **Datas de vencimento** com notificações
- [ ] **Anexos de ficheiros** nas tarefas
- [ ] **Notas/comentários** por tarefa
- [ ] **Histórico de alterações** (audit log)
- [ ] **Pesquisa global** com filtros avançados
- [ ] **Importação JSON** para restaurar backups
- [ ] **Categorias/projetos** para organizar tarefas

### UX/UI
- [ ] **PWA** (Progressive Web App) com offline support
- [ ] **Atalhos de teclado** avançados (ex: Ctrl+K para search)
- [ ] **Temas personalizados** (múltiplas paletas de cores)
- [ ] **Modo focus** para concentração
- [ ] **Gráficos de produtividade** (charts com histórico)
- [ ] **Animações** mais elaboradas (micro-interactions)

### Integração
- [ ] **Calendário** (Google Calendar, Outlook)
- [ ] **Notificações push** (Web Push API)
- [ ] **Partilha de tarefas** via link ou email
- [ ] **Colaboração** em tempo real
- [ ] **Integração com Slack/Discord** para notificações

### DevOps
- [ ] **CI/CD** com GitHub Actions
- [ ] **Testes automatizados** (Jest, Cypress)
- [ ] **Linting** (ESLint, Prettier)
- [ ] **Bundler moderno** (Vite, esbuild)
- [ ] **TypeScript** para type safety

## 📦 Deploy gratuito

### GitHub Pages
```bash
# 1. cria repo no github
# 2. faz push do código
git init
git add .
git commit -m "feat: taskflow inicial"
git branch -M main
git remote add origin <seu-repo>
git push -u origin main

# 3. ativa github pages nas settings do repo
# 4. acede a https://<username>.github.io/<repo>
```

### Netlify
1. Arrasta a pasta do projeto para [netlify.com/drop](https://app.netlify.com/drop)
2. Ou conecta o repo GitHub para deploy automático

### Vercel
```bash
# instala vercel cli
npm i -g vercel

# faz deploy
vercel
```

## 🤝 Contribuir

Contribuições são bem-vindas! Sente-te à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Submeter pull requests

## 📄 Licença

Este projeto está sob a licença MIT. Consulta o ficheiro LICENSE para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ como projeto de demonstração de habilidades em:
- Manipulação do DOM com performance
- Estado local gerenciado sem frameworks
- Persistência de dados com localStorage
- UI/UX pensada, mesmo em projetos pequenos
- Código limpo e legível, pronto para revisão

---

**TaskFlow** - Gestão de tarefas simplificada 🚀

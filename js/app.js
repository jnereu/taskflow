// ========================================
// TASKFLOW - GESTOR DE TAREFAS
// ========================================

'use strict';

// ========================================
// ESTADO DA APLICAÇÃO
// ========================================

const AppState = {
    tasks: [],
    filters: {
        status: 'todas', // todas, pendentes, concluidas
        priority: 'todas' // todas, baixa, media, alta
    },
    searchQuery: '', // termo de pesquisa
    sortBy: 'date-desc', // ordenação padrão: mais recente primeiro
    theme: 'light', // light, dark
    taskToDelete: null
};

// ========================================
// CONSTANTES
// ========================================

const STORAGE_KEYS = {
    TASKS: 'taskflow_tasks',
    THEME: 'taskflow_theme'
};

const PRIORITY_COLORS = {
    baixa: '#48bb78',
    media: '#ed8936',
    alta: '#f56565'
};

// ========================================
// SELECTORES DO DOM
// ========================================

const DOM = {
    // formulário
    taskForm: document.getElementById('taskForm'),
    taskTitle: document.getElementById('taskTitle'),
    taskDescription: document.getElementById('taskDescription'),
    taskPriority: document.getElementById('taskPriority'),

    // pesquisa
    searchInput: document.getElementById('searchInput'),
    searchClear: document.getElementById('searchClear'),
    searchResults: document.getElementById('searchResults'),
    searchResultsCount: document.getElementById('searchResultsCount'),

    // lista de tarefas
    tasksList: document.getElementById('tasksList'),
    emptyState: document.getElementById('emptyState'),

    // estatísticas
    totalTasks: document.getElementById('totalTasks'),
    pendingTasks: document.getElementById('pendingTasks'),
    completedTasks: document.getElementById('completedTasks'),

    // filtros
    filterBtns: document.querySelectorAll('.filter-btn[data-filter]'),
    priorityBtns: document.querySelectorAll('.filter-btn[data-priority]'),
    sortSelect: document.getElementById('sortSelect'),

    // tema
    themeToggle: document.getElementById('themeToggle'),

    // exportar
    exportBtn: document.getElementById('exportBtn'),

    // modal
    confirmModal: document.getElementById('confirmModal'),
    confirmDelete: document.getElementById('confirmDelete'),
    cancelDelete: document.getElementById('cancelDelete')
};

// ========================================
// FUNÇÕES AUXILIARES (FUNÇÕES PURAS)
// ========================================

// gerar id único
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// formatar data
const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// criar objeto de tarefa
const createTask = (title, description, priority) => {
    return {
        id: generateId(),
        title: title.trim(),
        description: description.trim(),
        priority,
        completed: false,
        createdAt: Date.now()
    };
};

// escapar caracteres especiais de regex
const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// pesquisar tarefas por termo
const searchTasks = (tasks, query) => {
    if (!query.trim()) {
        return tasks;
    }

    const searchTerm = query.toLowerCase().trim();

    return tasks.filter(task => {
        const titleMatch = task.title.toLowerCase().includes(searchTerm);
        const descriptionMatch = task.description.toLowerCase().includes(searchTerm);
        return titleMatch || descriptionMatch;
    });
};

// filtrar tarefas baseado no estado atual
const filterTasks = (tasks, filters) => {
    return tasks.filter(task => {
        // filtro de estado
        const statusMatch =
            filters.status === 'todas' ||
            (filters.status === 'pendentes' && !task.completed) ||
            (filters.status === 'concluidas' && task.completed);

        // filtro de prioridade
        const priorityMatch =
            filters.priority === 'todas' ||
            task.priority === filters.priority;

        return statusMatch && priorityMatch;
    });
};

// ordenar tarefas baseado no critério selecionado
const sortTasks = (tasks, sortBy) => {
    // criar cópia para não mutar o array original
    const sorted = [...tasks];

    // mapa de prioridades para ordenação numérica
    const priorityWeight = {
        alta: 3,
        media: 2,
        baixa: 1
    };

    switch (sortBy) {
        case 'date-desc':
            // mais recente primeiro
            return sorted.sort((a, b) => b.createdAt - a.createdAt);

        case 'date-asc':
            // mais antiga primeiro
            return sorted.sort((a, b) => a.createdAt - b.createdAt);

        case 'priority-desc':
            // alta → média → baixa
            return sorted.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

        case 'priority-asc':
            // baixa → média → alta
            return sorted.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);

        case 'status-pending':
            // pendentes primeiro, depois concluídas
            return sorted.sort((a, b) => {
                if (a.completed === b.completed) return 0;
                return a.completed ? 1 : -1;
            });

        case 'status-completed':
            // concluídas primeiro, depois pendentes
            return sorted.sort((a, b) => {
                if (a.completed === b.completed) return 0;
                return a.completed ? -1 : 1;
            });

        case 'alpha-asc':
            // a → z
            return sorted.sort((a, b) => a.title.localeCompare(b.title, 'pt'));

        case 'alpha-desc':
            // z → a
            return sorted.sort((a, b) => b.title.localeCompare(a.title, 'pt'));

        default:
            return sorted;
    }
};

// calcular estatísticas
const calculateStats = (tasks) => {
    return {
        total: tasks.length,
        pending: tasks.filter(t => !t.completed).length,
        completed: tasks.filter(t => t.completed).length
    };
};

// ========================================
// PERSISTÊNCIA (LOCALSTORAGE)
// ========================================

const Storage = {
    // carregar tarefas do localStorage
    loadTasks: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.TASKS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            return [];
        }
    },

    // guardar tarefas no localStorage
    saveTasks: (tasks) => {
        try {
            localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        } catch (error) {
            console.error('Erro ao guardar tarefas:', error);
        }
    },

    // carregar tema
    loadTheme: () => {
        return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    },

    // guardar tema
    saveTheme: (theme) => {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }
};

// ========================================
// RENDERIZAÇÃO DO DOM
// ========================================

// aplicar highlight aos termos encontrados
const highlightText = (text, query) => {
    if (!query.trim()) {
        return escapeHtml(text);
    }

    const escapedQuery = escapeRegex(query.trim());
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const escapedText = escapeHtml(text);
    
    return escapedText.replace(regex, '<mark class="search-highlight">$1</mark>');
};

// renderizar uma tarefa individual
const renderTask = (task) => {
    const taskCard = document.createElement('div');
    taskCard.className = `task-card ${task.completed ? 'completed' : ''}`;
    taskCard.style.setProperty('--task-priority-color', PRIORITY_COLORS[task.priority]);
    taskCard.dataset.taskId = task.id;

    // aplicar highlight se houver termo de pesquisa
    const titleHtml = highlightText(task.title, AppState.searchQuery);
    const descriptionHtml = task.description ? highlightText(task.description, AppState.searchQuery) : '';

    taskCard.innerHTML = `
        <div class="task-header">
            <div class="task-info">
                <h3 class="task-title">${titleHtml}</h3>
                ${task.description ? `<p class="task-description">${descriptionHtml}</p>` : ''}
                <div class="task-meta">
                    <span class="task-priority ${task.priority}">
                        ${getPriorityIcon(task.priority)} ${task.priority}
                    </span>
                    <span class="task-date">${formatDate(task.createdAt)}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="task-btn complete-btn" data-action="toggle" title="${task.completed ? 'Marcar como pendente' : 'Marcar como concluída'}">
                    ${task.completed ? '↶' : '✓'}
                </button>
                <button class="task-btn delete-btn" data-action="delete" title="Eliminar tarefa">
                    🗑
                </button>
            </div>
        </div>
    `;

    return taskCard;
};

// escapar html para prevenir xss
const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// ícone de prioridade
const getPriorityIcon = (priority) => {
    const icons = {
        baixa: '▼',
        media: '●',
        alta: '▲'
    };
    return icons[priority] || '●';
};

// renderizar lista de tarefas
const renderTasksList = () => {
    // 1. pesquisar tarefas
    const searchedTasks = searchTasks(AppState.tasks, AppState.searchQuery);

    // 2. filtrar tarefas
    const filteredTasks = filterTasks(searchedTasks, AppState.filters);

    // 3. ordenar tarefas filtradas
    const sortedTasks = sortTasks(filteredTasks, AppState.sortBy);

    // limpar lista
    DOM.tasksList.innerHTML = '';

    // atualizar contador de resultados de pesquisa
    updateSearchResults(sortedTasks.length);

    // mostrar/ocultar estado vazio
    if (sortedTasks.length === 0) {
        DOM.emptyState.classList.add('show');
        
        // personalizar mensagem do estado vazio
        const emptyText = DOM.emptyState.querySelector('.empty-text');
        const emptySubtext = DOM.emptyState.querySelector('.empty-subtext');
        
        if (AppState.searchQuery.trim()) {
            emptyText.textContent = 'Nenhum resultado encontrado';
            emptySubtext.textContent = `Não foram encontradas tarefas para "${AppState.searchQuery}"`;
        } else if (AppState.tasks.length === 0) {
            emptyText.textContent = 'Nenhuma tarefa encontrada';
            emptySubtext.textContent = 'Adiciona a tua primeira tarefa acima';
        } else {
            emptyText.textContent = 'Nenhuma tarefa corresponde aos filtros';
            emptySubtext.textContent = 'Experimenta ajustar os filtros';
        }
    } else {
        DOM.emptyState.classList.remove('show');
    }

    // renderizar cada tarefa
    sortedTasks.forEach(task => {
        const taskElement = renderTask(task);
        DOM.tasksList.appendChild(taskElement);
    });

    // atualizar estatísticas
    updateStats();
    updatePageTitle();
};

// atualizar contador de resultados de pesquisa
const updateSearchResults = (count) => {
    if (AppState.searchQuery.trim()) {
        DOM.searchResults.style.display = 'block';
        DOM.searchResultsCount.textContent = count;
        
        // actualizar texto do contador (singular/plural)
        const resultText = count === 1 ? 'resultado encontrado' : 'resultados encontrados';
        DOM.searchResults.innerHTML = `<span id="searchResultsCount">${count}</span> ${resultText}`;
    } else {
        DOM.searchResults.style.display = 'none';
    }
};

// atualizar estatísticas
const updateStats = () => {
    const stats = calculateStats(AppState.tasks);
    DOM.totalTasks.textContent = stats.total;
    DOM.pendingTasks.textContent = stats.pending;
    DOM.completedTasks.textContent = stats.completed;
};

// atualizar título da página com contador
const updatePageTitle = () => {
    const pendingCount = AppState.tasks.filter(t => !t.completed).length;
    if (pendingCount > 0) {
        document.title = `(${pendingCount}) TaskFlow - Gestor de Tarefas`;
    } else {
        document.title = 'TaskFlow - Gestor de Tarefas';
    }
};

// ========================================
// GESTÃO DE TAREFAS
// ========================================

// adicionar nova tarefa
const addTask = (title, description, priority) => {
    if (!title.trim()) return;

    const newTask = createTask(title, description, priority);
    AppState.tasks.unshift(newTask); // adicionar no início
    Storage.saveTasks(AppState.tasks);
    renderTasksList();

    // limpar formulário
    DOM.taskForm.reset();
    DOM.taskTitle.focus();
};

// alternar estado de conclusão
const toggleTaskCompletion = (taskId) => {
    const taskIndex = AppState.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        AppState.tasks[taskIndex].completed = !AppState.tasks[taskIndex].completed;
        Storage.saveTasks(AppState.tasks);
        renderTasksList();
    }
};

// eliminar tarefa
const deleteTask = (taskId) => {
    const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);

    if (taskCard) {
        // adicionar animação de remoção
        taskCard.classList.add('removing');

        // aguardar animação antes de remover
        setTimeout(() => {
            AppState.tasks = AppState.tasks.filter(t => t.id !== taskId);
            Storage.saveTasks(AppState.tasks);
            renderTasksList();
        }, 250);
    }
};

// confirmar eliminação
const confirmTaskDeletion = (taskId) => {
    AppState.taskToDelete = taskId;
    DOM.confirmModal.classList.add('show');
};

// ========================================
// PESQUISA
// ========================================

// aplicar pesquisa
const applySearch = (query) => {
    AppState.searchQuery = query;
    
    // mostrar/ocultar botão de limpar
    if (query.trim()) {
        DOM.searchClear.style.display = 'flex';
    } else {
        DOM.searchClear.style.display = 'none';
    }
    
    renderTasksList();
};

// limpar pesquisa
const clearSearch = () => {
    DOM.searchInput.value = '';
    AppState.searchQuery = '';
    DOM.searchClear.style.display = 'none';
    DOM.searchResults.style.display = 'none';
    renderTasksList();
    DOM.searchInput.focus();
};

// ========================================
// FILTROS
// ========================================

// aplicar filtro de estado
const applyStatusFilter = (status) => {
    AppState.filters.status = status;

    // atualizar botões activos
    DOM.filterBtns.forEach(btn => {
        if (btn.dataset.filter === status) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    renderTasksList();
};

// aplicar filtro de prioridade
const applyPriorityFilter = (priority) => {
    AppState.filters.priority = priority;

    // atualizar botões activos
    DOM.priorityBtns.forEach(btn => {
        if (btn.dataset.priority === priority) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    renderTasksList();
};

// ========================================
// TEMA
// ========================================

// alternar tema
const toggleTheme = () => {
    AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
    applyTheme(AppState.theme);
    Storage.saveTheme(AppState.theme);
};

// aplicar tema
const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = DOM.themeToggle.querySelector('.theme-icon');
    icon.textContent = theme === 'light' ? '🌙' : '☀️';
};

// ========================================
// EXPORTAR DADOS
// ========================================

// exportar tarefas como json
const exportTasksAsJSON = () => {
    const dataStr = JSON.stringify(AppState.tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `taskflow_backup_${Date.now()}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};

// ========================================
// EVENT LISTENERS
// ========================================

const initEventListeners = () => {
    // submissão do formulário
    DOM.taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = DOM.taskTitle.value;
        const description = DOM.taskDescription.value;
        const priority = DOM.taskPriority.value;
        addTask(title, description, priority);
    });

    // pesquisa em tempo real
    DOM.searchInput.addEventListener('input', (e) => {
        applySearch(e.target.value);
    });

    // limpar pesquisa
    DOM.searchClear.addEventListener('click', clearSearch);

    // ações nas tarefas (delegação de eventos)
    DOM.tasksList.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const taskCard = btn.closest('[data-task-id]');
        const taskId = taskCard?.dataset.taskId;
        if (!taskId) return;

        const action = btn.dataset.action;
        if (action === 'toggle') {
            toggleTaskCompletion(taskId);
        } else if (action === 'delete') {
            confirmTaskDeletion(taskId);
        }
    });

    // filtros de estado
    DOM.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            applyStatusFilter(filter);
        });
    });

    // filtros de prioridade
    DOM.priorityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const priority = btn.dataset.priority;
            applyPriorityFilter(priority);
        });
    });

    // ordenação
    DOM.sortSelect.addEventListener('change', (e) => {
        AppState.sortBy = e.target.value;
        renderTasksList();
    });

    // toggle de tema
    DOM.themeToggle.addEventListener('click', toggleTheme);

    // exportar json
    DOM.exportBtn.addEventListener('click', exportTasksAsJSON);

    // modal de confirmação
    DOM.confirmDelete.addEventListener('click', () => {
        if (AppState.taskToDelete) {
            deleteTask(AppState.taskToDelete);
            AppState.taskToDelete = null;
        }
        DOM.confirmModal.classList.remove('show');
    });

    DOM.cancelDelete.addEventListener('click', () => {
        AppState.taskToDelete = null;
        DOM.confirmModal.classList.remove('show');
    });

    // fechar modal ao clicar fora
    DOM.confirmModal.addEventListener('click', (e) => {
        if (e.target === DOM.confirmModal) {
            AppState.taskToDelete = null;
            DOM.confirmModal.classList.remove('show');
        }
    });

    // atalhos de teclado
    document.addEventListener('keydown', (e) => {
        // esc para fechar modal
        if (e.key === 'Escape' && DOM.confirmModal.classList.contains('show')) {
            AppState.taskToDelete = null;
            DOM.confirmModal.classList.remove('show');
        }
        
        // esc para limpar pesquisa
        if (e.key === 'Escape' && AppState.searchQuery.trim() && document.activeElement === DOM.searchInput) {
            clearSearch();
        }
        
        // ctrl+k ou cmd+k para focar na pesquisa
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            DOM.searchInput.focus();
            DOM.searchInput.select();
        }
    });
};

// ========================================
// INICIALIZAÇÃO
// ========================================

const init = () => {
    // carregar dados do localStorage
    AppState.tasks = Storage.loadTasks();
    AppState.theme = Storage.loadTheme();

    // aplicar tema
    applyTheme(AppState.theme);

    // renderizar interface inicial
    renderTasksList();

    // inicializar event listeners
    initEventListeners();

    // focus no campo de título
    DOM.taskTitle.focus();

    console.log('✓ TaskFlow iniciado com sucesso');
};

// iniciar aplicação quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

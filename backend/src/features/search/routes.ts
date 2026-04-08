import { Router } from 'express';
import { SearchController } from './controller.js';
import { authMiddleware, requireAuth } from '../../middlewares/auth.js';

const router = Router();

/**
 * @route   GET /api/search
 * @desc    Busca avançada com múltiplos filtros
 * @access  Private
 * @query   query - texto de busca
 * @query   status - filtro por status
 * @query   priority - filtro por prioridade
 * @query   projectId - filtro por projeto
 * @query   tagIds - filtro por tags (separadas por vírgula)
 * @query   startDate - data inicial
 * @query   endDate - data final
 * @query   completed - apenas tarefas concluídas
 * @query   overdue - apenas tarefas atrasadas
 * @query   sort - campo para ordenação (date, title, priority, dueDate)
 * @query   sortOrder - ASC ou DESC
 * @query   skip - paginação
 * @query   take - itens por página
 */
router.get('/', authMiddleware, requireAuth, SearchController.search);

/**
 * @route   GET /api/search/quick
 * @desc    Busca rápida por texto (apenas título e descrição)
 * @access  Private
 * @query   q - texto de busca
 * @query   limit - número de resultados (padrão: 5)
 */
router.get('/quick', authMiddleware, requireAuth, SearchController.quickSearch);

/**
 * @route   GET /api/search/global
 * @desc    Busca global (tasks, projects, tags)
 * @access  Private
 * @query   q - texto de busca
 * @query   limit - número de resultados por tipo (padrão: 5)
 */
router.get('/global', authMiddleware, requireAuth, SearchController.globalSearch);

/**
 * @route   GET /api/search/suggestions
 * @desc    Obter sugestões de palavras-chave
 * @access  Private
 * @query   prefix - prefixo mínimo 2 caracteres
 * @query   limit - número de sugestões (padrão: 5)
 */
router.get('/suggestions', authMiddleware, requireAuth, SearchController.getSuggestions);

/**
 * @route   GET /api/search/criteria
 * @desc    Busca por múltiplos critérios predefinidos
 * @access  Private
 * @query   statuses - lista de status (separadas por vírgula)
 * @query   priorities - lista de prioridades (separadas por vírgula)
 * @query   projectIds - lista de projetos (separadas por vírgula)
 * @query   tagIds - lista de tags (separadas por vírgula)
 */
router.get('/criteria', authMiddleware, requireAuth, SearchController.searchByCriteria);

export default router;

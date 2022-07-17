import { createPage, folders } from './pages.js';

const index = createPage({
    name: 'index',
    headerTitle: 'Teste',
    pagesFolder: folders.defaultPagesFolder,
    replaces: [],
    csss: [],
    jss: ['<script type="module" src="/sockets/chat-client.js"></script>'],
});

export { index };
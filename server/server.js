// server.js
import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

// ---- validação de env obrigatórias ----
const REQUIRED_ENV = ['JWT_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI'];
REQUIRED_ENV.forEach((k) => {
    if (!process.env[k]) {
        console.error(`[ENV] Faltando ${k} (verifique server/.env)`);
        process.exit(1);
    }
});

// opcionais com default
process.env.PORT ||= '3001';
process.env.FRONTEND_URL ||= 'http://localhost:5173';

const app = express();
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;

// --- Google OAuth (forma 3 argumentos) ---
const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// --- Conexão com Banco de Dados (SQLite) ---
let db;
async function connectDB() {
    db = await open({
        filename: './database.db',
        driver: sqlite3.Database,
    });
    console.log('Conectado ao SQLite.');
    await initializeDB();
}

// --- Migração: adiciona colunas se faltarem ---
async function migrateUsersTableIfNeeded() {
    const cols = await db.all(`PRAGMA table_info(users)`);
    const colNames = new Set(cols.map((c) => c.name));

    // provider/provider_id
    if (!colNames.has('provider')) {
        await db.exec(`ALTER TABLE users ADD COLUMN provider TEXT DEFAULT 'local';`);
        console.log('[MIGRATION] Coluna "provider" adicionada em users.');
    }
    if (!colNames.has('provider_id')) {
        await db.exec(`ALTER TABLE users ADD COLUMN provider_id TEXT;`);
        console.log('[MIGRATION] Coluna "provider_id" adicionada em users.');
    }

    // normaliza provider em registros antigos
    await db.exec(`UPDATE users SET provider = COALESCE(provider, 'local') WHERE provider IS NULL;`);
}

// --- Inicialização do Banco (Criação das Tabelas) ---
async function initializeDB() {
    console.log('Inicializando tabelas...');

    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user',
      designacoes TEXT DEFAULT '[]',
      provider TEXT DEFAULT 'local',
      provider_id TEXT
    );
  `);

    await db.exec(`
    CREATE TABLE IF NOT EXISTS eventos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL,
      data_inicio TEXT NOT NULL,
      data_fim TEXT,
      horario_saida TEXT NOT NULL,
      local TEXT NOT NULL,
      endereco TEXT,
      descricao TEXT,
      status TEXT DEFAULT 'aberto',
      quantidade_onibus INTEGER NOT NULL,
      capacidade_por_onibus INTEGER NOT NULL
    );
  `);

    await db.exec(`PRAGMA foreign_keys = ON;`);
    await db.exec(`
    CREATE TABLE IF NOT EXISTS agendamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evento_id INTEGER NOT NULL,
      numero_cartao TEXT NOT NULL,
      tipo_viagem TEXT NOT NULL DEFAULT 'ida_volta',
      responsavel TEXT NOT NULL,
      passageiros TEXT NOT NULL,
      assentos TEXT NOT NULL,
      status TEXT DEFAULT 'confirmado',
      observacoes TEXT,
      created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(evento_id) REFERENCES eventos(id) ON DELETE CASCADE
    );
  `);

    // roda migração para bancos antigos (sem provider/provider_id)
    await migrateUsersTableIfNeeded();

    // Usuário admin padrão
    const admin = await db.get('SELECT * FROM users WHERE email = ?', 'admin@admin.com');
    if (!admin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        await db.run(
            'INSERT INTO users (full_name, email, password, role, designacoes, provider) VALUES (?, ?, ?, ?, ?, ?)',
            'Administrador',
            'admin@admin.com',
            hashedPassword,
            'admin',
            '["gestor_eventos","visualizador_eventos","operador_mapeamento"]',
            'local'
        );
        console.log('Admin criado: admin@admin.com / admin123');
    }
}

// --- Middlewares ---
const ALLOWED_ORIGINS = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://ourassistent.pydentech.com'
    // adicione outros domínios se necessário
];

app.use(cors({
    origin(origin, cb) {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
        return cb(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());

// --- Helpers ---
function signToken(user) {
    const payload = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

function setAuthCookie(res, token) {
    res.cookie('access_token', token, {
        httpOnly: true,
        secure: false, // true em produção com HTTPS
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000, // 8h
    });
}

// --- Middleware de Autenticação (Header ou Cookie) ---
function authenticateToken(req, res, next) {
    let token;
    const authHeader = req.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) token = authHeader.split(' ')[1];
    else if (req.cookies?.access_token) token = req.cookies.access_token;

    if (!token) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// =================== ROTAS DE AUTENTICAÇÃO ===================

// Login (local)
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE email = ? AND provider = ?', email, 'local');
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    if (!user.password) return res.status(400).json({ message: 'Sua conta é social. Entre com Google.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Senha inválida' });

    const token = signToken(user);
    setAuthCookie(res, token);
    const userPayload = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        designacoes: JSON.parse(user.designacoes || '[]'),
    };
    res.json({ token, user: userPayload });
});

// Registrar (local) — aceita full_name OU name
app.post('/api/auth/register', async (req, res) => {
    const full_name = req.body.full_name || req.body.name; // <-- compatível com o front
    const { email, password } = req.body;
    if (!full_name || !email || !password) return res.status(400).json({ message: 'Dados incompletos' });

    const existing = await db.get('SELECT id FROM users WHERE email = ?', email);
    if (existing) return res.status(400).json({ message: 'Email já cadastrado' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.run(
        'INSERT INTO users (full_name, email, password, role, designacoes, provider) VALUES (?, ?, ?, ?, ?, ?)',
        full_name,
        email,
        hashedPassword,
        'user',
        '[]',
        'local'
    );
    const user = await db.get('SELECT * FROM users WHERE id = ?', result.lastID);
    const token = signToken(user);
    setAuthCookie(res, token);
    res.status(201).json({ id: result.lastID, token });
});

// Perfil atual
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    const user = await db.get('SELECT id, full_name, email, role, designacoes FROM users WHERE id = ?', req.user.id);
    if (!user) return res.sendStatus(404);
    user.designacoes = JSON.parse(user.designacoes || '[]');
    res.json(user);
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('access_token', { httpOnly: true, sameSite: 'lax' });
    res.status(200).json({ message: 'Logout efetuado' });
});

// ---------- Google OAuth ----------
app.get('/auth/google', (req, res) => {
    try {
        const url = googleClient.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: ['openid', 'email', 'profile'],
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            client_id: process.env.GOOGLE_CLIENT_ID, // redundante, útil p/ debug
        });
        console.log('[AUTH] URL gerada contém client_id? ', url.includes('client_id='));
        console.log('[AUTH] URL gerada:', url);
        res.redirect(url);
    } catch (e) {
        console.error(e);
        res.status(500).send('Falha ao iniciar OAuth');
    }
});

app.get('/auth/google/callback', async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) return res.status(400).send('Código ausente');

        const { tokens } = await googleClient.getToken({
            code,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        });
        await googleClient.setCredentials(tokens);

        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        const email = payload.email;
        const full_name = payload.name || email;
        const provider_id = payload.sub;

        let user = await db.get('SELECT * FROM users WHERE provider = ? AND provider_id = ?', 'google', provider_id);
        if (!user) {
            const existingByEmail = await db.get('SELECT * FROM users WHERE email = ?', email);
            if (existingByEmail) {
                await db.run('UPDATE users SET provider = ?, provider_id = ? WHERE id = ?', 'google', provider_id, existingByEmail.id);
                user = await db.get('SELECT * FROM users WHERE id = ?', existingByEmail.id);
            } else {
                // password = '' para compatibilidade com bancos antigos que tenham NOT NULL
                const result = await db.run(
                    'INSERT INTO users (full_name, email, password, role, designacoes, provider, provider_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    full_name,
                    email,
                    '',
                    'user',
                    '[]',
                    'google',
                    provider_id
                );
                user = await db.get('SELECT * FROM users WHERE id = ?', result.lastID);
            }
        }

        const token = signToken(user);
        setAuthCookie(res, token);
        return res.redirect(`${FRONTEND_URL}/dashboard`);
    } catch (e) {
        console.error('OAuth callback error:', e);
        res.status(500).send('Erro no callback do Google');
    }
});

// =================== ROTAS DE API (CRUDs) ===================

// Usuários
app.get('/api/users', authenticateToken, async (req, res) => {
    const users = await db.all('SELECT id, full_name, email, role, designacoes, provider FROM users');
    const out = users.map((u) => ({ ...u, designacoes: JSON.parse(u.designacoes || '[]') }));
    res.json(out);
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
    const { designacoes } = req.body;
    await db.run('UPDATE users SET designacoes = ? WHERE id = ?', JSON.stringify(designacoes || []), req.params.id);
    res.status(200).json({ message: 'Usuário atualizado' });
});

// Eventos
app.get('/api/eventos', async (req, res) => {
    const { status } = req.query;
    const eventos = status
        ? await db.all('SELECT * FROM eventos WHERE status = ? ORDER BY data_inicio DESC', status)
        : await db.all('SELECT * FROM eventos ORDER BY data_inicio DESC');
    res.json(eventos);
});

app.post('/api/eventos', authenticateToken, async (req, res) => {
    const { nome, tipo, data_inicio, data_fim, horario_saida, local, endereco, descricao, status, quantidade_onibus, capacidade_por_onibus } = req.body;
    const result = await db.run(
        'INSERT INTO eventos (nome, tipo, data_inicio, data_fim, horario_saida, local, endereco, descricao, status, quantidade_onibus, capacidade_por_onibus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        nome,
        tipo,
        data_inicio,
        data_fim,
        horario_saida,
        local,
        endereco,
        descricao,
        status,
        quantidade_onibus,
        capacidade_por_onibus
    );
    res.status(201).json({ id: result.lastID, ...req.body });
});

app.put('/api/eventos/:id', authenticateToken, async (req, res) => {
    const { nome, tipo, data_inicio, data_fim, horario_saida, local, endereco, descricao, status, quantidade_onibus, capacidade_por_onibus } = req.body;
    await db.run(
        'UPDATE eventos SET nome = ?, tipo = ?, data_inicio = ?, data_fim = ?, horario_saida = ?, local = ?, endereco = ?, descricao = ?, status = ?, quantidade_onibus = ?, capacidade_por_onibus = ? WHERE id = ?',
        nome,
        tipo,
        data_inicio,
        data_fim,
        horario_saida,
        local,
        endereco,
        descricao,
        status,
        quantidade_onibus,
        capacidade_por_onibus,
        req.params.id
    );
    res.status(200).json({ message: 'Evento atualizado' });
});

app.delete('/api/eventos/:id', authenticateToken, async (req, res) => {
    await db.run('DELETE FROM eventos WHERE id = ?', req.params.id);
    res.status(204).send();
});

// Agendamentos
app.get('/api/agendamentos', async (req, res) => {
    const rows = await db.all('SELECT * FROM agendamentos ORDER BY created_date DESC');
    const out = rows.map((a) => ({
        ...a,
        responsavel: JSON.parse(a.responsavel || '{}'),
        passageiros: JSON.parse(a.passageiros || '[]'),
        assentos: JSON.parse(a.assentos || '[]'),
    }));
    res.json(out);
});

app.post('/api/agendamentos', async (req, res) => {
    const { evento_id, numero_cartao, tipo_viagem, responsavel, passageiros, assentos, status, observacoes } = req.body;
    const result = await db.run(
        'INSERT INTO agendamentos (evento_id, numero_cartao, tipo_viagem, responsavel, passageiros, assentos, status, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        evento_id,
        numero_cartao,
        tipo_viagem,
        JSON.stringify(responsavel || {}),
        JSON.stringify(passageiros || []),
        JSON.stringify(assentos || []),
        status,
        observacoes
    );
    const novo = await db.get('SELECT * FROM agendamentos WHERE id = ?', result.lastID);
    res.status(201).json({
        ...novo,
        responsavel: JSON.parse(novo.responsavel || '{}'),
        passageiros: JSON.parse(novo.passageiros || '[]'),
        assentos: JSON.parse(novo.assentos || '[]'),
    });
});

app.put('/api/agendamentos/:id', authenticateToken, async (req, res) => {
    const { tipo_viagem, responsavel, passageiros, assentos, status, observacoes } = req.body;
    await db.run(
        'UPDATE agendamentos SET tipo_viagem = ?, responsavel = ?, passageiros = ?, assentos = ?, status = ?, observacoes = ? WHERE id = ?',
        tipo_viagem,
        JSON.stringify(responsavel || {}),
        JSON.stringify(passageiros || []),
        JSON.stringify(assentos || []),
        status,
        observacoes,
        req.params.id
    );
    res.status(200).json({ message: 'Agendamento atualizado' });
});

app.delete('/api/agendamentos/:id', authenticateToken, async (req, res) => {
    await db.run('DELETE FROM agendamentos WHERE id = ?', req.params.id);
    res.status(204).send();
});

// --- Iniciar o Servidor ---
connectDB()
    .then(() => {
        console.log('[ENV] FRONTEND_URL =', FRONTEND_URL);
        console.log('[ENV] GOOGLE_CLIENT_ID length =', String(process.env.GOOGLE_CLIENT_ID || '').length);
        console.log('[ENV] GOOGLE_REDIRECT_URI =', process.env.GOOGLE_REDIRECT_URI);
        app.listen(PORT, () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Erro ao iniciar o servidor:', err);
        process.exit(1);
    });

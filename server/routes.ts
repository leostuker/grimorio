import { Router, Request, Response } from 'express';
import multer from 'multer';
import {
  getMetadata,
  getDbStatus,
  listMagias,
  getMagiaById,
  createMagia,
  updateMagia,
  deleteMagia,
  createConjurador,
  createLivro,
} from './db.js';
import { processCSVImport, generateCSVExport } from './csv.js';
import { FiltrosMagia, MagiaPayload } from '../src/types.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
export const router = Router();

const SECURITY_PIN = process.env.SECURITY_PIN || '1998';

// Middleware de verificação de trava de segurança (PIN 1998)
function verifyPin(req: Request, res: Response, next: Function) {
  const pinHeader = req.headers['x-security-pin'];
  const pinBody = req.body?.pin;
  const pinQuery = req.query?.pin;
  const pin = (pinHeader || pinBody || pinQuery || '') as string;

  if (String(pin).trim() !== String(SECURITY_PIN).trim()) {
    return res.status(403).json({
      error: 'Trava de segurança ativada. A senha de segurança (1998) é obrigatória para esta operação.',
      code: 'INVALID_PIN',
    });
  }
  next();
}

// 1. Status do Banco
router.get('/status', (req, res) => {
  res.json(getDbStatus());
});

// 2. Metadata Dinâmica (Conjuradores, Livros, Enums)
router.get('/metadata', async (req, res) => {
  try {
    const meta = await getMetadata();
    res.json(meta);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erro ao carregar metadados' });
  }
});

// 3. Listar e Filtrar Magias
router.get('/magias', async (req, res) => {
  try {
    const {
      busca,
      circulos,
      escolas,
      conjuradores_ids,
      tipos_dano,
      livros_ids,
      concentracao,
      salvaguarda,
      atributo_salvaguarda,
      ataque,
      componente_verbal,
      componente_somatico,
      componente_material,
      consumo_material,
      forma,
      tem_dano,
      sort_by,
      sort_order,
    } = req.query;

    const parseArrayNumber = (val: any): number[] | undefined => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val.map(Number).filter(n => !isNaN(n));
      return String(val).split(',').map(Number).filter(n => !isNaN(n));
    };

    const parseArrayString = (val: any): any[] | undefined => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val;
      return String(val).split(',').map(s => s.trim()).filter(Boolean);
    };

    const parseBool = (val: any): boolean | 'todos' | undefined => {
      if (val === undefined || val === null || val === 'todos' || val === '') return undefined;
      return val === 'true' || val === true || val === '1';
    };

    const filtros: FiltrosMagia = {
      busca: busca ? String(busca) : undefined,
      circulos: parseArrayNumber(circulos),
      escolas: parseArrayString(escolas) as any,
      conjuradores_ids: parseArrayNumber(conjuradores_ids),
      tipos_dano: parseArrayString(tipos_dano) as any,
      livros_ids: parseArrayNumber(livros_ids),
      concentracao: parseBool(concentracao),
      salvaguarda: parseBool(salvaguarda),
      atributo_salvaguarda: atributo_salvaguarda && atributo_salvaguarda !== 'todos' ? (String(atributo_salvaguarda) as any) : undefined,
      ataque: parseBool(ataque),
      componente_verbal: parseBool(componente_verbal),
      componente_somatico: parseBool(componente_somatico),
      componente_material: parseBool(componente_material),
      consumo_material: parseBool(consumo_material),
      forma: forma && forma !== 'todos' ? (String(forma) as any) : undefined,
      tem_dano: parseBool(tem_dano),
      sort_by: sort_by ? (String(sort_by) as any) : 'nome_magia',
      sort_order: sort_order === 'desc' ? 'desc' : 'asc',
    };

    const magias = await listMagias(filtros);
    res.json(magias);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erro ao consultar magias' });
  }
});

// 4. Exportar CSV
router.get('/magias/export-csv', async (req, res) => {
  try {
    const magias = await listMagias({});
    const csvData = generateCSVExport(magias);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="grimorio_magias.csv"');
    res.send(csvData);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erro ao exportar CSV' });
  }
});

// 5. Obter Magia por ID
router.get('/magias/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
    const magia = await getMagiaById(id);
    if (!magia) return res.status(404).json({ error: 'Magia não encontrada' });
    res.json(magia);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erro ao obter magia' });
  }
});

// 6. Verificar PIN
router.post('/verify-pin', (req, res) => {
  const { pin } = req.body;
  if (String(pin).trim() === String(SECURITY_PIN).trim()) {
    return res.json({ valid: true, message: 'Senha autenticada com sucesso' });
  }
  return res.status(401).json({ valid: false, error: 'Senha incorreta' });
});

// 7. Criar Magia (Protegido por PIN)
router.post('/magias', verifyPin, async (req, res) => {
  try {
    const payload: MagiaPayload = req.body;
    const nova = await createMagia(payload);
    res.status(201).json(nova);
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Erro ao criar magia' });
  }
});

// 8. Atualizar Magia (Protegido por PIN)
router.put('/magias/:id', verifyPin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
    const payload: MagiaPayload = req.body;
    const atualizada = await updateMagia(id, payload);
    res.json(atualizada);
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Erro ao atualizar magia' });
  }
});

// 9. Apagar Magia (Protegido por PIN)
router.delete('/magias/:id', verifyPin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
    const removida = await deleteMagia(id);
    if (!removida) return res.status(404).json({ error: 'Magia não encontrada' });
    res.json({ success: true, message: `Magia #${id} removida com sucesso` });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erro ao remover magia' });
  }
});

// 10. Importação em Massa CSV (Protegido por PIN)
router.post('/magias/import-csv', upload.single('arquivo'), async (req, res) => {
  try {
    const pin = (req.headers['x-security-pin'] || req.body.pin || '') as string;
    let csvContent = '';

    if (req.file) {
      csvContent = req.file.buffer.toString('utf-8');
    } else if (req.body.csvText) {
      csvContent = req.body.csvText;
    } else {
      return res.status(400).json({ error: 'Nenhum arquivo ou texto CSV enviado.' });
    }

    const resultado = await processCSVImport(csvContent, pin, SECURITY_PIN);
    res.json(resultado);
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Erro ao processar importação CSV' });
  }
});

// 11. Criar Livro (Protegido por PIN)
router.post('/livros', verifyPin, async (req, res) => {
  try {
    const { nome_livro } = req.body;
    const novo = await createLivro(nome_livro);
    res.status(201).json(novo);
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Erro ao criar livro' });
  }
});

// 12. Criar Conjurador / Classe (Protegido por PIN)
router.post('/conjuradores', verifyPin, async (req, res) => {
  try {
    const { classe } = req.body;
    const novo = await createConjurador(classe);
    res.status(201).json(novo);
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Erro ao cadastrar classe de conjurador' });
  }
});

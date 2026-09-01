import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Key,
  Globe,
  Terminal,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Info,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { StatusConexao, ResultadoTesteConexao } from '../types';
import { testDatabaseConnectionAPI, reconnectDatabaseAPI } from '../services/api';

interface DbConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: StatusConexao | null;
  onRefreshStatus: () => Promise<void>;
}

export const DbConnectionModal: React.FC<DbConnectionModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefreshStatus,
}) => {
  const [host, setHost] = useState(status?.host || '192.168.0.153');
  const [port, setPort] = useState(String(status?.porta || '6532'));
  const [user, setUser] = useState(status?.usuario || 'leo');
  const [password, setPassword] = useState('');
  const [database, setDatabase] = useState(status?.banco || 'postgres');
  const [showPassword, setShowPassword] = useState(false);

  const [testing, setTesting] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [testResult, setTestResult] = useState<ResultadoTesteConexao | null>(null);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedPsql, setCopiedPsql] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'config' | 'troubleshoot'>('status');

  useEffect(() => {
    if (status) {
      setHost(status.host);
      setPort(String(status.porta));
      setUser(status.usuario);
      setDatabase(status.banco);
    }
  }, [status]);

  if (!isOpen) return null;

  const isPostgres = status?.modo === 'postgres';

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testDatabaseConnectionAPI({
        host,
        port: parseInt(port, 10),
        user,
        password,
        database,
      });
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        sucesso: false,
        mensagem: err?.message || 'Falha ao testar conexão',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleApplyAndReconnect = async () => {
    setReconnecting(true);
    try {
      await reconnectDatabaseAPI({
        host,
        port: parseInt(port, 10),
        user,
        password,
        database,
      });
      await onRefreshStatus();
      setTestResult({
        sucesso: true,
        mensagem: 'Configurações aplicadas com sucesso!',
      });
    } catch (err: any) {
      setTestResult({
        sucesso: false,
        mensagem: err?.message || 'Falha ao aplicar novas configurações',
      });
    } finally {
      setReconnecting(false);
    }
  };

  const envContent = `# Configurações de Conexão com o PostgreSQL 16
DB_HOST="${host}"
DB_PORT="${port}"
DB_USER="${user}"
DB_PASSWORD="${password}"
DB_NAME="${database}"

# Trava de Segurança Administrativa
SECURITY_PIN="1998"
PORT="3000"`;

  const psqlCommand = `psql -h ${host} -p ${port} -U ${user} -d ${database}`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envContent);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const copyPsql = () => {
    navigator.clipboard.writeText(psqlCommand);
    setCopiedPsql(true);
    setTimeout(() => setCopiedPsql(false), 2000);
  };

  const setPreset = (presetHost: string, presetPort: string, presetUser: string) => {
    setHost(presetHost);
    setPort(presetPort);
    setUser(presetUser);
  };

  return (
    <div id="modal-db-connection" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isPostgres ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Conexão com Banco de Dados PostgreSQL 16
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                  isPostgres
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-600/40'
                    : 'bg-amber-950/80 text-amber-300 border-amber-600/40'
                }`}>
                  {isPostgres ? 'Conectado ao PostgreSQL' : 'Modo Fallback em Memória'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Gerencie credenciais, teste conectividade e veja o diagnóstico de erros em tempo real
              </p>
            </div>
          </div>
          <button
            id="btn-close-db-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-900/50 gap-2">
          <button
            id="tab-db-status"
            onClick={() => setActiveTab('status')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'status'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Diagnóstico & Status Atual</span>
          </button>
          <button
            id="tab-db-config"
            onClick={() => setActiveTab('config')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Testar & Reconectar</span>
          </button>
          <button
            id="tab-db-troubleshoot"
            onClick={() => setActiveTab('troubleshoot')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'troubleshoot'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Guia de Resolução de Problemas</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          
          {/* TAB 1: STATUS ATUAL */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              
              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                isPostgres
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                  : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
              }`}>
                {isPostgres ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-100 text-sm">
                    {isPostgres ? 'PostgreSQL Conectado e Operacional' : 'PostgreSQL Desconectado — Modo Fallback Ativo'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {status?.mensagem || 'Avaliando conexão com o banco de dados...'}
                  </p>
                </div>
              </div>

              {/* Erro Detalhado se houver */}
              {!isPostgres && status?.ultimoErro && (
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Detalhes do Erro de Conexão</span>
                    {status.codigoErro && (
                      <span className="bg-rose-900/60 border border-rose-700/50 px-2 py-0.5 rounded text-[11px] font-mono text-rose-200">
                        Código: {status.codigoErro}
                      </span>
                    )}
                  </div>
                  <pre className="p-2.5 bg-slate-950 rounded-lg text-xs font-mono text-rose-300 whitespace-pre-wrap break-all border border-rose-900/30">
                    {status.ultimoErro}
                    {status.detalhesErro ? `\nDetalhe: ${status.detalhesErro}` : ''}
                  </pre>
                  {status.dicaSolucao && (
                    <div className="flex items-start gap-2 pt-1 text-xs text-amber-300/90">
                      <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>Como resolver:</strong> {status.dicaSolucao}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Configurações Ativas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block font-medium">Host Ativo</span>
                  <span className="font-mono text-xs font-bold text-slate-200">{status?.host || '192.168.0.153'}</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block font-medium">Porta</span>
                  <span className="font-mono text-xs font-bold text-slate-200">{status?.porta || '6532'}</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block font-medium">Usuário</span>
                  <span className="font-mono text-xs font-bold text-slate-200">{status?.usuario || 'leo'}</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block font-medium">Banco</span>
                  <span className="font-mono text-xs font-bold text-slate-200">{status?.banco || 'postgres'}</span>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="flex items-center justify-between pt-2">
                <button
                  id="btn-refresh-status"
                  onClick={onRefreshStatus}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2 transition-colors border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Verificar Novamente</span>
                </button>
                <button
                  id="btn-goto-config"
                  onClick={() => setActiveTab('config')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                >
                  <Server className="w-3.5 h-3.5" />
                  <span>Alterar Credenciais / Testar</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: CONFIGURAÇÃO & TESTE */}
          {activeTab === 'config' && (
            <div className="space-y-5">
              
              {/* Presets Rápidos */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Atalhos Rápidos de Conexão:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPreset('192.168.0.153', '6532', 'leo')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 font-mono transition-colors"
                  >
                    192.168.0.153:6532 (leo)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('localhost', '6532', 'leo')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 font-mono transition-colors"
                  >
                    localhost:6532 (leo)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('localhost', '5432', 'postgres')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 font-mono transition-colors"
                  >
                    localhost:5432 (postgres)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset('127.0.0.1', '6532', 'leo')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 font-mono transition-colors"
                  >
                    127.0.0.1:6532 (leo)
                  </button>
                </div>
              </div>

              {/* Form de Conexão */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Host (IP ou Domínio)
                  </label>
                  <input
                    id="input-db-host"
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="192.168.0.153 ou localhost"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Porta do PostgreSQL
                  </label>
                  <input
                    id="input-db-port"
                    type="text"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="6532 ou 5432"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Usuário do PostgreSQL
                  </label>
                  <input
                    id="input-db-user"
                    type="text"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    placeholder="leo ou postgres"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nome do Banco de Dados
                  </label>
                  <input
                    id="input-db-name"
                    type="text"
                    value={database}
                    onChange={(e) => setDatabase(e.target.value)}
                    placeholder="postgres ou grimorio"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Senha do Usuário
                  </label>
                  <div className="relative">
                    <input
                      id="input-db-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Deixe em branco se não houver senha ou digite sua senha"
                      className="w-full pl-3 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Por segurança, a senha é utilizada apenas na conexão e nunca salva em texto aberto.
                  </span>
                </div>
              </div>

              {/* Resultado do Teste */}
              {testResult && (
                <div className={`p-4 rounded-xl border space-y-1.5 animate-in fade-in ${
                  testResult.sucesso
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-xs">
                    {testResult.sucesso ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>{testResult.sucesso ? 'Sucesso no Teste de Conexão!' : 'Falha no Teste de Conexão'}</span>
                    {testResult.codigo && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800">
                        {testResult.codigo}
                      </span>
                    )}
                  </div>
                  <p className="text-xs">{testResult.mensagem}</p>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  id="btn-test-db-connection"
                  type="button"
                  disabled={testing || reconnecting}
                  onClick={handleTestConnection}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-700 disabled:opacity-50"
                >
                  <Zap className={`w-3.5 h-3.5 text-amber-400 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Testando Conexão...' : 'Testar Conexão'}</span>
                </button>

                <button
                  id="btn-apply-db-reconnect"
                  type="button"
                  disabled={testing || reconnecting}
                  onClick={handleApplyAndReconnect}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${reconnecting ? 'animate-spin' : ''}`} />
                  <span>{reconnecting ? 'Reconectando Servidor...' : 'Salvar & Conectar Agora'}</span>
                </button>
              </div>

              {/* Bloco .env */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Copiar para o arquivo .env local:
                  </span>
                  <button
                    onClick={copyEnv}
                    className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEnv ? 'Copiado!' : 'Copiar .env'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl text-xs font-mono text-amber-300 border border-slate-800 overflow-x-auto">
                  {envContent}
                </pre>
              </div>

            </div>
          )}

          {/* TAB 3: TROUBLESHOOTING GUIDE */}
          {activeTab === 'troubleshoot' && (
            <div className="space-y-5 text-xs text-slate-300 leading-relaxed">
              
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-100 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  1. Teste de Conectividade via Linha de Comando (psql)
                </h4>
                <p>
                  Abra o terminal do seu computador (PowerShell, bash, zsh) e execute o comando abaixo para verificar se o PostgreSQL aceita conexões:
                </p>
                <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <code className="font-mono text-amber-300 text-xs">{psqlCommand}</code>
                  <button
                    onClick={copyPsql}
                    className="p-1 text-slate-400 hover:text-amber-400"
                    title="Copiar comando"
                  >
                    {copiedPsql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-100 flex items-center gap-2">
                  <Server className="w-4 h-4 text-amber-400" />
                  2. Checklist de Configuração do PostgreSQL
                </h4>
                
                <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800 space-y-1.5">
                  <strong className="text-slate-100 block font-semibold">A. Liberar IP no <code>postgresql.conf</code>:</strong>
                  <p>
                    Verifique se o parâmetro <code className="text-amber-300 font-mono">listen_addresses</code> está configurado para aceitar todas as conexões:
                  </p>
                  <pre className="p-2 bg-slate-900 rounded font-mono text-slate-200 text-[11px]">
                    listen_addresses = '*'
                  </pre>
                </div>

                <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800 space-y-1.5">
                  <strong className="text-slate-100 block font-semibold">B. Autenticação no <code>pg_hba.conf</code>:</strong>
                  <p>
                    Permita conexões da sua rede local (ou de qualquer IP se estiver em ambiente seguro/Docker):
                  </p>
                  <pre className="p-2 bg-slate-900 rounded font-mono text-slate-200 text-[11px]">
                    host    all             all             0.0.0.0/0               scram-sha-256
                  </pre>
                  <p className="text-[11px] text-slate-400">
                    Após alterar, recarregue o PostgreSQL com <code>SELECT pg_reload_conf();</code> ou reinicie o serviço.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800 space-y-1.5">
                  <strong className="text-slate-100 block font-semibold">C. Host Local vs Nuvem:</strong>
                  <p>
                    - Se você baixou o projeto e está rodando localmente via <code className="text-amber-300">npm run dev</code> no seu computador onde o PostgreSQL está instalado, utilize <code className="text-amber-300">DB_HOST="localhost"</code> ou <code className="text-amber-300">"127.0.0.1"</code>.<br />
                    - Se o PostgreSQL estiver em outra máquina da rede local (ex: servidor doméstico), use o IP correspondente (ex: <code className="text-amber-300">192.168.0.153</code>).<br />
                    - Se o PostgreSQL estiver em um container Docker, certifique-se de que a porta <code className="text-amber-300">6532:5432</code> ou <code className="text-amber-300">6532:6532</code> foi mapeada.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            PostgreSQL 16 Engine com Schema D&D 5e Relacional
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};

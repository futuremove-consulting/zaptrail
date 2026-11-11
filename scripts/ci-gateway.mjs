#!/usr/bin/env node
/**
 * CI Gateway — Chave inteligente full/standby para GitHub Actions no ZapTrail.
 * Alinhado com o padrão de custo-zero e contingência de billing do PilotCRM.
 *
 * Modos de operação:
 *   - `full` (default): Todos os jobs rodam normalmente no push/PR.
 *   - `standby`: Todos os jobs são pulados (conclui como `skipped` com 0 minutos gastos).
 *
 * Uso:
 *   node scripts/ci-gateway.mjs --check     # Diagnostica modo atual e últimos runs
 *   node scripts/ci-gateway.mjs --standby   # Ativa modo standby (economia de cota)
 *   node scripts/ci-gateway.mjs --full      # Ativa modo full (execução ativa)
 *   node scripts/ci-gateway.mjs --auto      # Detecta bloqueio de billing e alterna
 */
import { execFileSync } from 'node:child_process';

const OWNER = 'futuremove-consulting';
const REPO = 'zaptrail';
const WORKFLOW = 'CI/CD';
const VAR_NAME = 'CI_MODE';
const FAIL_WINDOW = 3;
const QUICK_FAIL_SECONDS = 60;

function gh(args, { json = true, throwOnError = false } = {}) {
  try {
    const out = execFileSync('gh', ['api', ...args], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return json ? JSON.parse(out || 'null') : out;
  } catch (err) {
    if (throwOnError) throw err;
    if (json) return null;
    throw err;
  }
}

export function getVar() {
  try {
    const v = gh([`repos/${OWNER}/${REPO}/actions/variables/${VAR_NAME}`]);
    return v?.value ?? 'full';
  } catch {
    return 'full'; // Fallback padrão
  }
}

export function setVar(value) {
  const one = `repos/${OWNER}/${REPO}/actions/variables/${VAR_NAME}`;
  try {
    gh([one, '-f', `value=${value}`, '-X', 'PATCH'], { throwOnError: true });
  } catch {
    gh([
      `repos/${OWNER}/${REPO}/actions/variables`,
      '-f',
      `name=${VAR_NAME}`,
      '-f',
      `value=${value}`,
      '-X',
      'POST',
    ], { throwOnError: true });
  }
  console.log(`CI_MODE alterado para: ${value}`);
}

function recentRuns() {
  try {
    const data = gh([`repos/${OWNER}/${REPO}/actions/runs?per_page=10`]);
    if (data?.workflow_runs) {
      return data.workflow_runs.filter((r) => r.name === WORKFLOW);
    }
  } catch {
    // Fallback silencioso
  }
  return [];
}

function runLooksBillingBlocked(run) {
  if (run.conclusion !== 'failure') return false;
  const start = new Date(run.run_started_at ?? run.created_at).getTime();
  const end = new Date(run.updated_at).getTime();
  return end - start < QUICK_FAIL_SECONDS * 1000;
}

function detectBlocked() {
  const runs = recentRuns().filter((r) => r.event !== 'workflow_dispatch');
  const recent = runs.slice(0, FAIL_WINDOW);
  const blocked = recent.length === FAIL_WINDOW && recent.every(runLooksBillingBlocked);
  return { blocked, sample: recent.map((r) => ({ id: r.id, conclusion: r.conclusion })) };
}

const cmd = process.argv[2] ?? '--check';

if (cmd === '--check') {
  console.log('CI_MODE atual:', getVar());
  console.log('Diagnóstico de bloqueio:', JSON.stringify(detectBlocked(), null, 2));
} else if (cmd === '--standby') {
  setVar('standby');
} else if (cmd === '--full') {
  setVar('full');
} else if (cmd === '--auto') {
  const current = getVar();
  const { blocked } = detectBlocked();
  if (blocked && current !== 'standby') {
    console.log('Bloqueio de cota detectado => alternando para standby.');
    setVar('standby');
  } else if (!blocked && current === 'standby') {
    console.log('Sem sinal de bloqueio nos runs recentes.');
    console.log('Dica: utilize --full para reativar.');
  } else {
    console.log(`Sem alteração necessária (modo=${current}, bloqueado=${blocked}).`);
  }
} else {
  console.error('Uso: ci-gateway.mjs [--check|--auto|--standby|--full]');
  process.exit(1);
}

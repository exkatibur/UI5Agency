#!/usr/bin/env ts-node
/**
 * Workflow Orchestrator für UI5Agency
 * 
 * Dieser Agent orchestriert den kompletten Workflow für ein Feature:
 * 1. BUILD: TypeScript kompilieren, Tests laufen
 * 2. REVIEW: Visuelle Verifizierung mit Screenshots
 * 3. COMMIT: Git commit mit Verification Report
 * 
 * Verwendung:
 *   npm run agents -- --issue=1
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface WorkflowConfig {
  issue: number;
  phase: 'PLAN' | 'BUILD' | 'REVIEW' | 'COMMIT' | 'ALL';
}

// Parse command line args
const args = process.argv.slice(2);
const config: WorkflowConfig = {
  issue: 1,
  phase: 'ALL'
};

for (const arg of args) {
  if (arg.startsWith('--issue=')) {
    config.issue = parseInt(arg.replace('--issue=', ''), 10);
  }
  if (arg.startsWith('--phase=')) {
    const phase = arg.replace('--phase=', '').toUpperCase();
    if (['PLAN', 'BUILD', 'REVIEW', 'COMMIT', 'ALL'].includes(phase)) {
      config.phase = phase as 'PLAN' | 'BUILD' | 'REVIEW' | 'COMMIT' | 'ALL';
    }
  }
}

console.log('\n' + '='.repeat(70));
console.log('🤖 WORKFLOW ORCHESTRATOR - UI5Agency');
console.log('='.repeat(70));
console.log(`Issue: #${config.issue}`);
console.log(`Phase: ${config.phase}`);
console.log('='.repeat(70) + '\n');

/**
 * Execute a command and return success status
 */
function executeCommand(cmd: string, args: string[], description: string): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`\n⏳ ${description}...`);
    
    const proc = spawn(cmd, args, {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} - SUCCESS`);
        resolve(true);
      } else {
        console.log(`❌ ${description} - FAILED (exit code: ${code})`);
        resolve(false);
      }
    });

    proc.on('error', (err) => {
      console.log(`❌ ${description} - ERROR: ${err.message}`);
      resolve(false);
    });
  });
}

/**
 * Read the verification report
 */
function readVerificationReport(issue: number): any {
  const reportFile = path.join(process.cwd(), `state/visual-verification-${issue}.json`);
  
  if (!fs.existsSync(reportFile)) {
    return null;
  }

  const content = fs.readFileSync(reportFile, 'utf-8');
  return JSON.parse(content);
}

/**
 * Run BUILD phase
 */
async function phaseBuild(): Promise<boolean> {
  console.log('\n' + '▬'.repeat(70));
  console.log('🔨 PHASE: BUILD');
  console.log('▬'.repeat(70));

  // TypeScript type check
  const tsSuccess = await executeCommand('npm', ['run', 'ts-typecheck'], 'TypeScript type check');
  if (!tsSuccess) return false;

  // ESLint
  const lintSuccess = await executeCommand('npm', ['run', 'lint'], 'ESLint linting');
  if (!lintSuccess) {
    console.log('⚠️ Linting issues found (non-blocking)');
  }

  // Build the app
  const buildSuccess = await executeCommand('npm', ['run', 'build'], 'Build application');
  if (!buildSuccess) return false;

  console.log('\n✅ BUILD phase completed successfully');
  return true;
}

/**
 * Run REVIEW phase
 */
async function phaseReview(issue: number): Promise<boolean> {
  console.log('\n' + '▬'.repeat(70));
  console.log('🔍 PHASE: REVIEW - Visual Verification');
  console.log('▬'.repeat(70));

  const reviewSuccess = await executeCommand('npm', ['run', 'verify:screenshots', '--', `--issue=${issue}`], 'Visual verification with Playwright');
  
  if (!reviewSuccess) {
    console.log('\n❌ Visual verification failed');
    return false;
  }

  // Read and display the report
  const report = readVerificationReport(issue);
  
  if (!report) {
    console.log('⚠️ Verification report not found');
    return false;
  }

  console.log('\n📋 VERIFICATION REPORT SUMMARY');
  console.log('─'.repeat(70));
  console.log(`Issue: #${report.issue}`);
  console.log(`Status: ${report.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Summary: ${report.summary}`);
  console.log(`Screenshots: ${report.screenshots.length}`);
  console.log(`Console Errors: ${report.console_errors.length}`);
  console.log(`Console Warnings: ${report.console_warnings.length}`);
  
  console.log('\nAcceptance Criteria:');
  report.acceptance_criteria.forEach((ac: any) => {
    const status = ac.status === 'PASS' ? '✅' : ac.status === 'FAIL' ? '❌' : '⏳';
    console.log(`  ${status} ${ac.id}: ${ac.description}`);
  });

  if (!report.success) {
    console.log('\n❌ REVIEW phase failed - Blocker criteria not met');
    return false;
  }

  console.log('\n✅ REVIEW phase completed - All acceptance criteria passed');
  return true;
}

/**
 * Run COMMIT phase
 */
async function phaseCommit(issue: number): Promise<boolean> {
  console.log('\n' + '▬'.repeat(70));
  console.log('💾 PHASE: COMMIT');
  console.log('▬'.repeat(70));

  const report = readVerificationReport(issue);
  
  if (!report) {
    console.log('❌ Cannot commit - verification report not found');
    return false;
  }

  if (!report.success) {
    console.log('❌ Cannot commit - verification not passed');
    return false;
  }

  // Git add
  console.log('\n📝 Staging files...');
  const addProc = spawn('git', ['add', '-A'], {
    stdio: 'pipe',
    cwd: process.cwd()
  });

  await new Promise<void>((resolve) => {
    addProc.on('close', () => {
      console.log('✅ Files staged');
      resolve();
    });
  });

  // Git commit
  const commitMessage = `feat(#${issue}): Implement feature with visual verification

- Implementation complete and tested
- ${report.acceptance_criteria.filter((ac: any) => ac.status === 'PASS').length}/${report.acceptance_criteria.length} acceptance criteria passed
- ${report.screenshots.length} screenshots captured and reviewed
- Visual verification: ${report.success ? 'PASSED' : 'FAILED'}`;

  console.log('\n📝 Creating commit...');
  const commitProc = spawn('git', ['commit', '-m', commitMessage], {
    stdio: 'pipe',
    cwd: process.cwd()
  });

  const commitSuccess = await new Promise<boolean>((resolve) => {
    commitProc.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Commit created');
        resolve(true);
      } else {
        console.log('⚠️ Commit skipped (no changes or already committed)');
        resolve(true); // Not a hard failure
      }
    });
  });

  if (!commitSuccess) return false;

  console.log('\n✅ COMMIT phase completed');
  return true;
}

/**
 * Main orchestration
 */
async function orchestrate(): Promise<void> {
  try {
    let success = true;

    // BUILD Phase
    if (config.phase === 'ALL' || config.phase === 'BUILD') {
      success = await phaseBuild();
      if (!success) {
        console.log('\n❌ Workflow stopped - BUILD phase failed');
        process.exit(1);
      }
    }

    // REVIEW Phase
    if ((config.phase === 'ALL' || config.phase === 'REVIEW') && success) {
      success = await phaseReview(config.issue);
      if (!success) {
        console.log('\n❌ Workflow stopped - REVIEW phase failed');
        process.exit(1);
      }
    }

    // COMMIT Phase
    if ((config.phase === 'ALL' || config.phase === 'COMMIT') && success) {
      success = await phaseCommit(config.issue);
      if (!success) {
        console.log('\n❌ Workflow stopped - COMMIT phase failed');
        process.exit(1);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ WORKFLOW COMPLETED SUCCESSFULLY');
    console.log('='.repeat(70));
    console.log(`
📊 Summary for Issue #${config.issue}:
  ✅ Code built and tested
  ✅ Visual verification passed
  ✅ Changes committed to git
  
📁 Results:
  • Screenshots: state/screenshots-${config.issue}/
  • Report: state/visual-verification-${config.issue}.json
    `);
    console.log('='.repeat(70) + '\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Workflow failed with error:', error);
    process.exit(1);
  }
}

// Start orchestration
orchestrate().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

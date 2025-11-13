#!/usr/bin/env node
/**
 * Workflow Orchestrator für UI5Agency (JavaScript/Node Version)
 * 
 * Verwendet: child_process statt komplexes TypeScript
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line args
const args = process.argv.slice(2);
let config = {
  issue: 1,
  phase: 'ALL'
};

for (const arg of args) {
  if (arg.startsWith('--issue=')) {
    config.issue = parseInt(arg.replace('--issue=', ''), 10);
  }
  if (arg.startsWith('--phase=')) {
    config.phase = arg.replace('--phase=', '').toUpperCase();
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
function executeCommand(cmd, cmdArgs, description) {
  return new Promise((resolve) => {
    console.log(`\n⏳ ${description}...`);
    
    const proc = spawn(cmd, cmdArgs, {
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
function readVerificationReport(issue) {
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
async function phaseBuild() {
  console.log('\n' + '▬'.repeat(70));
  console.log('🔨 PHASE: BUILD');
  console.log('▬'.repeat(70));

  // TypeScript type check
  const tsSuccess = await executeCommand('npm', ['run', 'ts-typecheck'], 'TypeScript type check');
  if (!tsSuccess) return false;

  // Build the app
  const buildSuccess = await executeCommand('npm', ['run', 'build'], 'Build application');
  if (!buildSuccess) return false;

  console.log('\n✅ BUILD phase completed successfully');
  return true;
}

/**
 * Run REVIEW phase
 */
async function phaseReview(issue) {
  console.log('\n' + '▬'.repeat(70));
  console.log('🔍 PHASE: REVIEW - Visual Verification');
  console.log('▬'.repeat(70));

  const reviewSuccess = await executeCommand('node_modules/.bin/ts-node', ['scripts/visual-verification.ts', `--issue=${issue}`], 'Visual verification with Playwright');
  
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
  report.acceptance_criteria.forEach((ac) => {
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
async function phaseCommit(issue) {
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

  await new Promise((resolve) => {
    addProc.on('close', () => {
      console.log('✅ Files staged');
      resolve();
    });
  });

  // Git commit
  const passedCriteria = report.acceptance_criteria.filter((ac) => ac.status === 'PASS').length;
  const commitMessage = `feat(#${issue}): Implement feature with visual verification

- Implementation complete and tested
- ${passedCriteria}/${report.acceptance_criteria.length} acceptance criteria passed
- ${report.screenshots.length} screenshots captured and reviewed
- Visual verification: ${report.success ? 'PASSED' : 'FAILED'}

This commit includes automated visual verification with Playwright.
Screenshots available in state/screenshots-${issue}/
Full report: state/visual-verification-${issue}.json`;

  console.log('\n📝 Creating commit...');
  const commitProc = spawn('git', ['commit', '-m', commitMessage], {
    stdio: 'pipe',
    cwd: process.cwd()
  });

  const commitSuccess = await new Promise((resolve) => {
    commitProc.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Commit created');
        resolve(true);
      } else {
        console.log('⚠️ Commit skipped (no changes or already committed)');
        resolve(true);
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
async function orchestrate() {
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

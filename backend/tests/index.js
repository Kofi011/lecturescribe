/**
 * tests/index.js — Unified Test Runner for LectureScribe Backend
 */

import { runAuthTests } from './auth.test.js'
import { runDbTests } from './db.test.js'
import { runAdminE2ETests } from './admin_e2e.test.js'

async function main() {
  console.log('====================================================')
  console.log('  LectureScribe Backend Master Test Suite')
  console.log('====================================================\n')

  try {
    await runAuthTests()
    console.log('')
    await runDbTests()
    console.log('')
    await runAdminE2ETests()
    console.log('')

    console.log('====================================================')
    console.log('  ALL TESTS PASSED SUCCESSFULLY (100% OK)')
    console.log('====================================================')
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILURE:', err.message)
    process.exit(1)
  }
}

main()

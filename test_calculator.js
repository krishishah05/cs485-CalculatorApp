/**
 * test_calculator.js
 * Hammers the backend calculate() endpoint with random expressions
 * until 1000 consecutive correct answers are achieved.
 *
 * Run: node test_calculator.js
 */

const URL = 'http://localhost:3001/calculate';

// ── helpers ──────────────────────────────────────────────────────────────────

function post(expression) {
  return fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expression }),
  }).then(r => r.json());
}

// Generate a random integer in [min, max]
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Round to 8 sig figs to avoid floating-point noise
function round(n) {
  return parseFloat(parseFloat(n).toPrecision(8));
}

// Build a test case: returns { expression, expected }
function makeTest() {
  const ops = ['+', '-', '×', '÷'];
  // 1 or 2 operators (so 2 or 3 operands)
  const numOps = randInt(1, 2);

  let operands = [];
  let operators = [];

  for (let i = 0; i <= numOps; i++) {
    // avoid 0 as divisor — handled separately below
    operands.push(randInt(-99, 99));
  }
  for (let i = 0; i < numOps; i++) {
    operators.push(ops[randInt(0, 3)]);
  }

  // Replace ÷ 0 with ÷ 1
  for (let i = 0; i < operators.length; i++) {
    if (operators[i] === '÷' && operands[i + 1] === 0) {
      operands[i + 1] = randInt(1, 99);
    }
  }

  // Build display expression string — wrap negatives in parens to avoid -- parse errors
  const fmt = n => n < 0 ? `(${n})` : `${n}`;
  let expr = fmt(operands[0]);
  for (let i = 0; i < operators.length; i++) {
    expr += operators[i] + fmt(operands[i + 1]);
  }

  // Compute expected value locally (same logic as backend)
  let jsExpr = expr.replace(/×/g, '*').replace(/÷/g, '/');
  // eslint-disable-next-line no-new-func
  const expected = round(Function('"use strict"; return (' + jsExpr + ')')());

  return { expression: expr, expected };
}

// ── fixed regression cases ────────────────────────────────────────────────────

const FIXED = [
  { expression: '1+1',           expected: 2        },
  { expression: '10-3',          expected: 7        },
  { expression: '6×7',           expected: 42       },
  { expression: '10÷4',          expected: 2.5      },
  { expression: '100÷3',         expected: round(100/3) },
  { expression: '0+0',           expected: 0        },
  { expression: '-5+3',          expected: -2       },
  { expression: '2+3×4',         expected: 14       },  // left-to-right: backend uses JS precedence
  { expression: '9-3-2',         expected: 4        },
  { expression: '100÷10÷2',      expected: 5        },
  { expression: '7×8+2',         expected: 58       },
  { expression: '50-20×2',       expected: 10       },
  { expression: '1+2+3+4+5',     expected: 15       },
  { expression: '-10×-3',        expected: 30       },
  { expression: '0×99',          expected: 0        },
  { expression: '99+1',          expected: 100      },
  { expression: '1000÷8',        expected: 125      },
  { expression: '3+4×2÷2',       expected: 7        },
  { expression: '25%',           expected: 0.25     },  // 25/100
  { expression: '50+50',         expected: 100      },
];

// ── main loop ─────────────────────────────────────────────────────────────────

async function run() {
  let streak   = 0;
  let total    = 0;
  let failures = 0;

  console.log('Running fixed regression cases first...\n');

  // Fixed cases first
  for (const tc of FIXED) {
    const data = await post(tc.expression);
    const got  = round(parseFloat(data.result));
    const pass = got === tc.expected || data.result === tc.expected.toString();
    total++;
    if (pass) {
      streak++;
      console.log(`  ✓ [${total}] "${tc.expression}" → ${data.result}`);
    } else {
      streak = 0;
      failures++;
      console.error(`  ✗ [${total}] "${tc.expression}" expected ${tc.expected} got ${data.result}`);
    }
  }

  console.log(`\nFixed cases done. Streak: ${streak}. Now running random tests...\n`);

  // Random rounds until streak hits 1000
  while (streak < 1000) {
    const tc   = makeTest();
    const data = await post(tc.expression);
    const got  = round(parseFloat(data.result));
    const pass = got === tc.expected;
    total++;

    if (pass) {
      streak++;
      if (streak % 100 === 0) {
        console.log(`  ✓ streak ${streak}/1000  [test #${total}]  "${tc.expression}" → ${data.result}`);
      }
    } else {
      const prev = streak;
      streak = 0;
      failures++;
      console.error(`  ✗ streak RESET (was ${prev}) [test #${total}] "${tc.expression}" expected ${tc.expected} got ${data.result}`);
    }
  }

  console.log(`\n${'═'.repeat(55)}`);
  console.log(`  ✅  1000 consecutive correct answers achieved!`);
  console.log(`  Total tests : ${total}`);
  console.log(`  Failures    : ${failures}`);
  console.log(`${'═'.repeat(55)}\n`);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });

import { useState } from 'react';
import './App.css';

const OPERATORS = ['+', '-', '×', '÷'];

export default function App() {
  const [expression, setExpression] = useState('');
  const [display, setDisplay] = useState('0');
  const [justEvaluated, setJustEvaluated] = useState(false);

  const handleButton = async (btn) => {
    // --- Clear ---
    if (btn === 'AC') {
      setExpression('');
      setDisplay('0');
      setJustEvaluated(false);
      return;
    }

    // --- Backspace ---
    if (btn === '⌫') {
      const next = expression.slice(0, -1);
      setExpression(next);
      setDisplay(next || '0');
      setJustEvaluated(false);
      return;
    }

    // --- +/- : negate last number ---
    if (btn === '+/-') {
      const match = expression.match(/^(.*?)(-?\d*\.?\d+)$/);
      if (match) {
        const negated = (parseFloat(match[2]) * -1).toString();
        const next = match[1] + negated;
        setExpression(next);
        setDisplay(next);
      }
      return;
    }

    // --- = : call backend ---
    if (btn === '=') {
      if (!expression) return;
      try {
        const res = await fetch('http://localhost:3001/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expression }),
        });
        const data = await res.json();
        setDisplay(data.result);
        setExpression(data.result === 'Error' ? '' : data.result);
        setJustEvaluated(true);
      } catch {
        setDisplay('Error');
        setExpression('');
      }
      return;
    }

    // --- After evaluation: new digit starts fresh, operator continues ---
    if (justEvaluated) {
      if (!OPERATORS.includes(btn) && btn !== '%') {
        setExpression(btn);
        setDisplay(btn);
        setJustEvaluated(false);
        return;
      }
      setJustEvaluated(false);
    }

    // --- Prevent two operators in a row ---
    const lastChar = expression.slice(-1);
    if (OPERATORS.includes(btn) && OPERATORS.includes(lastChar)) {
      const next = expression.slice(0, -1) + btn;
      setExpression(next);
      setDisplay(next);
      return;
    }

    const next = expression + btn;
    setExpression(next);
    setDisplay(next);
  };

  const buttons = [
    ['AC', '+/-', '%', '÷'],
    ['7',  '8',  '9',  '×'],
    ['4',  '5',  '6',  '-'],
    ['1',  '2',  '3',  '+'],
    ['0',        '.',  '='],
  ];

  return (
    <div className="calc-wrapper">
      <div className="calculator">
        {/* Display */}
        <div className="display">
          <span className="expr">{display || '0'}</span>
        </div>

        {/* Backspace sits in its own row above the grid */}
        <div className="btn-grid">
          {buttons.map((row, ri) =>
            row.map((btn, ci) => {
              const isOperator = ['÷', '×', '-', '+', '='].includes(btn);
              const isTop      = ri === 0;
              const isWide     = btn === '0';
              return (
                <button
                  key={`${ri}-${ci}`}
                  className={[
                    'btn',
                    isOperator        ? 'btn-orange' : '',
                    isTop && !isOperator ? 'btn-gray'  : '',
                    isWide            ? 'btn-wide'  : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleButton(btn)}
                >
                  {btn}
                </button>
              );
            })
          )}
          {/* Backspace appended at end, renders via CSS order */}
          <button className="btn btn-gray btn-backspace" onClick={() => handleButton('⌫')}>
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

const metadata = {
  title: 'AI Tic Tac Toe',
  description: 'Play Tic Tac Toe against an AI opponent',
};

export default function Page() {
  const [board, setBoard] = useState(Array(9).fill(0));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isPlayerFirst, setIsPlayerFirst] = useState(true);
  const [loading, setLoading] = useState(false);

  const getCellSymbol = (value) => {
    if (value === 0) return '';
    if (isPlayerFirst) {
      return value === 1 ? 'X' : 'O';
    } else {
      return value === 1 ? 'O' : 'X';
    }
  };

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    if (squares.every(square => square !== 0)) return 'draw';
    return null;
  };

  const getAIMove = async (boardState) => {
    try {
      setLoading(true);
      const response = await fetch('https://modelhost-production.up.railway.app/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: boardState
        })
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      return data.predicted_move;
    } catch (error) {
      console.error('Error getting AI move:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const makeMove = async (index) => {
    if (board[index] !== 0 || !gameStarted || winner || !isPlayerTurn || loading) return;

    const newBoard = [...board];
    // Player is always 1, AI is always 2, regardless of X or O
    newBoard[index] = 1;
    setBoard(newBoard);
    setIsPlayerTurn(false);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      return;
    }

    // AI's turn
    const aiMove = await getAIMove(newBoard);
    if (aiMove !== null && newBoard[aiMove] === 0) {
      newBoard[aiMove] = 2;
      setBoard(newBoard);
      setIsPlayerTurn(true);
      
      const finalWinner = checkWinner(newBoard);
      if (finalWinner) {
        setWinner(finalWinner);
      }
    }
  };

  const startGame = async (playFirst) => {
    setBoard(Array(9).fill(0));
    setWinner(null);
    setGameStarted(true);
    setIsPlayerTurn(playFirst);
    setIsPlayerFirst(playFirst);

    if (!playFirst) {
      await makeAIFirstMove();
    }
  };

  const makeAIFirstMove = async () => {
    const newBoard = Array(9).fill(0);
    const aiMove = await getAIMove(newBoard);
    if (aiMove !== null) {
      newBoard[aiMove] = 2; // AI is always 2
      setBoard(newBoard);
      setIsPlayerTurn(true);
    }
  };

  const getCellStyle = (index) => {
    const baseStyle = "w-24 h-24 bg-white border-2 border-gray-300 text-4xl font-bold flex items-center justify-center transition-colors duration-200";
    
    if (!gameStarted || board[index] !== 0 || !isPlayerTurn || winner || loading) {
      return `${baseStyle} cursor-not-allowed`;
    }
    
    return `${baseStyle} hover:bg-gray-50 cursor-pointer`;
  };

  const getStatusMessage = () => {
    if (winner === 'draw') return 'It\'s a draw!';
    if (winner) {
      const playerWon = winner === 1;
      return playerWon ? 'You won!' : 'AI won!';
    }
    if (loading) return 'AI thinking...';
    if (isPlayerTurn) return 'Your turn';
    return 'AI\'s turn';
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="max-w-lg w-full mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Tic Tac Toe vs AI</h1>
        
        {!gameStarted ? (
          <div className="mb-8 space-y-6">
            <h2 className="text-2xl mb-4 text-gray-700">Choose who goes first:</h2>
            <div className="space-x-4">
              <button
                onClick={() => startGame(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200"
                disabled={loading}
              >
                Play First (X)
              </button>
              <button
                onClick={() => startGame(false)}
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200"
                disabled={loading}
              >
                Play Second (O)
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 mb-8 max-w-[384px] mx-auto">
              {board.map((cell, index) => (
                <button
                  key={index}
                  onClick={() => makeMove(index)}
                  className={getCellStyle(index)}
                  disabled={!isPlayerTurn || winner || loading || cell !== 0}
                >
                  <span className={cell === 1 ? 'text-blue-500' : 'text-red-500'}>
                    {getCellSymbol(cell)}
                  </span>
                </button>
              ))}
            </div>

            <div className="text-2xl mb-6 h-8 text-gray-700">
              {getStatusMessage()}
            </div>

            <button
              onClick={() => startGame(true)}
              className="bg-purple-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors duration-200"
              disabled={loading}
            >
              New Game
            </button>
          </>
        )}
      </div>
    </main>
  );
}
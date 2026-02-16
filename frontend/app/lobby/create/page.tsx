'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function CreateLobbyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerName = searchParams.get('name') || 'Jugador';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createGame = async () => {
      try {
        const res = await fetch(`${API_URL}/api/games/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hostName: playerName,
            settings: {
              minPlayers: 4,
              maxPlayers: 15,
              dayDuration: 15,
              nightDuration: 37,
              votingDuration: 30,
              mode: 'classic',
            },
          }),
        });

        if (!res.ok) {
          throw new Error('Error al crear la partida');
        }

        const data = await res.json();
        router.replace(`/game/${data.code}?name=${encodeURIComponent(playerName)}`);
      } catch (err) {
        console.error('Error creating game:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setLoading(false);
      }
    };

    createGame();
  }, [playerName, router]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-mafia-dark via-mafia-wood-dark to-mafia-dark">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-wood max-w-md w-full text-center space-y-4"
        >
          <h2 className="font-pirata text-3xl text-mafia-blood">❌ Error</h2>
          <p className="text-mafia-text">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="btn-medieval w-full"
          >
            ← Volver al Inicio
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-mafia-dark via-mafia-wood-dark to-mafia-dark">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="text-6xl animate-pulse">🎭</div>
        <h2 className="font-pirata text-3xl text-mafia-gold">
          Creando Partida...
        </h2>
        <p className="text-mafia-text font-crimson text-lg">
          Preparando la sala, {playerName}
        </p>
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-mafia-gold rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function CreateLobbyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-mafia-dark via-mafia-wood-dark to-mafia-dark">
          <div className="text-6xl animate-pulse">🎭</div>
        </div>
      }
    >
      <CreateLobbyContent />
    </Suspense>
  );
}

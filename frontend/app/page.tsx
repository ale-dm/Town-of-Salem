'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function HomePage() {
  const router = useRouter();
  const { user, deviceId, setUser, setDeviceId } = useUserStore();
  const [playerName, setPlayerName] = useState(user?.name || '');
  const [gameCode, setGameCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureUser = () => {
    let currentDeviceId = deviceId;
    if (!currentDeviceId) {
      currentDeviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setDeviceId(currentDeviceId);
    }
    if (!user) {
      setUser({
        id: currentDeviceId,
        name: playerName.trim(),
        level: 1,
        xp: 0,
      });
    }
  };

  const handleCreateGame = async () => {
    if (!playerName.trim() || playerName.trim().length < 2) {
      setError('Ingresa un nombre válido (mínimo 2 caracteres)');
      return;
    }

    setError(null);
    setIsCreating(true);

    try {
      ensureUser();

      const res = await fetch(`${API_URL}/api/games/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: playerName.trim(),
          settings: {
            minPlayers: 4,
            maxPlayers: 15,
            dayDuration: 120,
            nightDuration: 45,
            votingDuration: 30,
            mode: 'classic',
          },
        }),
      });

      if (!res.ok) throw new Error('Error al crear la partida');

      const data = await res.json();
      router.push(`/game/${data.code}?name=${encodeURIComponent(playerName.trim())}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear partida');
      setIsCreating(false);
    }
  };

  const handleJoinGame = () => {
    if (!playerName.trim() || playerName.trim().length < 2) {
      setError('Ingresa un nombre válido (mínimo 2 caracteres)');
      return;
    }

    const code = gameCode.trim().toUpperCase();
    if (code.length !== 6) {
      setError('El código debe tener 6 caracteres');
      return;
    }

    setError(null);
    ensureUser();
    router.push(`/game/${code}?name=${encodeURIComponent(playerName.trim())}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-mafia-dark via-mafia-wood-dark to-mafia-dark">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8"
      >
        <h1 className="font-pirata text-6xl md:text-8xl text-mafia-gold mb-4 torch-flicker">
          🎭 MAFIA GAME
        </h1>
        <p className="font-medieval text-xl md:text-2xl text-mafia-text">
          Un juego de deducción social
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="card-wood w-full max-w-md space-y-6"
      >
        {/* Player Name Input */}
        <div>
          <label htmlFor="playerName" className="block text-mafia-gold font-medieval text-lg mb-2">
            Tu Nombre
          </label>
          <input
            id="playerName"
            type="text"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value);
              setError(null);
            }}
            placeholder="Ingresa tu nombre"
            maxLength={20}
            className="input-medieval w-full"
          />
        </div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm font-crimson text-center bg-red-900/20 rounded-lg py-2 px-3"
          >
            ⚠️ {error}
          </motion.p>
        )}

        {/* Create Game Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateGame}
          disabled={isCreating}
          className="btn-medieval w-full disabled:opacity-50"
        >
          {isCreating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Creando...
            </span>
          ) : (
            '🎮 Crear Partida'
          )}
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-mafia-gold/30" />
          <span className="text-mafia-gold font-medieval">O</span>
          <div className="flex-1 h-px bg-mafia-gold/30" />
        </div>

        {/* Join Game */}
        <div>
          <label htmlFor="gameCode" className="block text-mafia-gold font-medieval text-lg mb-2">
            Código de Partida
          </label>
          <input
            id="gameCode"
            type="text"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            className="input-medieval w-full uppercase text-center text-2xl tracking-widest"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleJoinGame}
          className="btn-medieval w-full"
        >
          🚪 Unirse a Partida
        </motion.button>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8 text-center text-mafia-text/60"
      >
        <p className="font-crimson">
          Inspirado en Town of Salem • Hecho con ❤️
        </p>
      </motion.div>
    </div>
  );
}

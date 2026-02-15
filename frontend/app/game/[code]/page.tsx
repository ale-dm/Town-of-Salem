'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import PlayerList from '@/components/PlayerList';
import ChatBox from '@/components/ChatBox';
import GameSettings from '@/components/GameSettings';
import RoleConfigurator from '@/components/RoleConfigurator';
import GameBoard from '@/components/GameBoard';
import { useGame } from '@/hooks/useGame';
import { cn } from '@/lib/utils';

export default function GamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = (params.code as string)?.toUpperCase();
  const playerName = searchParams.get('name') || 'Jugador';

  const {
    gameState,
    players,
    messages,
    yourPlayerId,
    yourRole,
    phaseTimer,
    gameResult,
    stagedAction,
    connected,
    loading,
    error,
    joinGame,
    toggleReady,
    startGame,
    updateConfig,
    sendMessage,
    submitNightAction,
    submitVote,
    submitVerdict,
    updateTestament,
    updateDeathNote,
    addBot,
    removeBot,
  } = useGame();

  const [hasJoined, setHasJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Join game on mount
  useEffect(() => {
    if (!hasJoined && code && playerName) {
      joinGame(code, playerName);
      setHasJoined(true);
    }
  }, [code, playerName, hasJoined, joinGame]);

  // Handle countdown when game is starting
  useEffect(() => {
    if (gameState?.status === 'STARTING') {
      setCountdown(5);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState?.status]);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const yourPlayer = players.find((p) => p.id === yourPlayerId);
  const isHost = yourPlayer?.isHost ?? false;
  const allReady = players.length > 0 && players.every((p) => p.isReady);
  const canStart = isHost && players.length >= (gameState?.config?.minPlayers || 4) && allReady;

  const defaultConfig = {
    minPlayers: 4,
    maxPlayers: 15,
    dayDuration: 120,
    nightDuration: 45,
    votingDuration: 30,
    mode: 'classic',
    roleList: [],
  };

  // Show game board if game is playing or finished
  if (gameState?.status === 'PLAYING' || gameState?.status === 'FINISHED') {
    return (
      <GameBoard
        gameState={gameState}
        players={players}
        messages={messages}
        yourPlayerId={yourPlayerId}
        yourRole={yourRole}
        phaseTimer={phaseTimer}
        gameResult={gameResult}
        stagedAction={stagedAction}
        onSendMessage={sendMessage}
        onNightAction={submitNightAction}
        onVote={submitVote}
        onVerdict={submitVerdict}
        onTestamentUpdate={updateTestament}
        onDeathNoteUpdate={updateDeathNote}
      />
    );
  }

  // Loading state
  if (loading && !gameState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-mafia-dark via-mafia-wood-dark to-mafia-dark">
        <div className="text-6xl animate-pulse mb-4">🎭</div>
        <p className="font-medieval text-mafia-gold text-xl">Conectando...</p>
      </div>
    );
  }

  // Error state
  if (error && !gameState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-mafia-dark via-mafia-wood-dark to-mafia-dark">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-wood max-w-md w-full text-center space-y-4"
        >
          <h2 className="font-pirata text-3xl text-mafia-blood">❌ Error</h2>
          <p className="text-mafia-text font-crimson">{error}</p>
          <button onClick={() => router.push('/')} className="btn-medieval w-full">
            ← Volver al Inicio
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-mafia-dark via-mafia-wood-dark to-mafia-dark">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-mafia-dark/80 border-b border-mafia-wood/30">
        <button
          onClick={() => router.push('/')}
          className="text-mafia-text/60 hover:text-mafia-gold transition-colors font-crimson"
        >
          ← Salir
        </button>
        <div className="text-center">
          <h1 className="font-pirata text-2xl text-mafia-gold">🎭 Sala</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'w-2 h-2 rounded-full',
            connected ? 'bg-green-500' : 'bg-red-500'
          )} />
          <span className="text-mafia-text/40 text-xs font-crimson">
            {connected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </header>

      {/* Game Code Banner */}
      <div className="bg-mafia-wood/20 border-b border-mafia-wood/30 px-4 py-3">
        <div className="flex items-center justify-center gap-4">
          <span className="font-crimson text-mafia-text/60 text-sm">Código:</span>
          <button
            onClick={copyCode}
            className="flex items-center gap-2 bg-mafia-dark/60 px-4 py-1.5 rounded-lg border border-mafia-gold/30 hover:border-mafia-gold transition-colors"
          >
            <span className="font-mono text-2xl tracking-[0.3em] text-mafia-gold font-bold">
              {code}
            </span>
            <span className="text-mafia-text/50 text-sm">
              {copied ? '✅' : '📋'}
            </span>
          </button>
          <span className="font-crimson text-mafia-text/40 text-xs">
            {copied ? 'Copiado!' : 'Click para copiar'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0">
        {/* Left Panel - Players & Settings */}
        <div className="lg:w-1/3 flex flex-col gap-4">
          {/* Player List Card */}
          <div className="card-wood flex-1">
            <PlayerList
              players={players}
              yourPlayerId={yourPlayerId}
              maxPlayers={gameState?.config?.maxPlayers || 15}
            />
          </div>

          {/* Settings Card */}
          <div className="card-wood">
            <GameSettings
              config={gameState?.config || defaultConfig}
              isHost={isHost}
            />
          </div>

          {/* Role Configurator */}
          <div className="card-wood">
            <RoleConfigurator
              playerCount={players.length || 4}
              isHost={isHost}
              onRoleListChange={(roleList) => updateConfig({ roleList })}
              currentRoleList={gameState?.config?.roleList}
            />
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          <div className="card-wood flex-1 flex flex-col min-h-[300px]">
            <ChatBox
              messages={messages}
              onSendMessage={sendMessage}
              yourPlayerId={yourPlayerId}
              disabled={!connected}
              placeholder="Chatea con los jugadores..."
            />
          </div>
        </div>
      </div>

      {/* Footer - Actions */}
      <div className="px-4 py-4 bg-mafia-dark/80 border-t border-mafia-wood/30">
        <AnimatePresence mode="wait">
          {gameState?.status === 'STARTING' && countdown !== null ? (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <p className="font-pirata text-4xl text-mafia-gold animate-pulse">
                🎮 La partida comienza en {countdown}...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col sm:flex-row gap-3 items-center justify-center max-w-lg mx-auto"
            >
              {/* Ready Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleReady(!yourPlayer?.isReady)}
                className={cn(
                  'px-8 py-3 rounded-medieval border-2 font-medieval text-lg w-full sm:w-auto transition-all duration-300',
                  yourPlayer?.isReady
                    ? 'bg-green-900/60 border-green-500 text-green-400 hover:bg-green-900/40'
                    : 'bg-mafia-wood border-mafia-gold text-mafia-gold hover:bg-mafia-wood-light'
                )}
              >
                {yourPlayer?.isReady ? '✅ Listo!' : '⏳ No listo'}
              </motion.button>

              {/* Start Button (Host only) */}
              {isHost && (
                <motion.button
                  whileHover={canStart ? { scale: 1.03 } : {}}
                  whileTap={canStart ? { scale: 0.97 } : {}}
                  onClick={canStart ? startGame : undefined}
                  disabled={!canStart}
                  className={cn(
                    'px-8 py-3 rounded-medieval border-2 font-medieval text-lg w-full sm:w-auto transition-all duration-300',
                    canStart
                      ? 'bg-mafia-blood border-mafia-gold text-mafia-gold hover:bg-red-900 shadow-glow cursor-pointer'
                      : 'bg-mafia-dark/50 border-mafia-wood/50 text-mafia-text/30 cursor-not-allowed'
                  )}
                >
                  🎮 Iniciar Partida
                </motion.button>
              )}

              {/* Add/Remove Bot Buttons (Host only) */}
              {isHost && gameState?.status === 'WAITING' && (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={addBot}
                    className="px-4 py-3 rounded-medieval border-2 border-mafia-wood text-mafia-text font-medieval text-sm hover:bg-mafia-wood/30 transition-all"
                  >
                    🤖 +Bot
                  </motion.button>
                  {players.some(p => p.isBot) && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        const bot = players.findLast(p => p.isBot);
                        if (bot) removeBot(bot.id);
                      }}
                      className="px-4 py-3 rounded-medieval border-2 border-red-900/50 text-red-400 font-medieval text-sm hover:bg-red-900/20 transition-all"
                    >
                      🤖 -Bot
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status info */}
        {isHost && !canStart && gameState?.status === 'WAITING' && (
          <p className="text-center text-mafia-text/40 text-xs font-crimson mt-2">
            {players.length < (gameState?.config?.minPlayers || 4)
              ? `Necesitas al menos ${gameState?.config?.minPlayers || 4} jugadores`
              : !allReady
                ? 'Todos los jugadores deben estar listos'
                : ''}
          </p>
        )}
      </div>
    </div>
  );
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const game = await prisma.game.findFirst({
      where: { status: { in: ['PLAYING', 'FINISHED'] } },
      orderBy: { createdAt: 'desc' },
      include: {
        players: {
          select: { id: true, name: true, roleName: true, alive: true, isBot: true }
        }
      }
    });

    if (!game) {
      console.log('No se encontro ninguna partida');
      return;
    }

    console.log('=== PARTIDA ===');
    console.log('Codigo:', game.code);
    console.log('Dia:', game.day);
    console.log('Fase:', game.phase);
    console.log('Status:', game.status);
    console.log('\nJugadores:');
    game.players.forEach(p => {
      const status = p.alive ? 'VIVO' : 'MUERTO';
      const type = p.isBot ? 'BOT' : 'HUMAN';
      console.log(`- ${p.name} (${p.roleName}) ${status} ${type}`);
    });

    const actions = await prisma.gameAction.findMany({
      where: { gameId: game.id },
      orderBy: [{ night: 'asc' }, { createdAt: 'asc' }],
      include: {
        source: { select: { name: true, roleName: true } },
        target: { select: { name: true, roleName: true } }
      }
    });

    console.log(`\n=== ACCIONES (${actions.length} total) ===`);
    
    const actionsByNight = {};
    actions.forEach(a => {
      if (!actionsByNight[a.night]) actionsByNight[a.night] = [];
      actionsByNight[a.night].push(a);
    });

    Object.keys(actionsByNight).sort((a, b) => Number(a) - Number(b)).forEach(night => {
      console.log(`\n--- NOCHE ${night} ---`);
      actionsByNight[night].forEach(a => {
        console.log(`  ${a.source.name} (${a.source.roleName}) -> ${a.actionType} -> ${a.target?.name || 'N/A'} (${a.target?.roleName || 'N/A'})`);
        if (a.metadata) {
          console.log(`    Metadata:`, a.metadata);
        }
        if (a.result) {
          console.log(`    Result:`, a.result);
        }
      });
    });

    console.log('\n=== ANALISIS ===');
    const killActions = actions.filter(a => ['KILL_SINGLE', 'KILL_RAMPAGE', 'SHOOT', 'EXECUTE'].includes(a.actionType));
    console.log(`Acciones de kill: ${killActions.length}`);
    
    const rolesWithKillActions = [...new Set(killActions.map(a => a.source.roleName))];
    console.log(`Roles que intentaron matar:`, rolesWithKillActions.join(', '));

    await prisma.$disconnect();
  } catch (err) {
    console.error('Error:', err);
    await prisma.$disconnect();
  }
})();

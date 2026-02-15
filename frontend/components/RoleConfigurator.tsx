'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

interface RoleData {
  id: string;
  slug: string;
  nameEs: string;
  nameEn: string;
  icon: string;
  color: string;
  goalEs: string;
  abilitiesEs: string;
  isUnique: boolean;
  faction: { id: string; name: string };
  alignment: { id: string; name: string };
}

interface RoleSlot {
  type: 'specific' | 'faction' | 'alignment' | 'any';
  slug?: string;
  faction?: string;
  alignment?: string;
  label: string;
  icon: string;
}

interface RoleConfiguratorProps {
  playerCount: number;
  isHost: boolean;
  onRoleListChange: (roleList: RoleSlot[]) => void;
  currentRoleList?: RoleSlot[];
}

// ============================================
// FACTION CONFIG
// ============================================

const FACTION_COLORS: Record<string, string> = {
  Town: '#4CAF50',
  Mafia: '#E53935',
  Coven: '#9C27B0',
  Neutral: '#9E9E9E',
};

const FACTION_ICONS: Record<string, string> = {
  Town: '🏘️',
  Mafia: '🔪',
  Coven: '🧙‍♀️',
  Neutral: '⚖️',
};

const ALIGNMENT_LABELS: Record<string, string> = {
  'Town Investigative': '🔍 Investigativo',
  'Town Protective': '🛡️ Protector',
  'Town Killing': '⚔️ Asesino',
  'Town Support': '📢 Soporte',
  'Mafia Killing': '🔪 Asesino',
  'Mafia Deception': '🎭 Engaño',
  'Mafia Support': '🤝 Soporte',
  'Coven Evil': '🧪 Malvado',
  'Neutral Benign': '🕊️ Benigno',
  'Neutral Evil': '😈 Malvado',
  'Neutral Killing': '💀 Asesino',
  'Neutral Chaos': '🌀 Caos',
};

// ============================================
// DEFAULT ROLE LISTS
// ============================================

function getDefaultSlots(playerCount: number): RoleSlot[] {
  const slots: RoleSlot[] = [];

  if (playerCount <= 5) {
    slots.push(
      { type: 'specific', slug: 'sheriff', label: 'Sheriff', icon: '⭐' },
      { type: 'specific', slug: 'doctor', label: 'Doctor', icon: '🏥' },
      { type: 'faction', faction: 'Mafia', label: 'Mafia (cualquier)', icon: '🔪' },
      { type: 'alignment', alignment: 'Town Killing', label: 'Town Killing', icon: '⚔️' },
    );
    if (playerCount >= 5)
      slots.push({ type: 'alignment', alignment: 'Neutral Benign', label: 'Neutral Benigno', icon: '🕊️' });
  } else if (playerCount <= 9) {
    slots.push(
      { type: 'specific', slug: 'sheriff', label: 'Sheriff', icon: '⭐' },
      { type: 'specific', slug: 'doctor', label: 'Doctor', icon: '🏥' },
      { type: 'specific', slug: 'jailor', label: 'Jailor', icon: '⛓️' },
      { type: 'alignment', alignment: 'Town Investigative', label: 'Town Investigativo', icon: '🔍' },
      { type: 'alignment', alignment: 'Town Support', label: 'Town Soporte', icon: '📢' },
      { type: 'specific', slug: 'godfather', label: 'Godfather', icon: '🎩' },
    );
    if (playerCount >= 7)
      slots.push({ type: 'specific', slug: 'mafioso', label: 'Mafioso', icon: '🔫' });
    if (playerCount >= 8)
      slots.push({ type: 'alignment', alignment: 'Neutral Killing', label: 'Neutral Asesino', icon: '💀' });
    if (playerCount >= 9)
      slots.push({ type: 'alignment', alignment: 'Neutral Evil', label: 'Neutral Malvado', icon: '😈' });
  } else {
    slots.push(
      { type: 'specific', slug: 'sheriff', label: 'Sheriff', icon: '⭐' },
      { type: 'specific', slug: 'jailor', label: 'Jailor', icon: '⛓️' },
      { type: 'specific', slug: 'doctor', label: 'Doctor', icon: '🏥' },
      { type: 'alignment', alignment: 'Town Investigative', label: 'Town Investigativo', icon: '🔍' },
      { type: 'alignment', alignment: 'Town Protective', label: 'Town Protector', icon: '🛡️' },
      { type: 'alignment', alignment: 'Town Support', label: 'Town Soporte', icon: '📢' },
      { type: 'alignment', alignment: 'Town Killing', label: 'Town Asesino', icon: '⚔️' },
      { type: 'specific', slug: 'godfather', label: 'Godfather', icon: '🎩' },
      { type: 'specific', slug: 'mafioso', label: 'Mafioso', icon: '🔫' },
      { type: 'alignment', alignment: 'Mafia Deception', label: 'Mafia Engaño', icon: '🎭' },
    );
    if (playerCount >= 11)
      slots.push({ type: 'alignment', alignment: 'Neutral Killing', label: 'Neutral Asesino', icon: '💀' });
    if (playerCount >= 12)
      slots.push({ type: 'alignment', alignment: 'Neutral Evil', label: 'Neutral Malvado', icon: '😈' });
    if (playerCount >= 13)
      slots.push({ type: 'alignment', alignment: 'Mafia Support', label: 'Mafia Soporte', icon: '🤝' });
    if (playerCount >= 14)
      slots.push({ type: 'alignment', alignment: 'Town Investigative', label: 'Town Investigativo', icon: '🔍' });
    if (playerCount >= 15)
      slots.push({ type: 'alignment', alignment: 'Neutral Benign', label: 'Neutral Benigno', icon: '🕊️' });
  }

  return slots;
}

// ============================================
// COMPONENT
// ============================================

export default function RoleConfigurator({
  playerCount,
  isHost,
  onRoleListChange,
  currentRoleList,
}: RoleConfiguratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [roleSlots, setRoleSlots] = useState<RoleSlot[]>([]);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFaction, setFilterFaction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch roles from API
  useEffect(() => {
    async function fetchRoles() {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${apiUrl}/api/roles`);
        if (res.ok) {
          const data = await res.json();
          setRoles(data);
        }
      } catch {
        console.error('Failed to fetch roles');
      } finally {
        setLoading(false);
      }
    }
    fetchRoles();
  }, []);

  // Initialize slots from current config or defaults
  useEffect(() => {
    if (currentRoleList && currentRoleList.length > 0) {
      setRoleSlots(currentRoleList);
    } else {
      setRoleSlots(getDefaultSlots(playerCount));
    }
  }, [playerCount, currentRoleList]);

  // Grouped roles by faction
  const groupedRoles = useMemo(() => {
    const groups: Record<string, RoleData[]> = {};
    roles.forEach((r) => {
      const fname = r.faction.name;
      if (!groups[fname]) groups[fname] = [];
      groups[fname].push(r);
    });
    return groups;
  }, [roles]);

  // Available alignments
  const alignments = useMemo(() => {
    const set = new Set<string>();
    roles.forEach((r) => set.add(r.alignment.name));
    return Array.from(set).sort();
  }, [roles]);

  // Filtered roles for the picker
  const filteredRoles = useMemo(() => {
    let filtered = roles;
    if (filterFaction) {
      filtered = filtered.filter((r) => r.faction.name === filterFaction);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.nameEs.toLowerCase().includes(q) ||
          r.nameEn.toLowerCase().includes(q) ||
          r.slug.includes(q)
      );
    }
    return filtered;
  }, [roles, filterFaction, searchTerm]);

  // Count slots by faction type
  const slotCounts = useMemo(() => {
    const counts: Record<string, number> = { Town: 0, Mafia: 0, Coven: 0, Neutral: 0 };
    roleSlots.forEach((s) => {
      if (s.type === 'specific') {
        const role = roles.find((r) => r.slug === s.slug);
        if (role) counts[role.faction.name] = (counts[role.faction.name] || 0) + 1;
      } else if (s.faction) {
        counts[s.faction] = (counts[s.faction] || 0) + 1;
      } else if (s.alignment) {
        const faction = s.alignment.split(' ')[0];
        counts[faction] = (counts[faction] || 0) + 1;
      }
    });
    return counts;
  }, [roleSlots, roles]);

  const handleSlotClick = (index: number) => {
    if (!isHost) return;
    setEditingSlot(editingSlot === index ? null : index);
    setSearchTerm('');
    setFilterFaction(null);
  };

  const setSpecificRole = useCallback(
    (index: number, role: RoleData) => {
      const newSlots = [...roleSlots];
      newSlots[index] = {
        type: 'specific',
        slug: role.slug,
        label: role.nameEs,
        icon: role.icon,
      };
      setRoleSlots(newSlots);
      setEditingSlot(null);
      onRoleListChange(newSlots);
    },
    [roleSlots, onRoleListChange]
  );

  const setAlignmentSlot = useCallback(
    (index: number, alignment: string) => {
      const newSlots = [...roleSlots];
      newSlots[index] = {
        type: 'alignment',
        alignment,
        label: ALIGNMENT_LABELS[alignment] || alignment,
        icon: ALIGNMENT_LABELS[alignment]?.split(' ')[0] || '❓',
      };
      setRoleSlots(newSlots);
      setEditingSlot(null);
      onRoleListChange(newSlots);
    },
    [roleSlots, onRoleListChange]
  );

  const setFactionSlot = useCallback(
    (index: number, faction: string) => {
      const newSlots = [...roleSlots];
      newSlots[index] = {
        type: 'faction',
        faction,
        label: `${faction} (cualquier)`,
        icon: FACTION_ICONS[faction] || '❓',
      };
      setRoleSlots(newSlots);
      setEditingSlot(null);
      onRoleListChange(newSlots);
    },
    [roleSlots, onRoleListChange]
  );

  const addSlot = useCallback(() => {
    if (roleSlots.length >= 15) return;
    const newSlots = [
      ...roleSlots,
      { type: 'any' as const, label: 'Sin asignar', icon: '❓' },
    ];
    setRoleSlots(newSlots);
    onRoleListChange(newSlots);
  }, [roleSlots, onRoleListChange]);

  const removeSlot = useCallback(
    (index: number) => {
      if (roleSlots.length <= 4) return;
      const newSlots = roleSlots.filter((_, i) => i !== index);
      setRoleSlots(newSlots);
      setEditingSlot(null);
      onRoleListChange(newSlots);
    },
    [roleSlots, onRoleListChange]
  );

  const resetToDefaults = useCallback(() => {
    const defaults = getDefaultSlots(playerCount);
    setRoleSlots(defaults);
    setEditingSlot(null);
    onRoleListChange(defaults);
  }, [playerCount, onRoleListChange]);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left font-medieval text-mafia-gold text-lg"
      >
        <span>🎭 Lista de Roles ({roleSlots.length}/{playerCount})</span>
        <span className="text-sm">{isOpen ? '▼' : '▶'}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 bg-mafia-dark/40 rounded-lg p-4">
              {/* Faction Summary */}
              <div className="flex gap-2 flex-wrap">
                {Object.entries(slotCounts).map(([faction, count]) =>
                  count > 0 ? (
                    <span
                      key={faction}
                      className="px-2 py-0.5 rounded text-xs font-crimson"
                      style={{
                        backgroundColor: `${FACTION_COLORS[faction]}20`,
                        color: FACTION_COLORS[faction],
                        border: `1px solid ${FACTION_COLORS[faction]}40`,
                      }}
                    >
                      {FACTION_ICONS[faction]} {faction}: {count}
                    </span>
                  ) : null
                )}
              </div>

              {/* Slot List */}
              <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                {roleSlots.map((slot, idx) => {
                  const factionColor =
                    slot.type === 'specific'
                      ? roles.find((r) => r.slug === slot.slug)?.color || '#888'
                      : slot.faction
                      ? FACTION_COLORS[slot.faction] || '#888'
                      : slot.alignment
                      ? FACTION_COLORS[slot.alignment.split(' ')[0]] || '#888'
                      : '#555';

                  return (
                    <div key={idx}>
                      <div
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer',
                          editingSlot === idx
                            ? 'border-mafia-gold bg-mafia-dark/60'
                            : 'border-mafia-wood/30 bg-mafia-dark/20 hover:border-mafia-wood/60'
                        )}
                        onClick={() => handleSlotClick(idx)}
                      >
                        <span className="text-xs text-mafia-text/40 font-mono w-5">
                          {idx + 1}.
                        </span>
                        <span className="text-base">{slot.icon}</span>
                        <span
                          className="flex-1 text-sm font-crimson"
                          style={{ color: factionColor }}
                        >
                          {slot.label}
                        </span>
                        <span className="text-[10px] text-mafia-text/30 font-crimson uppercase">
                          {slot.type === 'specific'
                            ? 'Fijo'
                            : slot.type === 'alignment'
                            ? 'Alineación'
                            : slot.type === 'faction'
                            ? 'Facción'
                            : 'Libre'}
                        </span>
                        {isHost && roleSlots.length > 4 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSlot(idx);
                            }}
                            className="text-mafia-blood/60 hover:text-mafia-blood text-sm ml-1"
                            title="Eliminar slot"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Inline Role Picker */}
                      <AnimatePresence>
                        {editingSlot === idx && isHost && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-1 mb-2 p-3 bg-mafia-dark/80 rounded-lg border border-mafia-gold/20 space-y-2">
                              {/* Search */}
                              <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar rol..."
                                className="w-full px-3 py-1.5 bg-mafia-dark/60 border border-mafia-wood/30 rounded text-sm text-mafia-text font-crimson placeholder:text-mafia-text/30 focus:outline-none focus:border-mafia-gold/50"
                              />

                              {/* Quick Buttons: Faction / Alignment */}
                              <div className="flex flex-wrap gap-1">
                                {['Town', 'Mafia', 'Coven', 'Neutral'].map((f) => (
                                  <button
                                    key={`fac-${f}`}
                                    onClick={() => setFactionSlot(idx, f)}
                                    className="px-2 py-0.5 rounded text-[10px] font-crimson border transition-colors hover:opacity-80"
                                    style={{
                                      backgroundColor: `${FACTION_COLORS[f]}15`,
                                      color: FACTION_COLORS[f],
                                      borderColor: `${FACTION_COLORS[f]}40`,
                                    }}
                                  >
                                    {FACTION_ICONS[f]} {f}
                                  </button>
                                ))}
                              </div>

                              <div className="flex flex-wrap gap-1">
                                {alignments.map((a) => (
                                  <button
                                    key={`aln-${a}`}
                                    onClick={() => setAlignmentSlot(idx, a)}
                                    className="px-2 py-0.5 rounded text-[10px] font-crimson border border-mafia-wood/30 text-mafia-text/60 hover:text-mafia-gold hover:border-mafia-gold/40 transition-colors"
                                  >
                                    {ALIGNMENT_LABELS[a] || a}
                                  </button>
                                ))}
                              </div>

                              {/* Role List */}
                              <div className="max-h-[180px] overflow-y-auto space-y-0.5">
                                {loading ? (
                                  <p className="text-mafia-text/40 text-xs text-center py-2">
                                    Cargando roles...
                                  </p>
                                ) : filteredRoles.length === 0 ? (
                                  <p className="text-mafia-text/40 text-xs text-center py-2">
                                    No se encontraron roles
                                  </p>
                                ) : (
                                  Object.entries(
                                    filteredRoles.reduce<Record<string, RoleData[]>>(
                                      (acc, r) => {
                                        const fname = r.faction.name;
                                        if (!acc[fname]) acc[fname] = [];
                                        acc[fname].push(r);
                                        return acc;
                                      },
                                      {}
                                    )
                                  ).map(([factionName, factionRoles]) => (
                                    <div key={factionName}>
                                      <div
                                        className="text-[10px] font-medieval uppercase tracking-wider px-1 py-0.5 sticky top-0 bg-mafia-dark/90"
                                        style={{ color: FACTION_COLORS[factionName] }}
                                      >
                                        {FACTION_ICONS[factionName]} {factionName}
                                      </div>
                                      {factionRoles.map((role) => (
                                        <button
                                          key={role.slug}
                                          onClick={() =>
                                            setSpecificRole(idx, role)
                                          }
                                          className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-mafia-wood/20 transition-colors text-left"
                                        >
                                          <span className="text-sm">
                                            {role.icon}
                                          </span>
                                          <span
                                            className="text-xs font-crimson flex-1"
                                            style={{ color: role.color }}
                                          >
                                            {role.nameEs}
                                          </span>
                                          <span className="text-[9px] text-mafia-text/30">
                                            {role.nameEn}
                                          </span>
                                          {role.isUnique && (
                                            <span className="text-[9px] text-mafia-gold/60">
                                              ★
                                            </span>
                                          )}
                                        </button>
                                      ))}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              {isHost && (
                <div className="flex gap-2 pt-2 border-t border-mafia-wood/20">
                  <button
                    onClick={addSlot}
                    disabled={roleSlots.length >= 15}
                    className={cn(
                      'flex-1 px-3 py-1.5 rounded text-xs font-crimson border transition-colors',
                      roleSlots.length >= 15
                        ? 'border-mafia-wood/20 text-mafia-text/20 cursor-not-allowed'
                        : 'border-mafia-gold/30 text-mafia-gold hover:bg-mafia-gold/10'
                    )}
                  >
                    + Agregar slot
                  </button>
                  <button
                    onClick={resetToDefaults}
                    className="px-3 py-1.5 rounded text-xs font-crimson border border-mafia-wood/30 text-mafia-text/50 hover:text-mafia-text hover:border-mafia-wood/60 transition-colors"
                  >
                    ↺ Reset
                  </button>
                </div>
              )}

              {/* Slot count warning */}
              {roleSlots.length !== playerCount && (
                <p className="text-mafia-blood text-[10px] font-crimson text-center">
                  ⚠️ {roleSlots.length} slots para {playerCount} jugadores.
                  {roleSlots.length < playerCount
                    ? ' Los extras serán Town aleatorio.'
                    : ' Algunos slots no se usarán.'}
                </p>
              )}

              {!isHost && (
                <p className="text-mafia-text/40 text-xs font-crimson italic text-center">
                  Solo el host puede cambiar la lista de roles
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

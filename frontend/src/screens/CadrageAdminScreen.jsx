import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Card, Badge, Button, useToast } from '../components/Primitives';
import { fetchAllCadrageResponses, exportCadrageResponses } from '../api';
import { timeAgo } from '../data';

const SECTION_LABELS = {
  s1: 'Identite et coeur de metier',
  s2: 'Structure et organisation',
  s3: 'Logistique et depots',
  s4: 'Clients et marche',
  s5: 'Vente et processus commercial',
  s6: 'Approvisionnement',
  s7: 'Catalogue produits',
  s8: 'Fonctionnalites attendues',
  s9: 'Securite et acces',
  s10: 'Situation actuelle',
  s11: 'Informations complementaires',
};

function formatAnswer(value) {
  if (!value) return '—';
  if (typeof value === 'string') return value;
  if (value.selected === '__other__') return `Autre : ${value.other || '—'}`;
  if (value.selected) return value.selected;
  if (Array.isArray(value.checked)) {
    let text = value.checked.join(', ');
    if (value.other) text += `, Autre : ${value.other}`;
    return text || '—';
  }
  return '—';
}

export function CadrageAdminScreen() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchAllCadrageResponses()
      .then(setResponses)
      .catch(err => toast({ tone: 'danger', message: err.message }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, fontSize: 14, color: 'var(--ink-500)' }}>
      Chargement des reponses...
    </div>
  );

  return (
    <div className="anim-fade screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink-900)' }}>
            Reponses au questionnaire de cadrage
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--ink-500)' }}>
            {responses.length} reponse{responses.length !== 1 ? 's' : ''} recue{responses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="secondary" icon="download" size="md" onClick={() => exportCadrageResponses()}>
          Exporter JSON
        </Button>
      </div>

      {/* Liste des reponses */}
      {responses.length === 0 ? (
        <Card padding="none" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-400)' }}>
              <Icon name="clipboard" size={26}/>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-800)' }}>Aucune reponse pour le moment</div>
            <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>Les reponses apparaitront ici une fois que des utilisateurs auront rempli le questionnaire.</div>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {responses.map(r => {
            const isExpanded = expanded === r.id;
            const isComplete = r.progress >= 100;
            return (
              <Card key={r.id} padding="none" style={{ overflow: 'visible' }}>
                {/* En-tete */}
                <div onClick={() => setExpanded(isExpanded ? null : r.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--ink-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: isComplete ? 'var(--success-100)' : 'var(--orange-100)',
                    color: isComplete ? 'var(--success-700)' : 'var(--orange-600)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name={isComplete ? 'check' : 'clipboard'} size={22} strokeWidth={isComplete ? 2.5 : 2}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-900)' }}>{r.respondent}</span>
                      <Badge tone={isComplete ? 'success' : 'warn'} size="xs">
                        {isComplete ? 'Complet' : `${r.progress}%`}
                      </Badge>
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginTop: 3 }}>
                      {r.user?.email} · Derniere maj {timeAgo(r.updatedAt)}
                      {r.submittedAt && ` · Soumis ${timeAgo(r.submittedAt)}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Barre progression mini */}
                    <div style={{ width: 80, height: 6, background: 'var(--ink-100)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${r.progress}%`, borderRadius: 999, background: isComplete ? 'var(--success-500)' : 'var(--orange-500)', transition: 'width 0.3s' }}/>
                    </div>
                    <Icon name={isExpanded ? 'chevronDown' : 'chevronRight'} size={16} color="var(--ink-400)"/>
                  </div>
                </div>

                {/* Detail des reponses */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--ink-150)', padding: '20px 22px' }}>
                    {Object.entries(r.responses).length === 0 ? (
                      <div style={{ fontSize: 13, color: 'var(--ink-500)', textAlign: 'center', padding: 20 }}>Aucune reponse enregistree.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {Object.entries(
                          // Grouper par section
                          Object.entries(r.responses).reduce((acc, [qId, val]) => {
                            const sectionId = qId.replace(/_\d+$/, '').replace('q', 's');
                            if (!acc[sectionId]) acc[sectionId] = [];
                            acc[sectionId].push({ qId, val });
                            return acc;
                          }, {})
                        ).map(([sectionId, questions]) => (
                          <div key={sectionId}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy-700)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--ink-100)' }}>
                              {SECTION_LABELS[sectionId] || sectionId}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {questions.map(({ qId, val }) => (
                                <div key={qId} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                                  <span style={{ color: 'var(--ink-400)', fontFamily: 'var(--font-mono)', fontSize: 11, minWidth: 48, flexShrink: 0, marginTop: 2 }}>{qId}</span>
                                  <span style={{ color: 'var(--ink-800)', lineHeight: 1.5 }}>{formatAnswer(val)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

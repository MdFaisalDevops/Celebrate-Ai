'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  CalendarCheck,
  Download,
  AlertCircle
} from 'lucide-react';
import { TimelineMilestone, EventPlan } from '@/types/event';

interface TimelinePlannerProps {
  plan: EventPlan;
  onUpdatePlan: (updated: EventPlan) => void;
}

export const TimelinePlanner: React.FC<TimelinePlannerProps> = ({ plan, onUpdatePlan }) => {
  const [activePhaseFilter, setActivePhaseFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newPhase, setNewPhase] = useState<TimelineMilestone['phase']>('1 Month Before');
  const [newDueDate, setNewDueDate] = useState(plan.date);
  const [newTime, setNewTime] = useState('');
  const [newCategory, setNewCategory] = useState<TimelineMilestone['category']>('logistics');
  const [newIsCritical, setNewIsCritical] = useState(false);

  const completedCount = useMemo(() => plan.timeline.filter((t) => t.completed).length, [plan.timeline]);
  const totalCount = plan.timeline.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const phases: TimelineMilestone['phase'][] = [
    '6+ Months Before',
    '2-3 Months Before',
    '1 Month Before',
    '1-2 Weeks Before',
    'Day-of Run of Show',
  ];

  const handleToggleTask = useCallback((id: string) => {
    onUpdatePlan({
      ...plan,
      timeline: plan.timeline.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
      updatedAt: new Date().toISOString(),
    });
  }, [plan, onUpdatePlan]);

  const handleDeleteTask = useCallback((id: string) => {
    onUpdatePlan({
      ...plan,
      timeline: plan.timeline.filter((item) => item.id !== id),
      updatedAt: new Date().toISOString(),
    });
  }, [plan, onUpdatePlan]);

  const handleAddTask = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    const newTask: TimelineMilestone = {
      id: `task-${Date.now()}`,
      phase: newPhase,
      time: newPhase === 'Day-of Run of Show' ? newTime || '12:00 PM' : undefined,
      task: newTaskName.trim(),
      dueDate: newDueDate,
      completed: false,
      category: newCategory,
      critical: newIsCritical,
    };

    onUpdatePlan({
      ...plan,
      timeline: [...plan.timeline, newTask],
      updatedAt: new Date().toISOString(),
    });
    setShowAddModal(false);
    setNewTaskName('');
    setNewTime('');
    setNewIsCritical(false);
  }, [newTaskName, newPhase, newTime, newDueDate, newCategory, newIsCritical, plan, onUpdatePlan]);

  /** Exports timeline milestones to an iCalendar (.ics) file. */
  const exportICal = useCallback(() => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CelebrateAI//Event Milestone Schedule//EN',
      'CALSCALE:GREGORIAN',
    ];

    plan.timeline.forEach((item, idx) => {
      const cleanDate = (item.dueDate || plan.date).replace(/-/g, '');
      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:milestone-${idx}-${Date.now()}@celebrateai.com`);
      icsContent.push(`DTSTAMP:${cleanDate}T090000Z`);
      icsContent.push(`DTSTART;VALUE=DATE:${cleanDate}`);
      icsContent.push(`SUMMARY:${item.task}`);
      icsContent.push(`DESCRIPTION:Phase: ${item.phase}. Category: ${item.category}. Status: ${item.completed ? 'Completed' : 'Pending'}`);
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${plan.title.replace(/\s+/g, '_')}_Milestones.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [plan.timeline, plan.date, plan.title]);

  const filteredTimeline = useMemo(
    () => activePhaseFilter === 'all'
      ? plan.timeline
      : plan.timeline.filter((t) => t.phase === activePhaseFilter),
    [plan.timeline, activePhaseFilter]
  );

  return (
    <section aria-labelledby="timeline-heading" className="flex flex-col gap-6">
      {/* Overview Progress Header */}
      <div className="glass-card flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 id="timeline-heading" style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarCheck className="gradient-text" size={24} /> Interactive Event Schedule & Milestones
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Sequential countdown checklist from planning milestones to hour-by-hour day-of coordination.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {completedCount} / {totalCount} Done
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {progressPct}% Completion
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-sm"
            aria-label="Add new timeline task"
          >
            <Plus size={15} /> Add Task
          </button>
          <button
            onClick={exportICal}
            className="btn btn-secondary btn-sm"
            title="Sync with Google or Apple Calendar"
            aria-label="Export iCalendar file"
          >
            <Download size={15} /> Calendar .ics
          </button>
        </div>
      </div>

      {/* Phase Filter Buttons */}
      <div className="tabs-container no-print" role="tablist" aria-label="Timeline Phases">
        <button
          onClick={() => setActivePhaseFilter('all')}
          className={`tab-btn ${activePhaseFilter === 'all' ? 'active' : ''}`}
          role="tab"
          aria-selected={activePhaseFilter === 'all'}
        >
          All Milestones ({plan.timeline.length})
        </button>
        {phases.map((phase) => {
          const count = plan.timeline.filter((t) => t.phase === phase).length;
          return (
            <button
              key={phase}
              onClick={() => setActivePhaseFilter(phase)}
              className={`tab-btn ${activePhaseFilter === phase ? 'active' : ''}`}
              role="tab"
              aria-selected={activePhaseFilter === phase}
            >
              {phase} ({count})
            </button>
          );
        })}
      </div>

      {/* Timeline List Cards */}
      <div className="flex flex-col gap-3">
        {filteredTimeline.map((item) => (
          <div
            key={item.id}
            className="glass-card flex items-center justify-between gap-4"
            style={{
              padding: '1rem 1.25rem',
              borderLeft: item.critical ? '4px solid #f43f5e' : '4px solid var(--accent-purple)',
              background: item.completed ? 'rgba(22, 24, 44, 0.45)' : 'var(--bg-card)',
              opacity: item.completed ? 0.8 : 1,
            }}
          >
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={() => handleToggleTask(item.id)}
                aria-label={`Mark "${item.task}" as ${item.completed ? 'incomplete' : 'complete'}`}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: item.completed ? '#10b981' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {item.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      textDecoration: item.completed ? 'line-through' : 'none',
                      color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                    }}
                  >
                    {item.task}
                  </span>

                  {item.critical && (
                    <span className="badge badge-rose" style={{ fontSize: '0.68rem' }}>
                      <AlertCircle size={10} /> Critical
                    </span>
                  )}
                  <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-3" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>{item.phase}</span>
                  {item.time && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#67e8f9', fontWeight: 600 }}>
                      <Clock size={12} /> {item.time}
                    </span>
                  )}
                  {item.dueDate && (
                    <span>Due: {item.dueDate}</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDeleteTask(item.id)}
              aria-label={`Delete task ${item.task}`}
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 10px', color: '#f87171' }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-task-heading">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <h3 id="add-task-heading" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              Add Timeline Task / Milestone
            </h3>
            <form onSubmit={handleAddTask} className="flex flex-col gap-3">
              <div className="form-group">
                <label className="form-label" htmlFor="new-task-name">Task Name</label>
                <input
                  id="new-task-name"
                  className="form-input"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="e.g. Confirm floral delivery time, Pick up cake"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="new-task-phase">Milestone Phase</label>
                  <select
                    id="new-task-phase"
                    className="form-select"
                    value={newPhase}
                    onChange={(e) => setNewPhase(e.target.value as TimelineMilestone['phase'])}
                  >
                    {phases.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="new-task-cat">Category</label>
                  <select
                    id="new-task-cat"
                    className="form-select"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TimelineMilestone['category'])}
                  >
                    <option value="venue">Venue</option>
                    <option value="catering">Catering</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="decor">Decor & Floral</option>
                    <option value="invitations">Invitations</option>
                    <option value="logistics">Logistics</option>
                    <option value="permits">Permits / Safety</option>
                  </select>
                </div>
              </div>

              {newPhase === 'Day-of Run of Show' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="new-task-time">Run of Show Time (e.g. 02:30 PM)</label>
                  <input
                    id="new-task-time"
                    className="form-input"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 03:00 PM"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="new-task-date">Due Date</label>
                <input
                  id="new-task-date"
                  type="date"
                  className="form-input"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2" style={{ marginTop: '0.4rem' }}>
                <input
                  id="new-critical"
                  type="checkbox"
                  checked={newIsCritical}
                  onChange={(e) => setNewIsCritical(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-purple)' }}
                />
                <label htmlFor="new-critical" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                  Mark as Critical Milestone
                </label>
              </div>

              <div className="flex items-center justify-end gap-2" style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

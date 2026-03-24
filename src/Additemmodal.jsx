// ═══════════════════════════════════════════════════════════════════════════════
// ADD ITEM MODAL - Handles adding Tasks, Users, and Projects
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react'
import { addTask, addUser, addProject, assignUserToProject } from './supabaseHelpers'
import './Modal.css'  // You'll need to create this CSS file

function AddItemModal({ isOpen, onClose, activeTab, projectId, userId, onSuccess }) {
  // ─── STATE FOR FORM SWITCHING ─────────────────────────────────────────────────
  
  const [currentTab, setCurrentTab] = useState(activeTab || 'task')

  // ─── STATE FOR TASK FORM ──────────────────────────────────────────────────────
  
  const [taskDescription, setTaskDescription] = useState('')
  const [taskColor, setTaskColor] = useState('blue')
  const [taskPoints, setTaskPoints] = useState(0)
  const [taskSprint, setTaskSprint] = useState(1)

  // ─── STATE FOR USER FORM ──────────────────────────────────────────────────────
  
  const [userUsername, setUserUsername] = useState('')
  const [userAlias, setUserAlias] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')

  // ─── STATE FOR PROJECT FORM ───────────────────────────────────────────────────
  
  const [projectName, setProjectName] = useState('')

  // ─── STATE FOR FEEDBACK ───────────────────────────────────────────────────────
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ═══════════════════════════════════════════════════════════════════════════════
  // FORM HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════════

  async function handleAddTask(e) {
    e.preventDefault()
    setError('')

    if (!taskDescription.trim()) {
      setError('Task description is required')
      return
    }

    if (!projectId || !userId) {
      setError('Please select a project and user first')
      return
    }

    setLoading(true)

    const success = await addTask({
      description: taskDescription,
      projectId: projectId,
      userId: userId,
      color: taskColor,
      points: taskPoints,
      sprintNum: taskSprint,
      complete: false
    })

    setLoading(false)

    if (success) {
      // Clear form
      setTaskDescription('')
      setTaskColor('blue')
      setTaskPoints(0)
      setTaskSprint(1)
      
      // Notify parent component
      if (onSuccess) onSuccess('task')
      
      // Close modal
      onClose()
    } else {
      setError('Failed to add task. Please try again.')
    }
  }

  async function handleAddUser(e) {
    e.preventDefault()
    setError('')

    if (!userUsername.trim()) {
      setError('Username is required')
      return
    }

    if (!projectId) {
      setError('Please select a project first')
      return
    }

    setLoading(true)

    // Generate new user ID
    const newUserId = Math.floor(Math.random() * 1000000) + 1000

    const userSuccess = await addUser({
      userId: newUserId,
      username: userUsername,
      alias: userAlias || null,
      email: userEmail || null,
      phoneNumber: userPhone || null
    })

    if (!userSuccess) {
      setLoading(false)
      setError('Failed to add user. Please try again.')
      return
    }

    // Assign user to the selected project
    const assignSuccess = await assignUserToProject(newUserId, projectId)

    setLoading(false)

    if (assignSuccess) {
      // Clear form
      setUserUsername('')
      setUserAlias('')
      setUserEmail('')
      setUserPhone('')
      
      // Notify parent
      if (onSuccess) onSuccess('user')
      
      // Close modal
      onClose()
    } else {
      setError('User created but failed to assign to project.')
    }
  }

  async function handleAddProject(e) {
    e.preventDefault()
    setError('')

    if (!projectName.trim()) {
      setError('Project name is required')
      return
    }

    setLoading(true)

    // Generate new project ID (random number to avoid conflicts)
    const newProjectId = Math.floor(Math.random() * 1000000) + 1000

    const success = await addProject({
      projectId: newProjectId,
      projectName: projectName,
      createdAt: new Date().toISOString()
    })

    setLoading(false)

    if (success) {
      // Clear form
      setProjectName('')
      
      // Notify parent
      if (onSuccess) onSuccess('project')
      
      // Close modal
      onClose()
    } else {
      setError('Failed to add project. Please try again.')
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════════

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* ─── HEADER ─────────────────────────────────────────────────────── */}
        <div className="modal-header">
          <h2>Add New Item</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* ─── TAB BUTTONS ────────────────────────────────────────────────── */}
        <div className="modal-tabs">
          <button 
            className={currentTab === 'task' ? 'tab-active' : ''}
            onClick={() => setCurrentTab('task')}
            disabled={!projectId || !userId}
          >
            Task
          </button>
          <button 
            className={currentTab === 'user' ? 'tab-active' : ''}
            onClick={() => setCurrentTab('user')}
          >
            User
          </button>
          <button 
            className={currentTab === 'project' ? 'tab-active' : ''}
            onClick={() => setCurrentTab('project')}
          >
            Project
          </button>
        </div>

        {/* ─── ERROR MESSAGE ──────────────────────────────────────────────── */}
        {error && (
          <div className="modal-error">
            {error}
          </div>
        )}

        {/* ─── FORMS ──────────────────────────────────────────────────────── */}
        <div className="modal-body">
          
          {/* ─── TASK FORM ──────────────────────────────────────────────── */}
          {currentTab === 'task' && (
            <form onSubmit={handleAddTask}>
              <div className="form-group">
                <label>Description *</label>
                <input 
                  type="text"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Enter task description"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Color</label>
                  <select 
                    value={taskColor}
                    onChange={(e) => setTaskColor(e.target.value)}
                  >
                    <option value="red">Red</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="yellow">Yellow</option>
                    <option value="orange">Orange</option>
                    <option value="purple">Purple</option>
                    <option value="gray">Gray</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Points</label>
                  <input 
                    type="number"
                    value={taskPoints}
                    onChange={(e) => setTaskPoints(Number(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>

                <div className="form-group">
                  <label>Sprint</label>
                  <input 
                    type="number"
                    value={taskSprint}
                    onChange={(e) => setTaskSprint(Number(e.target.value))}
                    min="1"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          )}

          {/* ─── USER FORM ──────────────────────────────────────────────── */}
          {currentTab === 'user' && (
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Username *</label>
                <input 
                  type="text"
                  value={userUsername}
                  onChange={(e) => setUserUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="form-group">
                <label>Display Name (Alias)</label>
                <input 
                  type="text"
                  value={userAlias}
                  onChange={(e) => setUserAlias(e.target.value)}
                  placeholder="Enter display name"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="555-0000"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          )}

          {/* ─── PROJECT FORM ───────────────────────────────────────────── */}
          {currentTab === 'project' && (
            <form onSubmit={handleAddProject}>
              <div className="form-group">
                <label>Project Name *</label>
                <input 
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Project'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}

export default AddItemModal
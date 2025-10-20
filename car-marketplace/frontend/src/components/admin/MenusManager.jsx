import { useState, useEffect } from 'react'

function MenusManager() {
  const [menus, setMenus] = useState([])
  const [editingMenu, setEditingMenu] = useState(null)
  const [saveMessage, setSaveMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/menus', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setMenus(data)
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setLoading(false)
    }
  }

  const handleEdit = (menu) => {
    setEditingMenu(JSON.parse(JSON.stringify(menu)))
  }

  const handleAddItem = () => {
    const newItem = {
      id: Date.now().toString(),
      label: '',
      url: '',
      order: editingMenu.items.length + 1
    }
    setEditingMenu({
      ...editingMenu,
      items: [...editingMenu.items, newItem]
    })
  }

  const handleItemChange = (itemId, field, value) => {
    setEditingMenu({
      ...editingMenu,
      items: editingMenu.items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    })
  }

  const handleDeleteItem = (itemId) => {
    setEditingMenu({
      ...editingMenu,
      items: editingMenu.items.filter(item => item.id !== itemId)
    })
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/admin/menus/${editingMenu.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingMenu)
      })

      if (response.ok) {
        setSaveMessage('✅ Menu enregistré avec succès !')
        fetchMenus()
        setEditingMenu(null)
        setTimeout(() => setSaveMessage(''), 3000)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setSaveMessage('❌ Erreur lors de l\'enregistrement')
    }
  }

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h1>Gestion des menus</h1>
      </div>

      {saveMessage && (
        <div className={`admin-message ${saveMessage.includes('✅') ? 'success' : 'error'}`}>
          {saveMessage}
        </div>
      )}

      <div className="menus-grid">
        {menus.map(menu => (
          <div key={menu.id} className="menu-card">
            <div className="menu-card-header">
              <div>
                <h3>{menu.name}</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                  Emplacement: <code>{menu.location}</code>
                </p>
              </div>
              <button
                className="btn btn-primary btn-small"
                onClick={() => handleEdit(menu)}
              >
                ✏️ Modifier
              </button>
            </div>
            <div className="menu-items-preview">
              {menu.items.map(item => (
                <div key={item.id} className="menu-item-preview">
                  <strong>{item.label}</strong>
                  <span style={{ color: '#666', fontSize: '0.85rem' }}>{item.url}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {editingMenu && (
        <div className="modal-overlay" onClick={() => setEditingMenu(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Modifier le menu: {editingMenu.name}</h2>
              <button className="modal-close" onClick={() => setEditingMenu(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="menu-items-editor">
                {editingMenu.items.map((item, index) => (
                  <div key={item.id} className="menu-item-editor">
                    <div className="menu-item-number">{index + 1}</div>
                    <div className="menu-item-fields">
                      <input
                        type="text"
                        placeholder="Label"
                        className="form-input"
                        value={item.label}
                        onChange={(e) => handleItemChange(item.id, 'label', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="URL (ex: /page/contact)"
                        className="form-input"
                        value={item.url}
                        onChange={(e) => handleItemChange(item.id, 'url', e.target.value)}
                      />
                    </div>
                    <button
                      className="btn-delete-item"
                      onClick={() => handleDeleteItem(item.id)}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-secondary"
                onClick={handleAddItem}
                style={{ marginTop: '1rem' }}
              >
                + Ajouter un élément
              </button>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setEditingMenu(null)}
              >
                Annuler
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MenusManager

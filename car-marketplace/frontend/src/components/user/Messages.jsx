import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Messages({ updateUnreadCount }) {
  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    const token = localStorage.getItem('userToken')

    try {
      const response = await fetch('/api/messages/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      setConversations(data)
      setLoading(false)
      if (updateUnreadCount) {
        updateUnreadCount()
      }
    } catch (error) {
      console.error('Erreur:', error)
      setLoading(false)
    }
  }

  const openConversation = async (conv) => {
    setSelectedConv(conv)

    const token = localStorage.getItem('userToken')

    try {
      const response = await fetch(`/api/messages/conversation/${conv.conversationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      setMessages(data)
      fetchConversations() // Refresh pour mettre à jour le compteur non lus
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    const token = localStorage.getItem('userToken')

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          carId: selectedConv.carId,
          receiverId: selectedConv.otherUser.id,
          message: newMessage
        })
      })

      setNewMessage('')
      openConversation(selectedConv)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <div className="user-section">
      <h1 style={{ marginBottom: '2rem' }}>💬 Messagerie</h1>

      {conversations.length === 0 ? (
        <div className="empty-state">
          <h3>Aucune conversation</h3>
          <p>Vous n'avez pas encore de messages</p>
        </div>
      ) : (
        <div className="messages-layout">
          <div className="conversations-list">
            <h3 style={{ marginBottom: '1rem', padding: '0 1rem', color: 'var(--secondary-color)' }}>
              Conversations
            </h3>
            {conversations.map(conv => (
              <div
                key={conv.conversationId}
                className={`conversation-item ${selectedConv?.conversationId === conv.conversationId ? 'active' : ''}`}
                onClick={() => openConversation(conv)}
              >
                <div className="conversation-header">
                  <strong>
                    {conv.otherUser ? `${conv.otherUser.firstName} ${conv.otherUser.lastName}` : 'Utilisateur inconnu'}
                  </strong>
                  {conv.unreadCount > 0 && (
                    <span className="badge">{conv.unreadCount}</span>
                  )}
                </div>
                <div className="conversation-car" style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem' }}>
                  {conv.carTitle}
                </div>
                <div className="conversation-preview">
                  {conv.latestMessage}
                </div>
                <div className="conversation-date">
                  {new Date(conv.latestMessageDate).toLocaleDateString('fr-FR')}
                </div>
              </div>
            ))}
          </div>

          <div className="messages-panel">
            {selectedConv ? (
              <>
                <div className="messages-header">
                  <div>
                    <strong>
                      {selectedConv.otherUser ? `${selectedConv.otherUser.firstName} ${selectedConv.otherUser.lastName}` : 'Utilisateur inconnu'}
                    </strong>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      <Link to={`/car/${selectedConv.carId}`} style={{ color: 'var(--primary-color)' }}>
                        {selectedConv.carTitle}
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="messages-body">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`message-bubble ${msg.senderId === selectedConv.otherUser.id ? 'received' : 'sent'}`}
                    >
                      <div className="message-content">{msg.message}</div>
                      <div className="message-time">
                        {new Date(msg.createdAt).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  ))}
                </div>

                <form className="messages-input" onSubmit={sendMessage}>
                  <input
                    type="text"
                    placeholder="Écrivez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="form-input"
                  />
                  <button type="submit" className="btn btn-primary">
                    Envoyer
                  </button>
                </form>
              </>
            ) : (
              <div className="empty-state">
                <p>Sélectionnez une conversation pour voir les messages</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Messages

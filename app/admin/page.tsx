'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select } from "@/components/ui/select"

export default function AdminDashboard() {
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [adminAccounts, setAdminAccounts] = useState([])
  const [selectedModel, setSelectedModel] = useState('')
  const [apiKey, setApiKey] = useState('')
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated' || (session && !session.user.isAdmin)) {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user.isAdmin) {
      fetchAdminAccounts()
    }
  }, [session])

  const fetchAdminAccounts = async () => {
    const response = await fetch('/api/admin/accounts')
    if (response.ok) {
      const data = await response.json()
      setAdminAccounts(data)
    }
  }

  const handleAddAdmin = async () => {
    const response = await fetch('/api/admin/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newAdminEmail }),
    })

    if (response.ok) {
      fetchAdminAccounts()
      setNewAdminEmail('')
    }
  }

  const handleRemoveAdmin = async (userId: string) => {
    const response = await fetch(`/api/admin/accounts/${userId}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      fetchAdminAccounts()
    }
  }

  const handleFileUpload = async (event) => {
    const files = event.target.files
    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }

    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    })

    if (response.ok) {
      alert('Files uploaded successfully')
    }
  }

  const handleTranscribe = async () => {
    const response = await fetch('/api/admin/transcribe', {
      method: 'POST',
    })

    if (response.ok) {
      alert('Transcription process started')
    }
  }

  const handleCreateEmbeddings = async () => {
    const response = await fetch('/api/admin/create-embeddings', {
      method: 'POST',
    })

    if (response.ok) {
      alert('Embeddings creation process started')
    }
  }

  const handleModelSelection = async () => {
    // TODO: Implement model selection logic
    alert(`Model ${selectedModel} selected with API key ${apiKey}`)
  }

  if (status === 'loading' || !session?.user.isAdmin) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <Card className="p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2">Manage Admin Accounts</h2>
        <div className="flex space-x-2 mb-2">
          <Input
            type="email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            placeholder="New admin email"
          />
          <Button onClick={handleAddAdmin}>Add Admin</Button>
        </div>
        <ul>
          {adminAccounts.map((admin) => (
            <li key={admin.id} className="flex justify-between items-center mb-2">
              {admin.email}
              <Button onClick={() => handleRemoveAdmin(admin.id)} variant="destructive">Remove</Button>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2">File Management</h2>
        <Input type="file" multiple onChange={handleFileUpload} className="mb-2" />
        <Button onClick={handleTranscribe}>Transcribe Files</Button>
      </Card>

      <Card className="p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2">Embeddings</h2>
        <Button onClick={handleCreateEmbeddings}>Create Pre-computed Embeddings</Button>
      </Card>

      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-2">LLM Model Selection</h2>
        <Select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="mb-2"
        >
          <option value="">Select a model</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gpt-4">GPT-4</option>
        </Select>
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="API Key"
          className="mb-2"
        />
        <Button onClick={handleModelSelection}>Set Model</Button>
      </Card>
    </div>
  )
}
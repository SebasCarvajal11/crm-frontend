import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  fetchStorageTree,
  purgeStorageFile,
  purgeStorageBatch,
  type StorageTreeResponse,
  type PurgeBatchInput,
  type PurgeResult,
} from '../api/admin-storage-explorer.api'

export function useAdminStorageExplorer(accessToken: string) {
  const [data, setData] = useState<StorageTreeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClientSub, setSelectedClientSub] = useState<string | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [isPurging, setIsPurging] = useState(false)

  const loadTree = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    setError(null)
    try {
      const tree = await fetchStorageTree(accessToken)
      setData(tree)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar estructura de almacenamiento'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    let mounted = true
    if (!accessToken) return

    fetchStorageTree(accessToken)
      .then((tree) => {
        if (!mounted) return
        setData(tree)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (!mounted) return
        const msg = err instanceof Error ? err.message : 'Error al cargar estructura de almacenamiento'
        setError(msg)
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [accessToken])

  const filteredClients = useMemo(() => {
    if (!data) return []
    const term = searchTerm.trim().toLowerCase()
    if (!term) return data.clients

    return data.clients
      .map((client) => {
        const clientMatches = client.clientName.toLowerCase().includes(term)
        const matchingProjects = client.projects.filter(
          (p) =>
            p.projectName.toLowerCase().includes(term) ||
            Object.values(p.folders ?? {}).some((f) =>
              f.files.some((file) => file.fileName.toLowerCase().includes(term))
            )
        )
        if (clientMatches || matchingProjects.length > 0) {
          return {
            ...client,
            projects: clientMatches ? client.projects : matchingProjects,
          }
        }
        return null
      })
      .filter(Boolean) as typeof data.clients
  }, [data, searchTerm])

  const activeClient = useMemo(() => {
    if (!data) return null
    return (
      data.clients.find((c) => c.clientSub === selectedClientSub) ??
      data.clients[0] ??
      null
    )
  }, [data, selectedClientSub])

  const activeProject = useMemo(() => {
    if (!activeClient) return null
    if (!selectedProjectId) return activeClient.projects[0] ?? null
    return (
      activeClient.projects.find((p) => p.projectId === selectedProjectId) ??
      activeClient.projects[0] ??
      null
    )
  }, [activeClient, selectedProjectId])

  const projectAllFiles = useMemo(() => {
    if (!activeProject) return []
    return Object.values(activeProject.folders ?? {}).flatMap((f) => f.files)
  }, [activeProject])

  const projectStats = useMemo(() => {
    const totalFiles = projectAllFiles.length
    const activeFilesCount = projectAllFiles.filter((f) => !f.isPurged).length
    const purgedFilesCount = projectAllFiles.filter((f) => f.isPurged).length
    const purgedBytes = projectAllFiles
      .filter((f) => f.isPurged)
      .reduce((acc, f) => acc + f.sizeBytes, 0)
    return {
      totalFiles,
      activeFilesCount,
      purgedFilesCount,
      purgedBytes,
      activeBytes: activeProject?.totalBytes ?? 0,
    }
  }, [projectAllFiles, activeProject])

  const activeFiles = useMemo(() => {
    if (!activeProject) return []
    const baseFiles =
      selectedFolder && activeProject.folders?.[selectedFolder]
        ? activeProject.folders[selectedFolder].files
        : projectAllFiles

    const term = searchTerm.trim().toLowerCase()
    if (!term) return baseFiles

    return baseFiles.filter(
      (f) =>
        f.fileName.toLowerCase().includes(term) ||
        (f.taskTitle && f.taskTitle.toLowerCase().includes(term))
    )
  }, [activeProject, selectedFolder, projectAllFiles, searchTerm])

  const handlePurgeFile = useCallback(
    async (fileId: string, reason?: string, forcePurgeSigned?: boolean) => {
      setIsPurging(true)
      try {
        const res = await purgeStorageFile(
          accessToken,
          fileId,
          reason,
          forcePurgeSigned
        )
        await loadTree()
        return res
      } finally {
        setIsPurging(false)
      }
    },
    [accessToken, loadTree]
  )

  const handlePurgeBatch = useCallback(
    async (input: PurgeBatchInput): Promise<PurgeResult> => {
      setIsPurging(true)
      try {
        const res = await purgeStorageBatch(accessToken, input)
        await loadTree()
        return res
      } finally {
        setIsPurging(false)
      }
    },
    [accessToken, loadTree]
  )

  return {
    data,
    loading,
    error,
    isPurging,
    searchTerm,
    setSearchTerm,
    selectedClientSub,
    setSelectedClientSub,
    selectedProjectId,
    setSelectedProjectId,
    selectedFolder,
    setSelectedFolder,
    filteredClients,
    activeClient,
    activeProject,
    activeFiles,
    projectStats,
    refresh: loadTree,
    purgeFile: handlePurgeFile,
    purgeBatch: handlePurgeBatch,
  }
}

'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Trash2, Upload, Eye, EyeOff, ImageIcon, X } from 'lucide-react'
import { PageHeader, Modal, Pagination } from '@/components/ui'
import { galleryApi } from '@/lib/api'

const PAGE_SIZE = 20

export default function GalleryPage() {
  const [data, setData]         = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // Upload modal
  const [modalOpen, setModal]   = useState(false)
  const [files, setFiles]       = useState([])
  const [previews, setPreviews] = useState([])
  const [status, setStatus]     = useState(1)
  const [saving, setSaving]     = useState(false)
  const fileInputRef            = useRef(null)

  // Delete confirm
  const [deleteId, setDeleteId]     = useState(null)
  const [deleting, setDeleting]     = useState(false)
  const [confirmOpen, setConfirm]   = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const fetchGallery = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res    = await galleryApi.list({ page, page_size: PAGE_SIZE })
      const result = res.result || res
      setData(
        Array.isArray(result.images)  ? result.images  :
        Array.isArray(result.gallery) ? result.gallery :
        Array.isArray(result.data)    ? result.data    :
        Array.isArray(result)         ? result         : []
      )
      setTotal(result.total ?? result.count ?? 0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchGallery() }, [fetchGallery])

  const openUpload = () => {
    setFiles([]); setPreviews([]); setStatus(1)
    setModal(true)
  }

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files)
    if (!selected.length) return
    setFiles(selected)
    setPreviews(selected.map(f => URL.createObjectURL(f)))
  }

  const removeFile = (idx) => {
    setFiles(f => f.filter((_, i) => i !== idx))
    setPreviews(p => p.filter((_, i) => i !== idx))
  }

  const handleUpload = async () => {
    if (!files.length) { alert('Please select at least one image.'); return }
    setSaving(true)
    try {
      await galleryApi.create(files, status)
      setModal(false)
      setPage(1)
      fetchGallery()
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const toggleStatus = async (item) => {
    const newStatus = item.status === 1 ? 0 : 1
    try {
      await galleryApi.update(item.gallery_id ?? item.id, { status: newStatus })
      setData(d => d.map(r => (r.gallery_id ?? r.id) === (item.gallery_id ?? item.id) ? { ...r, status: newStatus } : r))
    } catch (e) { alert(e.message) }
  }

  const confirmDelete = (id) => { setDeleteId(id); setConfirm(true) }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await galleryApi.delete(deleteId)
      setConfirm(false)
      fetchGallery()
    } catch (e) { alert(e.message) }
    finally { setDeleting(false) }
  }

  const imgUrl = (item) => {
    const id = item.gallery_id ?? item.id
    return item.image_url || item.file_url || galleryApi.imageUrl(id)
  }

  return (
    <div>
      <PageHeader
        title="Gallery"
        subtitle="Manage school photo gallery"
        action={
          <button onClick={openUpload} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Upload Images
          </button>
        }
      />

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

      {loading ? (
        <div className="card p-12 text-center text-gray-400 text-sm">Loading...</div>
      ) : data.length === 0 ? (
        <div className="card p-12 text-center">
          <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No images yet. Click Upload Images to add photos.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {data.map(item => {
              const id = item.gallery_id ?? item.id
              return (
                <div key={id} className="card overflow-hidden group relative">
                  {/* Image */}
                  <div className="relative h-44 bg-gray-100 overflow-hidden">
                    <img
                      src={imgUrl(item)}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                    />
                    <div className="hidden w-full h-full items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-gray-300" />
                    </div>

                    {/* Overlay actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleStatus(item)}
                        title={item.status === 1 ? 'Deactivate' : 'Activate'}
                        className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-700"
                      >
                        {item.status === 1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => confirmDelete(id)}
                        title="Delete"
                        className="p-2 rounded-full bg-white/90 hover:bg-white text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      item.status === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.status === 1 ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-400">#{id}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </>
      )}

      {/* Upload Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModal(false)}
        title="Upload Images"
        footer={
          <>
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleUpload} className="btn-primary flex items-center gap-2" disabled={saving || !files.length}>
              {saving ? 'Uploading...' : <><Upload className="w-4 h-4" /> Upload</>}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select className="input" value={status} onChange={e => setStatus(Number(e.target.value))}>
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>

          {/* File picker */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Images <span className="text-red-500">*</span>
            </label>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-primary-400 transition-colors">
              <Upload className="w-7 h-7 text-gray-300" />
              <span className="text-sm text-gray-400">Click to select images (multiple allowed)</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {previews.map((src, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden h-24 bg-gray-100 group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {files.length > 0 && (
            <p className="text-xs text-gray-500">{files.length} image{files.length > 1 ? 's' : ''} selected</p>
          )}
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirm(false)}
        title="Delete Image"
        footer={
          <>
            <button onClick={() => setConfirm(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="btn-primary bg-red-600 hover:bg-red-700 focus:ring-red-500" disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">Are you sure you want to delete this image? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}

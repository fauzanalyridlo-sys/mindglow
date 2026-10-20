
import { useState, type FormEvent } from 'react'
import '../styles/akademik.css'
import '../styles/akademik-animation.css'

import learningImage from '../assets/Learning.svg'
import successIcon from '../icons/Berhasil.svg'
import deleteIcon from '../icons/Sampah.svg'
import calendarIcon from '../icons/Kalender.svg'
import groupIcon from '../icons/Kelompok.svg'
import individualIcon from '../icons/Individu.svg'

type Task = {
  id: number
  name: string
  course: string
  deadline: string
  priority: 'Rendah' | 'Sedang' | 'Tinggi'
  type: 'Kelompok' | 'Individu'
  completed: boolean
}

type Notice = {
  title: string
  message: string
  icon: string
  variant: 'success' | 'delete'
}

const initialTasks: Task[] = [
  {
    id: 1,
    name: 'Makalah Proyek Sistem Web',
    course: 'Pemrograman Web',
    deadline: '2026-10-01',
    priority: 'Tinggi',
    type: 'Kelompok',
    completed: false,
  },
  {
    id: 2,
    name: 'Rekayasa Perangkat Lunak',
    course: 'Pemrograman Web',
    deadline: '2026-10-01',
    priority: 'Tinggi',
    type: 'Individu',
    completed: false,
  },
]

export default function AkademikPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const [name, setName] = useState('')
  const [course, setCourse] = useState('')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState<Task['priority'] | ''>('')
  const [type, setType] = useState<Task['type'] | ''>('')

  const resetForm = () => {
    setName('')
    setCourse('')
    setDeadline('')
    setPriority('')
    setType('')
  }

  const closeForm = () => {
    setIsFormOpen(false)
    resetForm()
  }

  const saveTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim() || !course.trim() || !deadline || !priority || !type) {
      return
    }

    const newTask: Task = {
      id: Date.now(),
      name: name.trim(),
      course: course.trim(),
      deadline,
      priority,
      type,
      completed: false,
    }

    setTasks((current) => [...current, newTask])
    closeForm()

    setNotice({
      title: 'Berhasil!',
      message: 'Tugas berhasil ditambahkan ke daftar.',
      icon: successIcon,
      variant: 'success',
    })
  }

  const markCompleted = (task: Task) => {
    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? { ...item, completed: !item.completed }
          : item,
      ),
    )

    if (!task.completed) {
      setNotice({
        title: 'Berhasil!',
        message: 'Tugas telah ditandai sebagai selesai.',
        icon: successIcon,
        variant: 'success',
      })
    }
  }

  const confirmDelete = () => {
    if (deleteId === null) return

    setTasks((current) => current.filter((task) => task.id !== deleteId))
    setDeleteId(null)

    setNotice({
      title: 'Berhasil dihapus!',
      message: 'Tugas telah dihapus dari daftar.',
      icon: deleteIcon,
      variant: 'delete',
    })
  }

  const formatDate = (date: string) => {
    if (!date) return ''

    const [year, month, day] = date.split('-')
    return `${day}-${month}-${year}`
  }

  const buttonShine = (
    <span className="academic-button-shine" aria-hidden="true" />
  )

  return (
    <main className="academic-page">
      <section className="academic-hero">
        <div className="academic-hero-copy">
          <h1>Agenda Akademik</h1>
          <p>
            Catat dan atur tugas kuliah, deadline,
            <br className="academic-desktop-break" />
            serta prioritasmu dalam satu tempat.
          </p>

          <button
            className="academic-button academic-primary"
            type="button"
            onClick={() => setIsFormOpen(true)}
          >
            {buttonShine}
            <span className="academic-plus" aria-hidden="true">
              ＋
            </span>
            <span>Tambah Tugas Baru</span>
          </button>
        </div>

        <img
          className="academic-hero-image academic-learning-image"
          src={learningImage}
          alt="Ilustrasi mahasiswa sedang belajar"
        />
      </section>

      <section className="academic-task-list" aria-label="Daftar tugas">
        {tasks.length === 0 ? (
          <p className="academic-empty">
            Belum ada tugas. Tambahkan tugas pertamamu!
          </p>
        ) : (
          tasks.map((task) => (
            <article
              className={`academic-task-card${task.completed ? ' task-completed' : ''}`}
              key={task.id}
            >
              <div className="academic-task-top">
                <span
                  className={`academic-priority priority-${task.priority.toLowerCase()}`}
                >
                  {task.priority}
                </span>

                <span className="academic-task-type">
                  <img
                    src={task.type === 'Kelompok' ? groupIcon : individualIcon}
                    alt=""
                    aria-hidden="true"
                  />
                  <span>{task.type}</span>
                </span>
              </div>

              <h2>{task.name}</h2>

              <div className="academic-task-meta">
                <span>{task.course}</span>

                <time dateTime={task.deadline}>
                  <img src={calendarIcon} alt="" />
                  {formatDate(task.deadline)}
                </time>
              </div>

              <div className="academic-task-actions">
                <button
                  className="academic-button academic-complete"
                  type="button"
                  onClick={() => markCompleted(task)}
                >
                  {buttonShine}
                  <span>
                    {task.completed ? '↶ Batalkan Selesai' : '✓ Tandai Selesai'}
                  </span>
                </button>

                <button
                  className="academic-button academic-delete"
                  type="button"
                  onClick={() => setDeleteId(task.id)}
                >
                  {buttonShine}
                  <img src={deleteIcon} alt="" />
                  <span>Hapus</span>
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      {isFormOpen && (
        <div
          className="academic-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm()
          }}
        >
          <form
            className="academic-modal academic-form"
            onSubmit={saveTask}
            role="dialog"
            aria-modal="true"
            aria-labelledby="academic-form-title"
          >
            <div className="academic-modal-heading">
              <span className="academic-modal-kicker">AGENDA KULIAH</span>
              <h2 id="academic-form-title">Tambah Tugas Baru</h2>
              <p>Lengkapi detail tugas dan atur prioritasmu.</p>
            </div>

            <label>
              Nama Tugas
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Masukkan nama tugas kamu"
                required
              />
            </label>

            <label>
              Mata Kuliah
              <input
                value={course}
                onChange={(event) => setCourse(event.target.value)}
                placeholder="Masukkan mata kuliah kamu"
                required
              />
            </label>

            <label>
              Deadline
              <input
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                required
              />
            </label>

            <div className="academic-form-selects">
              <label>
                Prioritas
                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as Task['priority'] | '')
                  }
                  required
                >
                  <option value="">Pilih Prioritas</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Rendah">Rendah</option>
                </select>
              </label>

              <label>
                Jenis Tugas
                <select
                  value={type}
                  onChange={(event) =>
                    setType(event.target.value as Task['type'] | '')
                  }
                  required
                >
                  <option value="">Pilih jenis tugas</option>
                  <option value="Kelompok">Kelompok</option>
                  <option value="Individu">Individu</option>
                </select>
              </label>
            </div>

            <div className="academic-form-actions">
              <button
                className="academic-button academic-secondary"
                type="button"
                onClick={closeForm}
              >
                {buttonShine}
                <span>Batal</span>
              </button>

              <button
                className="academic-button academic-primary"
                type="submit"
              >
                {buttonShine}
                <span>Simpan Tugas</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteId !== null && (
        <div className="academic-overlay">
          <div
            className="academic-modal academic-confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="academic-delete-title"
          >
            <div className="academic-popup-icon academic-popup-delete">
              <img
                className="academic-popup-delete-image"
                src={deleteIcon}
                alt=""
              />
            </div>

            <span className="academic-modal-kicker">KONFIRMASI</span>
            <h2 id="academic-delete-title">Hapus Tugas?</h2>
            <p>Tugas ini akan dihapus dari daftar akademikmu.</p>

            <div className="academic-form-actions">
              <button
                className="academic-button academic-secondary"
                type="button"
                onClick={() => setDeleteId(null)}
              >
                {buttonShine}
                <span>Batal</span>
              </button>

              <button
                className="academic-button academic-delete"
                type="button"
                onClick={confirmDelete}
              >
                {buttonShine}
                <img src={deleteIcon} alt="" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {notice && (
        <div className="academic-overlay">
          <div
            className="academic-modal academic-notice"
            role="dialog"
            aria-modal="true"
            aria-labelledby="academic-notice-title"
          >
            <div
              className={`academic-popup-icon ${
                notice.variant === 'delete'
                  ? 'academic-popup-delete'
                  : 'academic-popup-success'
              }`}
            >
              <img
                src={notice.icon}
                alt=""
                className={
                  notice.variant === 'delete'
                    ? 'academic-popup-delete-image'
                    : undefined
                }
              />
            </div>

            <span className="academic-modal-kicker">AGENDA AKADEMIK</span>
            <h2 id="academic-notice-title">{notice.title}</h2>
            <p>{notice.message}</p>

            <button
              className="academic-button academic-primary academic-notice-button"
              type="button"
              onClick={() => setNotice(null)}
            >
              {buttonShine}
              <span>Oke</span>
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

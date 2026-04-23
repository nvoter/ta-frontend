import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import { useRef } from 'react'

interface FileUploadFieldProps {
  accept: string
  error?: string
  fileNames?: string[]
  files?: File[]
  hint: string
  inputId: string
  multiple?: boolean
  resetLabel?: string
  selectedTitle?: string
  title: string
  onChange: (files: File[]) => void
}

export function FileUploadField({
  accept,
  error,
  fileNames,
  files = [],
  hint,
  inputId,
  multiple = false,
  resetLabel = 'Сбросить файл',
  selectedTitle = 'Файл загружен',
  title,
  onChange,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const selectedNames = fileNames ?? files.map((file) => file.name)
  const selectedFilesLabel = selectedNames.join(', ')

  return (
    <>
      <label
        className={[
          'file-dropzone',
          selectedNames.length > 0 ? 'file-dropzone--selected' : '',
          error ? 'file-dropzone--error' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        htmlFor={inputId}
      >
        <input
          ref={inputRef}
          accept={accept}
          className="file-dropzone__input"
          id={inputId}
          multiple={multiple}
          type="file"
          onChange={(event) => {
            onChange(Array.from(event.target.files ?? []))
            event.target.value = ''
          }}
        />
        <span className="file-dropzone__icon" aria-hidden="true">
          <CloudUploadOutlinedIcon fontSize="inherit" />
        </span>
        <span className="file-dropzone__title">
          {selectedNames.length > 0 ? selectedTitle : title}
        </span>
        <span className="file-dropzone__description">
          {selectedNames.length > 0 ? selectedFilesLabel : hint}
        </span>
      </label>

      {selectedNames.length > 0 ? (
        <div className="file-dropzone__actions">
          <button
            className="auth-form__button auth-form__button--secondary file-dropzone__reset"
            type="button"
            onClick={() => {
              onChange([])

              if (inputRef.current) {
                inputRef.current.value = ''
              }
            }}
          >
            {resetLabel}
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="auth-form__error-box" role="alert">
          <p className="auth-form__error">{error}</p>
        </div>
      ) : null}
    </>
  )
}

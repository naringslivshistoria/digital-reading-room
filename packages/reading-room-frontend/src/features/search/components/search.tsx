import { useState } from 'react'
import { Button } from '@mui/material'

interface ChangeFunc {
  (query: string) : void
}

interface ISearchProps {
  onChange: ChangeFunc
  placeholder: string
}

export const Search = ({
  onChange,
  placeholder,
}: ISearchProps) => {
  const [query, setQuery] = useState<string|null>(null)

  const search = () => {
    if (query) {
      onChange(query)
    }
  }
  
  const onSubmit = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      setQuery((event.target as HTMLInputElement).value)
      search()
    }
  }

  return (
    <div className="flex flex-col justify-between rounded-lg px-10 py-4 md:pb-4">
      <input
        className="form-control p-4"
        placeholder={placeholder}
        type="text"
        onKeyDown={onSubmit}
      />
      <Button variant="contained" onClick={() => search()}>Sök</Button>
    </div>
  );
};
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
    setQuery((event.target as HTMLInputElement).value)
    console.log('query is now', query)

    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      search()
    }
  }

  return (
    <div className="flex flex-row rounded-lg space-x-5">
      <input
        className="basis-5/6 form-control p-4 mx-1"
        placeholder={placeholder}
        type="text"
        onKeyUp={onSubmit}
      />
      <Button variant="contained" className="basis-1/6 mx-1" onClick={() => search()}>Sök</Button>
    </div>
  );
};
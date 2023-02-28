import * as React from 'react';

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
  const onSubmit = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      onChange((event.target as HTMLInputElement).value)
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
    </div>
  );
};
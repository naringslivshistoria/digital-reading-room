import * as React from 'react';

interface ISearchProps {
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
}

export const Search = ({
  onChange,
  placeholder,
}: ISearchProps) => {
  return (
    <div className="flex flex-col justify-between rounded-lg px-10 py-4 md:pb-4">
      <input
        className="form-control p-4"
        placeholder={placeholder}
        type="text"
        onChange={onChange}
      />
    </div>
  );
};
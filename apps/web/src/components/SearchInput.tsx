import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface SearchInputFields {
  value: string;
  name: string;
  placeholder: string;
  onChange: (value: string) => void;
}

export const SearchInput = (props: SearchInputFields) => {
  const { value, name, placeholder, onChange } = props;

  return (
    <div className='flex py-2 px-2 mb-1 mx-3 border rounded'>
      <FontAwesomeIcon icon={faSearch} className='h-6 w-6 mr-2' color='#A9A9AC' />
      <input
        name={name}
        type='text'
        value={value}
        onChange={e => onChange(e.target.value)}
        className='grow focus:outline-none'
        placeholder={placeholder}
      />
    </div>
  );
};

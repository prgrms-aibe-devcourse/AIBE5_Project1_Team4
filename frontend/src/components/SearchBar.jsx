import { Form, InputGroup, Button } from 'react-bootstrap';
import { Search } from 'lucide-react';

const SearchBar = ({
  value,
  onChange,
  onSubmit,
  placeholder = '여행지를 검색하세요...',
}) => {
  return (
    <div className="search-bar-container mb-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.();
        }}
      >
        <InputGroup>
          <Form.Control
            type="text"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            aria-label="검색"
          />
          <Button variant="primary" type="submit">
            <Search size={20} />
          </Button>
        </InputGroup>
      </form>
    </div>
  );
};

export default SearchBar;

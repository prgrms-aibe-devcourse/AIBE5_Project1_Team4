import { Form, InputGroup, Button } from 'react-bootstrap';
import { Search } from 'lucide-react';

const SearchBar = () => {
  return (
    <div className="search-bar-container mb-3">
      <InputGroup>
        <Form.Control
          type="text"
          placeholder="여행지를 검색하세요..."
          aria-label="검색"
        />
        <Button variant="primary">
          <Search size={20} />
        </Button>
      </InputGroup>
    </div>
  );
};

export default SearchBar;

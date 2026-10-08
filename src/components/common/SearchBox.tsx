import React from 'react';
import { useCases } from '../../context/CaseContext';
import { Search, X } from 'lucide-react';

// Search box above each list (shares one query across views)
export const SearchBox: React.FC<{ placeholder?: string }> = ({ placeholder = 'ค้นหาเลขพัสดุ / Case ID / ร้านค้า...' }) => {
  const { searchQuery, setSearchQuery } = useCases();
  return (
    <div className="list-search">
      <Search size={15} className="list-search-icon" />
      <input
        type="search"
        className="form-control"
        placeholder={placeholder}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        onPaste={e => {
          // Inputs drop line breaks, which would glue a pasted column of tracking numbers together
          const text = e.clipboardData.getData('text');
          if (!/[\r\n]/.test(text)) return;
          e.preventDefault();
          setSearchQuery(text.replace(/\s+/g, ' ').trim());
        }}
        aria-label="ค้นหา"
      />
      {searchQuery && (
        <button type="button" className="list-search-clear" onClick={() => setSearchQuery('')} title="ล้างคำค้นหา">
          <X size={14} />
        </button>
      )}
    </div>
  );
};

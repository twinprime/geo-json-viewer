import React from 'react';
interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
}
export declare const SearchBar: React.FC<SearchBarProps>;
export {};

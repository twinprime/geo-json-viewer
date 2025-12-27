import React from 'react';
import { SearchBar } from './SearchBar';
import { FileTree } from './FileTree';
import { FeatureDetails } from './FeatureDetails';

export const SidePanel: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <SearchBar />
      <FileTree />
      <FeatureDetails />
    </div>
  );
};

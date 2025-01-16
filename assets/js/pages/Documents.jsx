import React from 'react';
import TableDocuments from '@/components/documents/TableDocuments';

const Documents = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📄 Documents analysés</h1>
      <TableDocuments />
    </div>
  );
};

export default Documents;
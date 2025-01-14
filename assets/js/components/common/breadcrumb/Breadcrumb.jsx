import React from 'react';

const Breadcrumb = ({ pageName }) => {
  return (
    <h2 className="text-title-md2 font-semibold text-black text-xl">
      {pageName}
    </h2>
  );
};

export default Breadcrumb;
import React from 'react';
import { FileAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';

const InvestmentActions = ({ loading, onAdd, onDelete, recordId }) => {
  return loading ? (
    <Skeleton.Button active size="small" />
  ) : (
    <div className="flex items-center gap-4">
      <FileAddOutlined
        className="!text-blue-500 hover:!text-blue-700 text-lg cursor-pointer"
        onClick={() => onAdd(recordId)}
      />
      <DeleteOutlined
        className="!text-rose-500 hover:!text-rose-700 text-lg cursor-pointer"
        onClick={() => onDelete(recordId)}
      />
    </div>
  );
};

export default InvestmentActions;

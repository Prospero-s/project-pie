import { BellOutlined } from '@ant-design/icons';
import { Badge, Dropdown, Menu } from 'antd';

const DropdownNotification = () => {
  const menu = (
    <Menu>
      <Menu.Item key="1">
        <span>Notification 1</span>
      </Menu.Item>
      <Menu.Item key="2">
        <span>Notification 2</span>
      </Menu.Item>
      <Menu.Item key="3">
        <span>Notification 3</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']} placement="bottomRight" arrow>
      <Badge className="bg-slate-300 !p-2 !rounded-full !cursor-pointer">
        <BellOutlined className="!text-[25px] hover:text-primary transition-all duration-150" />
      </Badge>
    </Dropdown>
  );
};

export default DropdownNotification;

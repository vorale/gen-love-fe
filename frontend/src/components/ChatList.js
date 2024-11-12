// components/ChatList.js
import React from 'react';
import { List, Avatar } from 'antd';

const contacts = [
  { id: 1, name: 'Alice', avatar: '/avatars/alice.jpg', lastMessage: 'Hello!' },
  { id: 2, name: 'Bob', avatar: '/avatars/bob.jpg', lastMessage: 'How are you?' },
  // 更多联系人数据
];

const ChatList = ({ onSelectContact }) => (
  <List
    itemLayout="horizontal"
    dataSource={contacts}
    renderItem={(contact) => (
      <List.Item onClick={() => onSelectContact(contact)}>
        <List.Item.Meta
          avatar={<Avatar src={contact.avatar} />}
          title={contact.name}
          description={contact.lastMessage}
        />
      </List.Item>
    )}
  />
);

export default ChatList;

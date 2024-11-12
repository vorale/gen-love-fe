// components/ChatWindow.js
import React, { useEffect, useRef } from 'react';
import { List, Avatar } from 'antd';

const ChatWindow = ({ messages }) => {
  const messagesEndRef = useRef(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div style={{ padding: '20px', height: '70vh', overflowY: 'auto', backgroundColor: '#f5f5f5' }}>
      <List
        itemLayout="horizontal"
        dataSource={messages}
        renderItem={(message) => (
          <div
            style={{
              display: 'flex',
              flexDirection: message.senderName === 'Me' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              marginBottom: '10px',
            }}
          >
            <Avatar
              src={message.senderAvatar}
              style={{ margin: message.senderName === 'Me' ? '0 0 0 10px' : '0 10px 0 0' }}
            />
            <div
              style={{
                maxWidth: '60%',
                padding: '10px 15px',
                borderRadius: '10px',
                backgroundColor: message.senderName === 'Me' ? '#9FE8B1' : '#E8E8E8',
                color: '#000',
                wordWrap: 'break-word', // 确保长文本换行
                overflow: 'hidden',
              }}
            >
              {message.text}
            </div>
          </div>
        )}
      />
      {/* 滚动条自动滚动到此元素 */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;

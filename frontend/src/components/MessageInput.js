// components/MessageInput.js
import React, { useState } from 'react';
import { Input, Button } from 'antd';

const MessageInput = ({ onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div style={{ display: 'flex', padding: '10px', backgroundColor: '#fff' }}>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onPressEnter={handleSend}
        placeholder="输入消息..."
      />
      <Button type="primary" onClick={handleSend} style={{ marginLeft: '8px' }}>
        发送
      </Button>
    </div>
  );
};

export default MessageInput;

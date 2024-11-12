// pages/Chat.js
import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';

const { Sider, Content, Footer } = Layout;

const ChatPage = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);

  // 模拟接收消息
  useEffect(() => {
    if (selectedContact) {
      const receiveMessage = () => {
        const mockReceivedMessage = {
          senderName: selectedContact.name,
          senderAvatar: selectedContact.avatar,
          text: '模拟消息内容',
        };
        setMessages((prevMessages) => [...prevMessages, mockReceivedMessage]);
      };

      const interval = setInterval(receiveMessage, 5000); // 每5秒接收一次消息
      return () => clearInterval(interval); // 清除定时器
    }
  }, [selectedContact]);

  // 发送消息
  const handleSendMessage = (text) => {
    const newMessage = {
      senderName: 'Me',
      senderAvatar: '/avatars/me.png',
      text,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider width={250} style={{ backgroundColor: '#fff' }}>
        <ChatList onSelectContact={(contact) => { 
          setSelectedContact(contact); 
          setMessages([]); // 切换联系人时清空聊天记录
        }} />
      </Sider>
      <Layout>
        <Content>
          {selectedContact ? (
            <ChatWindow messages={messages} />
          ) : (
            <div style={{ padding: 20 }}>请选择一个联系人开始聊天</div>
          )}
        </Content>
        <Footer style={{ padding: 0 }}>
          {selectedContact && <MessageInput onSendMessage={handleSendMessage} />}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default ChatPage;

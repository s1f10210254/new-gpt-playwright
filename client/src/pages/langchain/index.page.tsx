import React, { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from 'src/utils/apiClient';
import { returnNull } from 'src/utils/returnNull';
import styles from './index.module.css';
interface ChatWindowProps {
  messages: string[];
  name: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, name }) => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  return (
    <div className={styles.chatWindow}>
      <div className={styles.header}>{name}</div>
      <div className={styles.messages}>
        {messages.map((message, index) => (
          <div key={index} className={styles.message}>
            {message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.footer}>
        <input className={styles.inputField} placeholder="Type a message..." />
      </div>
    </div>
  );
};
const LangChain = () => {
  const [messagesList1, setMessagesList1] = useState<string[]>([]);
  const [messagesList2, setMessagesList2] = useState<string[]>([]);
  const [messagesList3, setMessagesList3] = useState<string[]>([]);

  const playBrwser = async () => {
    await apiClient.playbrwser.$get().catch(returnNull);
  };

  const fetchTweet = async (message: string) => {
    // const res = await apiClient.GPTTweet.$post({ message }).catch(returnNull);
    console.log('aaa');
    const res = await apiClient.GPTTweet.$post({ body: { message } }).catch(returnNull);
    if (res !== null) {
      console.log('fetchTweetが実行!');
      return res;
    }
  };

  //GTPAだけツイートの処理
  const fetchGPTA = useCallback(async () => {
    const res = await apiClient.GPTA.$get().catch(returnNull);

    if (res !== null) {
      setMessagesList1((prevMessages) => {
        const newMessages = [...prevMessages, ...res];
        if (newMessages.length > prevMessages.length) {
          console.log('nweMessages');
          playBrwser();
          fetchTweet(newMessages[newMessages.length - 1]);
        }
        return newMessages;
      });
    }
  }, []);

  const fetchGPTB = async () => {
    const res = await apiClient.GPTB.$get().catch(returnNull);

    if (res !== null) {
      setMessagesList2((prevMessages) => [...prevMessages, ...res]);
    }
  };

  const fetchGPTC = async () => {
    const res = await apiClient.GPTC.$get().catch(returnNull);

    if (res !== null) {
      setMessagesList3((prevMessages) => [...prevMessages, ...res]);
    }
  };

  //GPTAの呼び出し＝50秒に１回
  useEffect(() => {
    const intervalA = setInterval(() => {
      fetchGPTA();
    }, 5000);

    const intervalB = setInterval(() => {
      fetchGPTB();
    }, 80000);

    const intervalC = setInterval(() => {
      fetchGPTC();
    }, 100000);

    return () => {
      clearInterval(intervalA);
      clearInterval(intervalB);
      clearInterval(intervalC);
    };
  }, [fetchGPTA]);

  // オセロのLINE画面と同じ仕組み

  return (
    <div className={styles.container}>
      {/* <ChatWindow name="A" messages={messagesList1 || []} /> */}
      <ChatWindow name="A" messages={messagesList1} />
      <ChatWindow name="B" messages={messagesList2} />
      <ChatWindow name="C" messages={messagesList3} />
    </div>
  );
};
export default LangChain;

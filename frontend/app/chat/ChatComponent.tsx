'use client'
import {useRouter, useSearchParams} from 'next/navigation'
import React, {useEffect, useRef, useState} from 'react'
import SockJS from 'sockjs-client';
import Stomp, {Client} from 'stompjs';
import {router} from "next/client";

const ChatComponent = () => {
    const searchParams = useSearchParams();
    const [stompClient, setStompClient] = useState<Client | null>(null);

    const selectedUserRef = useRef(null);
    const [nickname, setNickname] = useState<string | null>('');
    const [fullname, setFullname] = useState<string | null>('');
    const [selectedUserId, setSelectedUserId] = useState<string | null>('');
    const [connectedUsers, setConnectedUsers] = useState<any[]>([]);
    const [message, setMessage] = useState<any>('');
    const [user, setUser] = useState<any>('');
    const [showNotification, setShowNotification] = useState<boolean>(false);
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState<{ [key: string]: number }>({});
    const [newUser, setNewUser] = useState<string>('');
    const [isUserConnected, setIsUserConnected] = useState<boolean>(false);
    const [isUserDisconnected, setIsUserDisconnected] = useState<boolean>(false);
    const router = useRouter();

    function onMessageReceived(payload: Stomp.Message) {
        findAndDisplayConnectedUsers().then();
        const message = JSON.parse(payload.body);

        const selectedUser = selectedUserRef.current;
        if (selectedUser && selectedUser === message.senderId) {

            displayMessage(message.senderId, message.content);
            showNotificationBanner();
        }


        setUnreadMessagesCount((prevCount) => ({
            ...prevCount,
            [message.senderId]: (prevCount[message.senderId] || 0) + 1,
        }));
        const notifiedUser = connectedUsers.find((user) => user.nickName === message.senderId);
        if (notifiedUser && selectedUserId !== message.senderId) {
            const updatedConnectedUsers = connectedUsers.map((user) =>
                user.nickName === message.senderId ? {...user, unreadMessages: (user.unreadMessages || 0) + 1} : user
            );
            setConnectedUsers(updatedConnectedUsers);
        }
    }

    function showNotificationBanner() {
        setShowNotification(true);
        setTimeout(() => {
            setShowNotification(false);
        }, 5000); // Hide notification after 5 seconds
    }

    async function findAndDisplayConnectedUsers() {

        const connectedUsersResponse = await fetch('http://localhost:8088/users');
        let connectedUsers = await connectedUsersResponse.json();
        connectedUsers = connectedUsers.filter((user: { nickName: string | null; }) => user.nickName !== nickname);
        setConnectedUsers(connectedUsers);
    }

    function logTheMessage(payload: Stomp.Message) {
        const user = JSON.parse(payload.body);
        findAndDisplayConnectedUsers().then();
        setNewUser(user.nickName);
        if (user.status === 'ONLINE' && user.nickName !== nickname) {

            setIsUserConnected(true);
        } else if (user.status === 'OFFLINE' && user.nickName !== nickname) {
            setIsUserDisconnected(true);
        }
        setTimeout(() => {
            setIsUserConnected(false);
            setIsUserDisconnected(false);
        }, 2000);

    }

    function onConnected() {
        stompClient?.subscribe(`/topic/public`, logTheMessage);
        stompClient?.subscribe(`/user/${nickname}/queue/messages`, onMessageReceived);
        stompClient?.send("/app/user.addUser",
            {},
            JSON.stringify({nickName: nickname, fullName: fullname, status: 'ONLINE'})
        );


        setUser(nickname);
        findAndDisplayConnectedUsers().then();
    }

    function onError() {

    }

    useEffect(() => {
        if (stompClient && !stompClient.connected) {
            stompClient.connect({}, onConnected, onError);
        }
    }, [stompClient]);
    useEffect(() => {
        if (nickname && fullname) {
            const socket = new SockJS('http://localhost:8088/ws');
            setStompClient(Stomp.over(socket));
        }
    }, [nickname, fullname]);
    useEffect(() => {
        setNickname(searchParams.get('nickname'));
        setFullname(searchParams.get('fullname'));
    }, [searchParams])

    function handleSubmit(event: any) {
        const messageContent = message.trim();
        if (messageContent && stompClient) {
            const chatMessage = {
                senderId: nickname,
                recipientId: selectedUserId,
                content: messageContent,
                timestamp: new Date()
            };
            stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
            // @ts-ignore
            displayMessage(nickname, messageContent);
        }
        setMessage('');
        event.preventDefault();
    }


    function onLogout() {
        // @ts-ignore
        stompClient.send("/app/user.disconnectUser",
            {},
            JSON.stringify({nickName: nickname, fullName: fullname, status: 'OFFLINE'})
        );

        router.push('/');
    }

    async function fetchAndDisplayUserChat() {


        if (selectedUserId) {

            const userChatResponse = await fetch(`http://localhost:8088/messages/${nickname}/${selectedUserId}`);
            const userChat = await userChatResponse.json();
            setChatHistory(userChat);
        }
    }

    useEffect(() => {
        if (selectedUserId) {
            // @ts-ignore
            //this is dumb but it works
            selectedUserRef.current = selectedUserId;
            fetchAndDisplayUserChat().then();
        }
    }, [selectedUserId]);

    function displayMessage(senderId: string, content: string) {
        setChatHistory((prevChatHistory) => [
            ...prevChatHistory,
            {senderId, content, timestamp: new Date()},
        ]);
    }

    return (
        <div className="h-screen font-sans bg-gray-100 flex flex-col">
            <h2 className="text-center text-2xl font-bold py-8 bg-indigo-600 text-white">{user}</h2>
            <div className="flex h-full">
                {/* Users List */}
                <div className="w-1/4 bg-white rounded-lg shadow-md p-4 overflow-y-auto flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-medium mb-2">Online Users</h2>
                        <ul id="connectedUsers" className="list-none space-y-2">
                            {connectedUsers.map((user, index) => (
                                <li
                                    key={index}
                                    className={`border-b border-gray-300 p-2 flex items-center cursor-pointer ${
                                        selectedUserId === user.nickName ? 'bg-gray-200' : ''
                                    }`}
                                    onClick={() => {
                                        setSelectedUserId(user.nickName);
                                        // Reset unread messages count when user is selected
                                        setUnreadMessagesCount((prevCount) => ({...prevCount, [user.nickName]: 0}));
                                    }}
                                >
                                    <img
                                        src="https://i.pravatar.cc/40"
                                        alt="User Avatar"
                                        className="w-8 h-8 rounded-full mr-2"
                                    />
                                    <span className="font-medium relative">
                        {user.nickName}
                                        {unreadMessagesCount[user.nickName] > 0 && (
                                            <span
                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2">
                                {unreadMessagesCount[user.nickName]}
                            </span>
                                        )}
                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-4">
                        <p id="connected-user-fullname" className="font-medium text-gray-700">
                            {user}
                        </p>
                        <div className="text-indigo-600 hover:underline" onClick={() => onLogout()}>
                            Logout
                        </div>
                    </div>
                    {isUserConnected && (
                        <div
                            className="absolute bottom-0 mb-4 w-[250px] p-4 bg-green-500 text-white rounded-md shadow-md">
                            {`${newUser} has joined the chat`}
                        </div>
                    )}
                    {isUserDisconnected && (
                        <div
                            className="absolute bottom-0 mb-4 w-[250px] p-4 bg-red-500 text-white rounded-md shadow-md">
                            {`${newUser} has left the chat`}
                        </div>
                    )}

                </div>

                {/* Chat Area */}
                <div className="w-3/4 bg-white rounded-lg shadow-md p-4 flex flex-col">
                    {selectedUserId ? (
                        <>
                            <div id="chat-messages" className="flex-1 overflow-y-auto mb-4">
                                {chatHistory.map((chat, index) => (
                                    <div
                                        key={index}
                                        className={`mb-4 flex ${
                                            chat.senderId === nickname ? 'justify-end' : 'justify-start'
                                        } items-end`}
                                    >
                                        <div
                                            className={`bg-gray-200 rounded-lg p-3 ${
                                                chat.senderId === nickname ? 'self-end bg-indigo-500 text-white' : 'self-start '
                                            }`}
                                        >
                                            {chat.content}
                                        </div>
                                        <img src="https://i.pravatar.cc/40" alt="User Avatar"
                                             className="w-8 h-8 rounded-full ml-2"/>
                                    </div>
                                ))}
                            </div>
                            <form id="messageForm" className="flex items-center" onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    onChange={(e) => setMessage(e.target.value)}
                                    id="message"
                                    value={message}
                                    placeholder="Type your message..."
                                    className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-r-md px-4 py-2"
                                >
                                    Send
                                </button>
                            </form>
                        </>
                    ) : (
                        <p className="text-center text-gray-500">Select a user to start chatting.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChatComponent

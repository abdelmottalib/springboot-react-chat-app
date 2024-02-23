'use client'
import {useRouter, useSearchParams} from 'next/navigation'
import React, {useEffect, useRef, useState} from 'react'
import SockJS from 'sockjs-client';
import Stomp, {Client} from 'stompjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import {router} from "next/client";

const ChatComponent = () => {
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
    const [sender, setSender] = useState<{nickName:string, fullName:string, status:"ONLINE"|"OFFLINE"} | null>(null);
    const [recipient, setRecipient] = useState<{nickName:string, fullName:string, status:"ONLINE"|"OFFLINE"} | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();

    function onMessageReceived(payload: Stomp.Message) {
        findAndDisplayConnectedUsers().then();
        console.log("received message");
        const message = JSON.parse(payload.body);
        console.log(message);
        const recipient = selectedUserRef.current;
        console.log("the recipi: ", recipient);
        if (recipient && recipient === message.senderId) {
            displayMessage(message.senderId, message.content);
            showNotificationBanner();
        }
        console.log(message.senderId, message.content, message.timestamp);
        setUnreadMessagesCount((prevCount) => ({
            ...prevCount,
            [message.senderId]: (prevCount[message.senderId] || 0) + 1,
        }));
        console.log("unreadMessagesCount", unreadMessagesCount);
        const notifiedUser = connectedUsers.find((user) => user.nickName === message.senderId);
        if (notifiedUser && selectedUserId !== message.senderId) {
            const updatedConnectedUsers = connectedUsers.map((user) =>
                user.nickName === message.senderId ? {...user, unreadMessages: (user.unreadMessages || 0) + 1} : user
            );
            setConnectedUsers(updatedConnectedUsers);
        }
    }
    useEffect(() => {
        console.log(unreadMessagesCount);
    }, [unreadMessagesCount]);
    function showNotificationBanner() {
        setShowNotification(true);
        setTimeout(() => {
            setShowNotification(false);
        }, 4000);
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
        // @ts-ignore
        setSender({nickName: nickname, fullName: fullname, status: "ONLINE"});

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

    function handleSubmit(event:React.FormEvent) {
        const messageContent = message.trim();
        // @ts-ignore
        setUnreadMessagesCount((prevCount) => ({...prevCount, [selectedUserId]: 0}));
        if (messageContent && stompClient) {
            const chatMessage = {
                sender,
                recipient,
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
        console.log("sender", sender, "recipient", recipient)
        console.log("selectedUserId", selectedUserId, "nickname", nickname)
        if (selectedUserId && sender && recipient) {
            console.log(sender, recipient)
            const userChatResponse = await fetch(`http://localhost:8088/messages/${sender.nickName}/${recipient.nickName}`);
            const userChat = await userChatResponse.json();
            console.log("userChat" + userChat);
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
        <div className="h-screen font-sans bg-gray-100 flex flex-col h-full">
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

                                        setRecipient({
                                            nickName: user.nickName,
                                            fullName: user.fullName,
                                            status: "ONLINE"
                                        });
                                        // Reset unread messages count when user is selected
                                        setUnreadMessagesCount((prevCount) => ({ ...prevCount, [user.nickName]: 0 }));
                                    }}
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-400 mr-2 flex items-center justify-center">
                                        <FontAwesomeIcon icon={faUser} className="text-white" />
                                    </div>
                                    <span className="font-medium relative">
                                    {user.nickName}
                                        {unreadMessagesCount[user.nickName] > 0 && (
                                            <span
                                                className="absolute w-[15px] -left-4 h-[15px] flex items-center text-xs justify-center bg-red-500 text-white rounded-full -mr-2 -mt-2">
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
                            className="absolute bottom-0 mb-4 w-[250px] p-4 text-white rounded-md shadow-md">
                            {`${newUser} has left the chat`}
                        </div>
                    )}
                </div>

                {/* Chat Area */}
                <div className="w-3/4 bg-white max-h-full rounded-lg shadow-md p-4 flex flex-col justify-between overflow-hidden">
                    {selectedUserId ? (
                        <>
                            <div id="chat-messages" className=" overflow-y-auto mb-4 max-h-[670px]  2xl:max-h-[2350px]">
                                {chatHistory.map((chat, index) => (
                                    <div
                                        key={index}
                                        className={`mb-4 flex ${
                                            chat.senderId === nickname ? 'justify-end' : 'justify-start'
                                        } items-end`}
                                    >
                                        <div
                                            className={`bg-gray-200 rounded-lg p-3 ${
                                                chat.senderId === nickname
                                                    ? 'self-end bg-indigo-500 text-white'
                                                    : 'self-start '
                                            }`}
                                        >
                                            {chat.content}
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-400 ml-2 flex items-center justify-center">
                                            <FontAwesomeIcon icon={faUser} className="text-white" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <form
                                id="messageForm"
                                className="flex items-center"
                                onSubmit={handleSubmit}
                            >
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
                        <p className="text-center text-gray-500">
                            Select a user to start chatting.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChatComponent

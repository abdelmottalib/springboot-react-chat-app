package com.konami.websocket.chatroom;

import com.konami.websocket.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, String> {
    Optional<ChatRoom> findBySenderAndRecipient(User senderId, User recipientId);
    Optional<ChatRoom> findByChatIdAndSenderAndRecipient(String chatId, User senderId, User recipientId);

    Optional<ChatRoom> findByChatId(String chatRoomId);
}

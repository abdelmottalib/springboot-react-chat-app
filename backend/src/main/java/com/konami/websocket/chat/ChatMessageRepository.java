package com.konami.websocket.chat;

import com.konami.websocket.chatroom.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    List<ChatMessage> findByChatRoom(Optional<ChatRoom> chatRoom);
}

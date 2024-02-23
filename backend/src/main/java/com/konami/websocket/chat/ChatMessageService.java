package com.konami.websocket.chat;

import com.konami.websocket.chatroom.ChatRoom;
import com.konami.websocket.chatroom.ChatRoomRepository;
import com.konami.websocket.chatroom.ChatRoomService;
import com.konami.websocket.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {
    private final ChatMessageRepository repository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomService chatRoomService;

    public ChatMessage save(ChatMessage chatMessage) {
        var chatRoomId = chatRoomService
                .getChatRoomId(chatMessage.getSender(), chatMessage.getRecipient(), true)
                .orElseThrow();
        ChatRoom chatRoom = chatRoomRepository.findByChatId(chatRoomId)
                .orElseGet(() -> {
                    return ChatRoom.builder()
                            .chatId(chatRoomId)
                            .sender(chatMessage.getSender())
                            .recipient(chatMessage.getRecipient())
                            .build();
                });


        chatMessage.setChatRoom(chatRoom);
        repository.save(chatMessage);
        return chatMessage;
    }

    public List<ChatMessage> findChatMessages(User sender, User recipient) {
        var chatroom = chatRoomRepository.findBySenderAndRecipient(sender, recipient);
        if (chatroom.isEmpty()) {
            chatroom = chatRoomRepository.findBySenderAndRecipient(recipient, sender);
        }
        return repository.findByChatRoom(chatroom);
    }
}

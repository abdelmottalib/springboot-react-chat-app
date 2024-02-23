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
        System.out.println("the chat message is: " + chatMessage.toString());
        var chatRoomId = chatRoomService
                .getChatRoomId(chatMessage.getSender(), chatMessage.getRecipient(), true)
                .orElseThrow(); // You can create your own dedicated exception
        ChatRoom chatRoom = chatRoomRepository.findByChatId(chatRoomId)
                .orElseGet(() -> {
                    System.out.println("Creating a new ChatRoom");
                    return ChatRoom.builder()
                            .chatId(chatRoomId)
                            .sender(chatMessage.getSender())  // Set the sender
                            .recipient(chatMessage.getRecipient())  // Set the recipient
                            .build();
                });


        chatMessage.setChatRoom(chatRoom);

//        var chatRoom = ChatRoom.builder().chatId(chatRoomId).build();
//        chatMessage.setChatRoom(chatRoom);
        repository.save(chatMessage);
        return chatMessage;
    }

    public List<ChatMessage> findChatMessages(User sender, User recipient) {
        System.out.println("inside the findChatMessages method");
        System.out.println("the sender is: " + sender);
        System.out.println("the recipient is: " + recipient);
//        var chatroom = chatRoomService.getChatRoomId(sender, recipient, false);
        var chatroom =  chatRoomRepository.findBySenderAndRecipient(sender, recipient);
        if (chatroom.isEmpty()) {
            chatroom = chatRoomRepository.findBySenderAndRecipient(recipient, sender);
        }
        System.out.println("the chatroom is: " + chatroom);
        System.out.println("hehdaf: " + repository.findByChatRoom(chatroom));
        return repository.findByChatRoom(chatroom);
    }
}

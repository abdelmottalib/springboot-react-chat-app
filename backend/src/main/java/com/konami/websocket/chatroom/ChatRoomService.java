package com.konami.websocket.chatroom;

import com.konami.websocket.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;

    public Optional<String> getChatRoomId(
            User sender,
            User recipient,
            boolean createNewRoomIfNotExists
    ) {
//        System.out.println("the chat id is :" + chatRoomRepository.findBySenderAndRecipient(sender, recipient));
        System.out.println("the sender is from chatroom: " + sender.getNickName());
        System.out.println("the recipient is from chatroom: " + recipient.getNickName());
        return chatRoomRepository
                .findBySenderAndRecipient(sender, recipient)
                .map(ChatRoom::getChatId)
                .or(() -> {
                    System.out.println("entered the or block");
                    System.out.println("the sender is: " + sender);
                    System.out.println("the recipient is: " + recipient);
                    if (createNewRoomIfNotExists) {
                        var chatId = createChatId(sender, recipient);
                        return Optional.of(chatId);
                    }

                    return Optional.empty();
                });
    }

    private String createChatId(User sender, User recipient) {
        var chatId = String.format("%s_%s", sender.getNickName(), recipient.getNickName());
        System.out.println("in the createChatId method");
        System.out.println("the chat id is: " + chatId);
        ChatRoom senderRecipient = ChatRoom
                .builder()
                .chatId(chatId)
                .sender(sender)
                .recipient(recipient)
                .build();

//        ChatRoom recipientSender = ChatRoom
//                .builder()
//                .chatId(chatId)
//                .sender(recipient)
//                .recipient(sender)
//                .build();

        chatRoomRepository.save(senderRecipient);
//        chatRoomRepository.save(recipientSender);

        return chatId;
    }
}

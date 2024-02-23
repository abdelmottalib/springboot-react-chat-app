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
        return chatRoomRepository
                .findBySenderAndRecipient(sender, recipient)
                .map(ChatRoom::getChatId)
                .or(() -> chatRoomRepository.findBySenderAndRecipient(recipient, sender)
                        .map(ChatRoom::getChatId))
                .or(() -> {
                    if (createNewRoomIfNotExists) {
                        var chatId = createChatId(sender, recipient);
                        return Optional.of(chatId);
                    }

                    return Optional.empty();
                });
    }

    private String createChatId(User sender, User recipient) {
        var chatId = String.format("%s_%s", sender.getNickName(), recipient.getNickName());
        ChatRoom senderRecipient = ChatRoom
                .builder()
                .chatId(chatId)
                .sender(sender)
                .recipient(recipient)
                .build();
        chatRoomRepository.save(senderRecipient);
        return chatId;
    }
}

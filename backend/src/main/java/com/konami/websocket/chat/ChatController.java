package com.konami.websocket.chat;

import com.konami.websocket.user.User;
import com.konami.websocket.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Controller
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;
    private final UserService userService;

    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessage chatMessage) {
        ChatMessage savedMsg = chatMessageService.save(chatMessage);
        messagingTemplate.convertAndSendToUser(
                chatMessage.getRecipient().getNickName(), "/queue/messages",
                new ChatNotification(
                        savedMsg.getId(),
                        savedMsg.getSender().getNickName(),
                        savedMsg.getRecipient().getNickName(),
                        savedMsg.getContent()
                )
        );
    }

    @GetMapping("/messages/{senderNickName}/{recipientNickName}")
    public ResponseEntity<List<ChatMessage>> findChatMessages(
            @PathVariable String senderNickName,
            @PathVariable String recipientNickName) {
        User sender = userService.findUserByNickName(senderNickName);
        User recipient = userService.findUserByNickName(recipientNickName);
        return ResponseEntity.ok(chatMessageService.findChatMessages(sender, recipient));
    }
}

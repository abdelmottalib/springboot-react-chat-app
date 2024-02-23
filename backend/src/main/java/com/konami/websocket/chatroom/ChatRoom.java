package com.konami.websocket.chatroom;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.konami.websocket.chat.ChatMessage;
import com.konami.websocket.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class ChatRoom {
    @Id
    @GeneratedValue
    private Long id;

    private String chatId;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient;

    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL)
    private List<ChatMessage> messages;
    @Override
    public String toString() {
        return "ChatRoom(id=" + id + ", chatId=" + chatId + ", messageCount=" + messages.size() + ")";
    }
}

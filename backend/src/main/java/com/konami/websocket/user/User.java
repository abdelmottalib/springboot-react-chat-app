package com.konami.websocket.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.konami.websocket.chat.ChatMessage;
import com.konami.websocket.user.Status;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;


@Getter
@Setter
@Entity
@Table(name = "users")
public class User {
    @Id
    private String nickName;
    private String fullName;

    @Enumerated(EnumType.STRING)
    private Status status;

    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<ChatMessage> sentMessages;

    @OneToMany(mappedBy = "recipient", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<ChatMessage> receivedMessages;
}

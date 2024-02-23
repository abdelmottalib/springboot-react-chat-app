package com.konami.websocket.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository  extends JpaRepository<User, String> {
    List<User> findAllByStatus(Status status);
    User findByNickName(String nickName);
}
